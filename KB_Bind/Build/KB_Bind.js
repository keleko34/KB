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

      var CreateBindNode = (function(){
  function CreateBindNode()
  {
    var _node = {}
      , _Binds = []
      , _initialText = ""
      , _initialTextSplit = []
      , _isAttr = false
      , _startBind = "{{"
      , _endBind = "}}"

    function BindNode(node)
    {


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

    BindNode.getBindById = function(id)
    {
      return _Binds.map(function(k,i){
        return (k.bindName() !== id ? null : k);
      }).filter(function(k,i){
        return (k !== null);
      });
    }

    BindNode.updateCheck = function()
    {
      _Binds.forEach(function(k,i){
        k.call();
      });
    }

    return BindNode;
  }
  return CreateBindNode;
}());;

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
