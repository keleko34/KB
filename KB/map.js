define([],function(){

  var _start = "{",
      _end = "}",
      _filters = {};

  var regTest = new RegExp('('+_start+'(.*?)'+_end+')','g'),
      regStrip = new RegExp('(\\'+_end+'.*)|(\\|.*)','g'),
      regreplace = new RegExp('['+_start+_end+']','g');

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

    _binder.target[_binder.property] = _binder.texts.reduce(function(str,k){
      if(regTest.test(k))
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
          if(regTest.test(childNodes[x].textContent))
          {
            split = splitMap(childNodes[x].textContent);
            bind = {text:childNodes[x].textContent,texts:split,binds:{},filters:{},target:childNodes[x],prop:'textContent',element:childNodes[x]};

            bind.binds = split.reduce(function(O,k){
              if(regTest.test(k))
              {
                var name = k.replace(regStrip,'$1').replace(regreplace,'');
                O[name] = {text:k,value:"",filters:splitFilter(k),set:set.bind({name:name,binder:bind})});
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
              if(regTest.test(attrs[x].value))
              {
                split = splitMap(attrs[x].value);
                binds.push({texts:split,binds:split.reduce(function(O,k){
                  if(regTest.test(k)) O.push({name:k.replace(regStrip,'$1').replace(regreplace,''),text:k,filters:splitFilter(k)});
                  return O;
                },[]),target:attrs[x],prop:'value',element:childNodes[x]});
              }
            }
            binds.concat(loopCheck(childNodes[x].childNodes));
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
