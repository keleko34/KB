define([],function(){

  var _start = "{{",
      _end = "}}",
      _filters = {};

  var regTest = new RegExp('('+_start+'(.*?)'+_end+')','g'),
      regStrip = new RegExp('(\\'+_end+'.*)|(\\|.*)','g'),
      regreplace = new RegExp('['+_start+'\\s'+_end+']','g');

  function set(value)
  {
    var _bind = this.binder.binds[this.name],
        _name = this.name,
        _binder = this.binder;

    for(var x=0,len=_bind.filters.length;x<len;x++)
    {
      value = (typeof _binder.filters[_bind.filters[x]] === 'function' ? _binder.filters[_bind.filters[x]](value) : (_filters[_bind.filters[x]] !== undefined ? _filters[_bind.filters[x]](value) : value));
    }

    _bind.value = value;

    _binder.target[_binder.prop] = _binder.texts.reduce(function(str,k){
      if(k.match(regTest))
      {
        var name = k.replace(regStrip,'$1').replace(regreplace,'');
        str += _binder.binds[name].value;
      }
      else
      {
        str += k;
      }
      return str;
    },"")
  }

  function splitMap(s)
  {
    return Array.prototype.concat.apply([],s.split(_start).map(function(k,i){
      return (k.indexOf(_end) > -1 ? (_start+k).split(_end).map(function(d,x){
        return (d.indexOf(_start) > -1 ? d+_end : d);
      }) : k);
    })).filter(function(k,i){
      return (k.length > 0);
    });
  }

  function splitFilter(b)
  {
    var regStart = new RegExp('((\\'+_start+'.*)(\\|))','g'),
        regreplace = new RegExp('[\\s\\'+_end+']','g');
    if(regStart.test(b))
    {
      return b.replace(regStart,'').replace(regreplace,'').split(',');
    }
    return [];
  }

  function checkUnsynced(binds)
  {
    for(var x=0,len=binds.length;x<len;x++)
    {
      if(binds[x].element.parentElement === null)
      {
        binds.splice(x,1);
      }
    }
    return binds;
  }

  function splitFor(b)
  {
    var reg = new RegExp('[\\'+_start+'\\s\\'+_end+']','g'),
        split = b.split(reg);
    return {
      key:split[1],
      bind:split[3]
    };
  }

  function map()
  {

    return map;
  }

  map.mapComponent = function(element)
  {
    function loopCheck(childNodes)
    {
      var attrs = {},
          binds = [],
          split = [],
          bind = {};
      for(var x=0,len=childNodes.length;x<len;x++)
      {
        if(childNodes[x].nodeType === 3)
        {
          if(childNodes[x].textContent.match(regTest))
          {
            split = splitMap(childNodes[x].textContent);
            bind = {text:childNodes[x].textContent,texts:split,binds:{},filters:{},target:childNodes[x],prop:'textContent',element:childNodes[x],listener:"textContent"};

            bind.binds = split.reduce(function(O,k){
              if(k.match(regTest))
              {
                var name = k.replace(regStrip,'$1').replace(regreplace,'');
                O[name] = {text:k,value:"",filters:splitFilter(k),set:set.bind({name:name,binder:bind})};
              }
              return O;
            },{});

            binds.push(bind);
          }
        }
        else
        {
          if(!(childNodes[x] instanceof HTMLUnknownElement))
          {
            attrs = childNodes[x].attributes;
            for(var i=0,lenn=attrs.length;i<lenn;i++)
            {
              if(attrs[x].value.match(regTest))
              {
                if(attrs[x].name === 'data-bind')
                {
                  split = splitFor(attrs[x].value);
                  binds.push({text:attrs[x].value,texts:split,target:attrs[x],prop:'for',element:childNodes[x]});
                }
                else
                {
                  split = splitMap(attrs[x].value);
                  bind = {text:attrs[x].value,texts:split,binds:{},target:attrs[x],prop:'value',element:childNodes[x],listener:attrs[x].name};
                  bind.binds = split.reduce(function(O,k){
                    if(k.match(regTest))
                    {
                      var name = k.replace(regStrip,'$1').replace(regreplace,'');
                      O[name] = {text:k,value:"",filters:splitFilter(k),set:set.bind({name:name,binder:bind})};
                    }
                    return O;
                  },{});
                  binds.push(bind);
                }
              }
            }
            if(childNodes[x].childNodes.length !== 0) binds = binds.concat(loopCheck(childNodes[x].childNodes));
          }
        }
      }
      return binds;
    }

    return loopCheck(element.childNodes);
  }

  map.checkUnsynced = function(binds)
  {
    for(var x=0,len=binds.length;x<len;x++)
    {
      if(binds[x].element.parentElement === null)
      {
        binds.splice(x,1);
      }
    }
    return binds;
  }

  map.start = function(v){
    if(v === undefined){
      return _start;
    }
    _start = (typeof v === 'string' ? v : _start);
    return map;
  }

  map.end = function(v){
    if(v === undefined){
      return _end;
    }
    _end = (typeof v === 'string' ? v : _end);
    return map;
  }

  return map;
});
