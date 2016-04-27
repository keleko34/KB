var CreateKB_Bind = (function(){
  function CreateKB_Bind()
  {
    /* BUILD SECTION */
      var CreateBind = (function(){
  function CreateBind()
  {
    function Bind()
    {

    }

    return Bind;
  }
  return CreateBind;
}());;

      var CreateDiff = (function(){
  function CreateDiff()
  {
    function Diff(o,n)
    {
      o = o.replace(/\s+$/,'');
      n = n.replace(/\s+$/,'');

      o = (typeof o === 'string' ? (o == "" ? [] : o.split(/\s+/)) : o);
      n = (typeof n === 'string' ? (n == "" ? [] : n.split(/\s+/)) : n);

      return Diff.diffString(o,n);
    }

    Diff.convertWordArrToObj = function(arr,otherStr)
    {
      return arr.reduce(function(o,v,i){
       o[v] = (o[v] === undefined ? Object.defineProperty({rows:[i]},otherStr,{value:null,writable:true}) : (o[v].rows.push(i) ? o[v] : Object.defineProperty({rows:[i]},otherStr,{value:null,writable:true})));
       return o;
      },{});
    }

    Diff.diffString = function(o,n)
    {
      var ns = Diff.convertWordArrToObj(n,'o'),
          os = Diff.convertWordArrToObj(o,'n'),
          i = 0;

      Object.keys(ns).forEach(function(k){
        if ( ns[k].rows.length == 1 && typeof(os[k]) != "undefined" && os[k].rows.length == 1 ) {
          n[ ns[k].rows[0] ] = { text: n[ ns[k].rows[0] ], row: os[k].rows[0] };
          o[ os[k].rows[0] ] = { text: o[ os[k].rows[0] ], row: ns[k].rows[0] };
        }
      });


      for (i=0;i< n.length-1;i+=1) {
        if ( n[i].text != null && n[i+1].text == null && n[i].row + 1 < o.length && o[ n[i].row + 1 ].text == null &&
             n[i+1] == o[ n[i].row + 1 ] ) {
          n[i+1] = { text: n[i+1], row: n[i].row + 1 };
          o[n[i].row+1] = { text: o[n[i].row+1], row: i + 1 };
        }
      }

      for (i=n.length-1;i>0;i-=1) {
        if ( n[i].text != null && n[i-1].text == null && n[i].row > 0 && o[ n[i].row - 1 ].text == null &&
             n[i-1] == o[ n[i].row - 1 ] ) {
          n[i-1] = { text: n[i-1], row: n[i].row - 1 };
          o[n[i].row-1] = { text: o[n[i].row-1], row: i - 1 };
        }
      }
      return Array.prototype.concat.apply([],[o,n]).map(function(k,i){
            return (i < (o.length) ? {pos:i,change:(typeof k === 'string' && (n[i] !== k) ? 'delete' : 'none'),value:(typeof k === 'string' ? k : k.text),rowObj:(typeof k === 'object' ? k : null)} :
                   {pos:(i-(o.length)),change:(typeof k === 'string' && (o[i-(o.length)] !== k) ? 'add' : 'none'),value:(typeof k === 'string' ? k : k.text),rowObj:(typeof k === 'object' ? k : null)});
      }).filter(function(k,i){
        return ((i > (o.length-1) && k.rowObj !== null) ?
                (typeof n[(i-(o.length))] === 'object' ? (o[n[(i-(o.length))].row].text !== n[(i-(o.length))].text) : true) :
                (i > (o.length-1)) ? (n[(i-(o.length))] !== o[(i-(o.length))]) : true);
      }).sort(function(a,b){
        return (a.pos > b.pos ? 1 : -1);
      });
    }
    return Diff;
  }
  return CreateDiff;
}());
      var CreateKB = (function(){
	function CreateKB(){

        var _attrListeners = {}
          , _attrUpdateListeners = {};

        function Bind()
        {
          var changeEvent = function(el,attr,value,oldValue,args){
            this.stopPropagation = function(){this._stopPropogation = true;};
            this.preventDefault = function(){this._preventDefault = true;};
            this.value = value;
            this.oldValue = oldValue;
            this.target = el;
            this.attr = attr;
            this.arguments = args;
          }

          var set = function(el,prop,val,ret,args){
            var e = new changeEvent(el,prop,val,ret,args);
            if(_attrListeners[prop] !== undefined)
            {
              for(var x=0;x<_attrListeners[prop].length;x+=1)
              {
                _attrListeners[prop][x].call(el,e);
                if(e._stopPropogation)
                {
                  return true;
                }
                if(e._preventDefault)
                {
                  return false;
                }
              }
            }
            return true;
          }

          var update = function(el,prop,val,ret,args){
            var e = new changeEvent(el,prop,val,ret,args);
            if(_attrUpdateListeners[prop] !== undefined)
            {
              for(var x=0;x<_attrUpdateListeners[prop].length;x+=1)
              {
                _attrUpdateListeners[prop][x].call(el,e);
                if(e._stopPropogation)
                {
                  return true;
                }
                if(e._preventDefault)
                {
                  return false;
                }
              }
            }
            return true;
          }

          Bind.inject(Node,set,update);
          Bind.inject(Element,set,update);
          Bind.inject(HTMLElement,set,update);
          Bind.inject(Document,set,update);
        }

        Bind.inject = function(obj,set,update){
          var _proto = obj.prototype,
              _keys = Object.keys(_proto),
              x,
              _descriptors = {},
              _functions = {};

          for(x=0;x<_keys.length;x+=1)
          {
              (function(key){
                  _descriptors[key] = Object.getOwnPropertyDescriptor(_proto,key);
                  if(_descriptors[key].set !== undefined)
                  {
                      Object.defineProperty(_proto,key,{
                          get:_descriptors[key].get,
                          set:function(v)
                          {
                              var oldValue = _descriptors[key].get.apply(this);
                              if(set(this,key,v,oldValue))
                              {
                                _descriptors[key].set.apply(this,arguments);
                              }
                              if(typeof update === 'function')
                              {
                                update(this,key,v,oldValue);
                              }
                          },
                          enumerable:true,
                          configurable:true
                      });
                  }
                  else if(typeof _descriptors[key].value === 'function')
                  {
                      _functions[key] = _descriptors[key].value;
                      _proto[key] = function()
                      {
                          var action = null;
                          if(set(this,key,null,null,arguments))
                          {
                            action = _functions[key].apply(this,arguments);
                          }
                          if(typeof update === 'function')
                          {
                            update(this,key,null,null,arguments,action);
                          }
                          return action;
                      }
                  }
              }(_keys[x]))
          }
          return Bind;
        }

        Bind.addAttrListener = function(attr,func)
        {
          if(_attrListeners[attr] === undefined)
          {
            _attrListeners[attr] = [];
          }
          if(typeof func === 'function')
          {
            _attrListeners[attr].push(func);
          }
          return Bind;
        }

        Bind.addAttrUpdateListener = function(attr,func)
        {
          if(_attrUpdateListeners[attr] === undefined)
          {
            _attrUpdateListeners[attr] = [];
          }
          if(typeof func === 'function')
          {
            _attrUpdateListeners[attr].push(func);
          }
          return Bind;
        }

        Bind.removeAttrListener = function(attr,func)
        {
          if(_attrListeners[attr] !== undefined && typeof func === 'function')
          {
            for(var x=0;x<_attrListeners[attr].length;x+=1)
            {
              if(_attrListeners[attr][x].toString() === func.toString())
              {
                _attrListeners[attr].splice(x,1);
              }
            }
          }
        }

        Bind.removeAttrUpdateListener = function(attr,func)
        {
          if(_attrUpdateListeners[attr] !== undefined && typeof func === 'function')
          {
            for(var x=0;x<_attrUpdateListeners[attr].length;x+=1)
            {
              if(_attrUpdateListeners[attr][x].toString() === func.toString())
              {
                _attrUpdateListeners[attr].splice(x,1);
              }
            }
          }
        }

        return Bind;
	}
    if (typeof define === "function" && define.amd)
    {
      define('KB',CreateKB); //global KM define in browser
      define([],CreateKB); //define if file refrenced
    }
    else if (typeof module === "object" && module.exports)
    {
      module.exports = CreateKB;
    }
	return CreateKB;
}());

      var CreateBindNode = (function(){
  function CreateBindNode()
  {
    var _node = {}
      , _Binds = []
      , _initialText = ""
      , _textMap = []
      , _updatedText = ""
      , _isAttr = false
      , _startBind = "{{"
      , _endBind = "}}"
      , _diff = CreateDiff()

    function BindNode(node)
    {
      _node = node;
      _initialText = node.textContent;
      if(_isAttr)
      {
        _initialText = node.value;
      }
      _textMap = BindNode.splitBind(_initialText);

      _textMap.forEach(function(k,i){
        if(k.indexOf(_startBind) > -1 && k.indexOf(_endBind) > -1)
        {
          _Binds.push(CreateBind().bindName(k.split('|')[0].replace(_startBind,'').replace(/\s/g,''))
          .bindStartPosition((_isAttr ? _node.value : _node.textContent).indexOf(k))
          .bindText(k)
          .attributes(k.split('|')[1].replace(_endBind).split(';').filter(function(d,x){
            return (d.length > 0);
          }).map(function(d,x){
            var ret = {};
            ret[d.split('=')[0]] = d.split('=')[1];
            return ret;
          })));
          if(_isAttr)
          {
            _node.value = _Binds[_Binds.length-1](_node.value);
          }
          else
          {
            _node.textContent = _Binds[_Binds.length-1](_node.textContent);
          }
        }
      });
      _updatedText = (_isAttr ? _node.value : _node.textContent);
      _textMap.map(function(k,i){
        return (k.indexOf(_startBind) > -1 && k.indexOf(_endBind) ? {bind:BindNode.getBindById(k.split('|')[0].replace(_startBind,'').replace(/\s/g,'')),name:k.split('|')[0].replace(_startBind,'').replace(/\s/g,'')} : k);
      });
    }

    BindNode.startBind = function(v)
    {
      if(v === undefined)
      {
        return _startBind;
      }
      _startBind = (typeof v === 'string' ? v : _startBind);
      return BindNode;
    }

    BindNode.endBind = function(v)
    {
      if(v === undefined)
      {
        return _endBind;
      }
      _endBind = (typeof v === 'string' ? v : _endBind);
      return BindNode;
    }

    BindNode.node = function()
    {
      return _node;
    }

    BindNode.Binds = function()
    {
      return _Binds;
    }

    BindNode.initialText = function()
    {
      return _initialText;
    }

    BindNode.initialTextSplit = function()
    {
      return _initialTextSplit;
    }

    BindNode.isAttr = function(v)
    {
      if(v === undefined)
      {
        return _isAttr;
      }
      _isAttr = !!v;
      return BindNode;
    }

    BindNode.splitBind = function(t)
    {
      return Array.prototype.concat.apply([],t.split(_startBind).map(function(k,i){
        return (k.indexOf(_endBind) > -1 ? (_startBind+k).split(_endBind).map(function(d,x){
          return (d.indexOf(_startBind) > -1 ? d+_endBind : d);
        }) : k);
      })).filter(function(k,i){
        return (k.length > 0);
      });
    }

    BindNode.getBindById = function(id)
    {
      return _Binds.map(function(k,i){
        return (k.bindName() !== id ? null : k);
      }).filter(function(k,i){
        return (k !== null);
      });
    }

    BindNode.compareCheck = function()
    {
      var diff = _diff(_textMap,(_isAttr ? _node.value : _node.textContent));
    }

    BindNode.updateCheck = function()
    {
      var curText = _initialText;
      _Binds.forEach(function(k,i){
        curText = k(curText,(_isAttr ? _node.value : _node.textContent));
      });
    }



    return BindNode;
  }
  return CreateBindNode;
}());;




      /* END BUILD SECTION */

    var _textBinds = []
      , _attrBinds = []
      , _pipedAttribute = {}
      , _startBind = "{{"
      , _endBind = "}}"
      , _onChangeEvents = {}
      , _KBListener = CreateKB()
      , _textListeners = ['innerHTML','textContent','innerText','outerHTML','outerText','appendChild','removeChild']
      , _onUpdate = function(e)
        {
          KB_Bind.updateUnsynced();
          KB_Bind();
          if(_textListeners.indexOf(e.attr) > -1)
          {
            _textBinds.forEach(function(k,i){
              k.updateCheck();
            });
          }
          else
          {
            _attrBinds.forEach(function(k,i){
              k.updateCheck();
            });
          }
        }

    /* old not used
    var binder = function(node,isAttr)
    {
      this.initialText = (isAttr ? node.value : node.textContent);
      this.isAttr = isAttr;
      this.bindPosition = this.initialText.indexOf(_startBind);
      this.bindText = this.initialText.substring(this.initialText.indexOf(_startBind),this.initialText.indexOf(_endBind));

      this.splitInitialText = this.initialText.split(_startBind).map(function(k,i){
        return (k.indexOf(_endBind) > -1 ? k.substring((k.indexOf(_endBind)+_endBind.length),k.length) : k);
        if(k.indexOf(_endBind) > -1)
        {

        }
      });

      this.hasChildren = (isAttr ? false : (node.children.length > 0));
      this.children = (isAttr ? null : node.children);
      this.bind = (this.bindText).split("|").map(function(k,i){
        return (k.indexOf(_startBind) > 0 ? k.replace(_startBind,"") : "");
      }).join("");

      this.mode = (this.bindText).split('mode=').map(function(k,i){
        return (k.indexOf('one-way') > -1 ? 'one-way' : (k.indexOf('two-way') > -1 ? 'two-way' : (i === 1 ? 'two-way' : '')));
      }).join("");

      this.filters = (this.bindText).split('filters=').map(function(k,i){
        return (i === 1 ? (k.substring(0,(k.indexOf(';') > -1 ? k.indexOf(';') : k.indexOf(_endBind)))) : "");
      }).join("").split(",");

      this.value = "";
    }*/

    function KB_Bind()
    {
      var textNodes = KB_Bind.SearchAllTextNodes(_startBind)
        , attrNodes = KB_Bind.SearchAllAttributes(_endBind);

      textNodes.forEach(function(k,i){
        _textBinds.push(CreateBindNode()
        .startBind(_startBind)
        .endBind(_endBind));
        _textBinds[_textBinds.length-1].call();
      });

      attrNodes.forEach(function(k,i){
        _attrBinds.push(CreateBindNode()
        .startBind(_startBind)
        .endBind(_endBind)
        .isAttr(true));
        _attrBinds[_attrBinds.length-1].call();
      });

      _textListeners.forEach(function(k,i){
        _KBListener.removeAttrUpdateListener(k,_onUpdate);
        _KBListener.addAttrUpdateListener(k,_onUpdate);
      });

      KB_Bind.getAllAttributeTypes().forEach(function(k,i){
        _KBListener.removeAttrUpdateListener(k,_onUpdate);
        _KBListener.addAttrUpdateListener(k,_onUpdate);
      });
    }

    KB_Bind.textBinds = function()
    {
      return _textBinds;
    }

    KB_Bind.attributeBinds = function()
    {
      return _attrBinds;
    }

    KB_Bind.pipedAttributes = function()
    {
      return _pipedAttribute;
    }

    KB_Bind.addPipedAttribute = function(n,f)
    {
      if(typeof n === 'string' && typeof f === 'function')
      {
        _pipedAttribute[n] = f;
      }
    }

    KB_Bind.removePipedAttribute = function(n)
    {
      if(_pipedAttribute[n] !== undefined)
      {
        _pipedAttribute[n] = undefined;
      }
    }

    KB_Bind.SearchAllTextNodes = function(searchText)
    {
      var lookingInBody = false;
      return Array.prototype.concat.apply([],(Array.prototype.slice.call(document.all).map(function(k,i){
        if(k.nodeName === 'BODY') lookingInBody = true;
        return (lookingInBody ? Array.prototype.concat.apply([],Array.prototype.slice.call(k.childNodes).filter(function(d,x){
          return (d.nodeName === '#text' && d.textContent.indexOf(searchText) > -1);
        })) : null);
      })).filter(function(k,i){
        return (k !== null);
      }));
    }

    KB_Bind.SearchAllAttributes = function(searchText)
    {
      var lookingInBody = false;
      return Array.prototype.concat.apply([],(Array.prototype.slice.call(document.all).map(function(k,i){
        if(k.nodeName === 'BODY') lookingInBody = true;
        return (lookingInBody ? Array.prototype.concat.apply([],Array.prototype.slice.call(k.attributes).filter(function(d,x){
          return (d.value.indexOf(searchText) > -1);
        }).map(function(d,x){
          d.parentElement = k;
          return d;
        })) : null);
      })).filter(function(k,i){
        return (k !== null);
      }));
    }

    KB_Bind.getBindsById = function(id)
    {
      return Array.prototype.concat.apply([],_textBinds.map(function(k,i){
        return k.getBindById(id);
      }).filter(function(k,i){
        return (k.length > 0);
      }).concat(_attrBinds.map(function(k,i){
        return k.getBindById(id);
      }).filter(function(k,i){
        return (k.length > 0);
      })));
    }

    KB_Bind.updateBindsById = function(id,value)
    {
      KB_Bind.getBindsById(id).forEach(function(k,i){
        k.value(value).call();
      });
    }

    KB_Bind.updateUnsynced = function()
    {
      _textBinds = _textBinds.map(function(k,i){
        return (k.node().parentElement === null ? null : k);
      }).filter(function(k,i){
        return (k !== null);
      });

      _attrBinds = _attrBinds.map(function(k,i){
        return (k.node().parentElement === null ? null : k);
      }).filter(function(k,i){
        return (k !== null);
      });

      return KB_Bind;
    }

    KB_Bind.getAllAttributeTypes = function()
    {
      return Array.prototype.concat.apply([],_attrBinds.map(function(k,i){
        return Array.prototype.slice.call(k.node().attributes);
      })).filter(function(k,i,self){
        return (self.indexOf(k) === i)
      });
    }

    return KB_Bind;
  }
  if (typeof define === "function" && define.amd)
  {
    define('KB_Bind',CreateKB_Bind); //global KM define in browser
    define([],CreateKB_Bind); //define if file refrenced
  }
  else if (typeof module === "object" && module.exports)
  {
    module.exports = CreateKB_Bind;
  }
  return CreateKB_Bind;
}());
