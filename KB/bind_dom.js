define([],function(){

  var _attrListeners = {},

      _attrUpdateListeners = {},

      _styleListeners = {},

      _styleUpdateListeners = {},

      _injected = {},

      _all = '*',

      _allStyles = Object.getOwnPropertyNames(document.body.style),

      _set = function(el,prop,val,ret,args)
      {
        var e = new _changeEvent(el,prop,val,ret,args,undefined,'set');
        console.log(e);

        if(e._preventDefault !== undefined) return false;

        return true;
      },

      _update = function(el,prop,val,ret,args,action)
      {
        var e = new _changeEvent(el,prop,val,ret,args,action,'update');

        if(e._preventDefault !== undefined) return false;

        return true;
      }

  function _changeEvent(el,attr,value,oldValue,args,action,type)
  {
    this.stopPropagation = function(){this._stopPropogation = true;};
    this.preventDefault = function(){this._preventDefault = true;};
    this.value = value;
    this.oldValue = oldValue;
    this.target = el;
    this.attr = attr;
    this.arguments = args;
    this.action = action;
    this.child = undefined;
    this.type = type;
  }

  function _localBinders()
  {
    this._attrListeners = {};
    this._attrUpdateListeners = {};
    this._styleListeners = {};
    this._styleUpdateListeners = {};
    this._childAttrListeners = {};
    this._childAttrUpdateListeners = {};
    this._childStyleListeners = {};
    this._childStyleUpdateListeners = {};
    this._parentStyleListeners = {};
    this._parentStyleUpdateListeners = {};
    this._parentAttrListeners = {};
    this._parentAttrUpdateListeners = {};
    this._injectedStyle = {};
  }

  function bind()
  {
    bind.injectPrototypes(Node,'Node');
    bind.injectPrototypes(Element,'Element');
    bind.injectPrototypes(HTMLElement,'HTMLElement');
    bind.injectPrototypes(HTMLInputElement,'HTMLInputElement');
    bind.injectPrototypes(HTMLTextAreaElement,'HTMLTextAreaElement');
    bind.injectPrototypes(Document,'Document');


    return bind;
  }

  bind.injectPrototypeProperty = function(obj,key,injectName,set,update)
  {
    var _proto = obj.prototype,
        _descriptor = Object.getOwnPropertyDescriptor(_proto,key),
        _injectName = (injectName || obj.toString().split(/\s+/)[1].split('{')[0].replace('()','')),
        _injectedObj =  _injected[_injectName],
        __set = (set || _set),
        __update = (update || _update);

    if(_proto.kb === undefined)
    {
      _proto.kb = {};
      _proto.kb.attrListeners = (function()
      {
        if(this.__kb === undefined)
        {
          this.__kb = new _localBinders();
        }
        return this.__kb;
      }).bind(_proto);
      _proto.addAttrListener = bind.addAttrListener;
      _proto.addAttrUpdateListener = bind.addAttrUpdateListener;
      _proto.addChildAttrListener = addChildAttrListener;
      _proto.addChildAttrUpdateListener = addChildAttrUpdateListener;

      _proto.removeAttrListener = bind.removeAttrListener;
      _proto.removeAttrUpdateListener = bind.removeAttrUpdateListener;
      _proto.removeChildAttrListener = removeChildAttrListener;
      _proto.removeChildAttrUpdateListener = removeChildAttrUpdateListener;
    }

    if(_injectedObj === undefined)
    {
      _injected[_injectName] = {obj:obj,proto:_proto,descriptors:{},set:undefined,update:undefined};
      _injectedObj = _injected[_injectName];
      _injectedObj.set = __set;
      _injectedObj.update = __update;
    }

    if(_injectedObj.descriptors[key] === undefined) _injectedObj.descriptors[key] = _descriptor;
    if(_descriptor.configurable)
    {
      if(_descriptor.set !== undefined)
      {
         Object.defineProperty(_proto,key,{
           get:_descriptor.get,
           set:function(v)
           {
              var oldValue = _descriptor.get.apply(this);
              if(_injectedObj.set(this,key,v,oldValue,arguments))
              {
                _descriptor.set.apply(this,arguments);
              }
              _injectedObj.update(this,key,v,oldValue,arguments);
           },
           enumerable:true,
           configurable:true
         });
      }
      else if(typeof _descriptor.value === 'function')
      {
          Object.defineProperty(_proto,key,{
            value:function()
            {
              var action;
              if(_injectedObj.set(this,key,null,null,arguments))
              {
                action = _descriptor.value.apply(this,arguments);
              }
              _injectedObj.update(this,key,null,null,arguments,action);
              return action;
            },
            writable:true,
            enumerable:true,
            configurable:true
          });
      }
      else if(_descriptor.value !== undefined)
      {
        Object.defineProperty(_proto,key,{
          get:function()
          {
            return _descriptor.value;
          },
          set:function(v)
          {
            var oldValue = _descriptor.value;
            if(_injectedObj.set(this,key,v,oldValue,arguments))
            {
              _descriptor.value = v;
            }
            _injectedObj.update(this,key,v,oldValue,arguments);
          },
          enumerable:true,
          configurable:true
        });
      }
    }
    return bind;
  }

  bind.injectStyleProperty = function(el,key,set,update)
  {
    var _proto = el.style,
        _descriptor = Object.getOwnPropertyDescriptor(_proto,key),
        _injectedObj = el.kb.attrListeners().injectedStyle,
        __set = (set || _set),
        __update = (update || _update);

    if(_injectedObj === undefined)
    {
      el.kb.attrListeners().injectedStyle = {obj:el,proto:_proto,descriptors:{},set:undefined,update:undefined};
      el.kb.attrListeners().injectedStyle.set = __set;
      el.kb.attrListeners().injectedStyle.update = __update;
      _injectedObj = el.kb.attrListeners().injectedStyle;
    }

    if(_injectedObj.descriptors[key] === undefined) _injectedObj.descriptors[key] = _descriptor;

    if(_descriptor.configurable)
    {
      Object.defineProperty(_proto,key,{
        get:function()
        {
          return _descriptor.value;
        },
        set:function(v)
        {
          var oldValue = _descriptor.value;
          if(_injectedObj.set(el,key,v,oldValue))
          {
            _descriptor.value = v;
            el.style.setProperty(key.replace(/([A-Z])/g, "-$1").replace('webkit','-webkit'),v)
          }
          _injectedObj.update(el,key,v,oldValue);
        },
        enumerable:true,
        configurable:true
      });
    }
    return bind;
  }

  bind.injectPrototypes = function(obj,injectName,set,update)
  {
    var _proto = obj.prototype,
        _injectName = (injectName || obj.toString().split(/\s+/)[1].split('{')[0].replace('()','')),
        _injectedObj = _injected[_injectName],
        _keys = Object.getOwnPropertyNames(_proto),
        __set = (set || _set),
        __update = (update || _update),
        _descriptors,
        x;

    if(_proto.kb === undefined)
    {
      _proto.kb = {};
      _proto.kb.attrListeners = (function()
      {
        if(this.__kb === undefined)
        {
          this.__kb = new _localBinders();
        }
        return this.__kb;
      }).bind(_proto)
      _proto.addAttrListener = bind.addAttrListener;
      _proto.addAttrUpdateListener = bind.addAttrUpdateListener;
      _proto.addChildAttrListener = addChildAttrListener;
      _proto.addChildAttrUpdateListener = addChildAttrUpdateListener;
    }

    if(_injectedObj === undefined)
    {
      _injected[_injectName] = {obj:obj,proto:_proto,descriptors:{},set:undefined,update:undefined};
      _injectedObj = _injected[_injectName];
      _injectedObj.set = __set;
      _injectedObj.update = __update;
    }

    _descriptors = _injected[_injectName].descriptors;

    for(x=0;x<_keys.length;x+=1)
    {
      if(_descriptors[_keys[x]] === undefined)
      {
        bind.injectPrototypeProperty(obj,_keys[x],_injectName,__set,_update);
      }
    }

    if(_keys.indexOf('value') !== -1)
    {
      function keyDown(e)
      {
        var isCheck,
            oldCheck,
            oldValue,
            value;

        if(this.type === 'checkbox' || this.type === 'radio')
        {
          oldCheck = this.checked;
          isCheck = true;
        }
        oldValue = (isCheck ? (typeof this.checked === 'string' ? this.checked : (this.checked ? "true" : "false")) : this.value);
        setTimeout((function()
        {
          value = (isCheck ? (typeof this.checked === 'string' ? this.checked : (this.checked ? "true" : "false")) : this.value);
          if(isCheck)
          {
            if(!_injectedObj.set(this,'checked',this.checked,oldValue))
            {
              _descriptors['checked'].set.call(this,oldValue);
            }
            else
            {
              _injectedObj.update(this,'checked',this.checked,oldValue);
            }
          }
          this.value = value;

          if(!_injectedObj.set(this,'value',this.value,oldValue))
          {
            _descriptors['value'].set.call(this,oldValue);
          }
          else
          {
            _injectedObj.update(this,'value',this.checked,oldValue);
          }
        }).bind(this),0);

      }

      _proto.kb.removeInputBinding = (function(){
        this.kb.attrListeners()._onkeydown = undefined;
        this.removeEventListener('keydown',keyDown);
      }).bind(_proto)

      _proto.kb.addInputBinding = (function(){
        this.kb.attrListeners()._onkeydown = true;
        this.addEventListener('keydown',keyDown);
      }).bind(_proto)

      _proto.kb.removeInputBoxBinding = (function(){
        this.kb.attrListeners()._onmousedown = undefined;
        this.removeEventListener('mouseup',keyDown);
      }).bind(_proto)

      _proto.kb.addInputBoxBinding = (function(){
        this.kb.attrListeners()._onmousedown = true;
        this.removeEventListener('mouseup',keyDown);
      }).bind(_proto)
    }
    return bind;
  }

  function addListener(attr,func,child,update)
  {
    if(typeof func !== 'function') return bind;

    var isInput = (['value','checked'].indexOf(attr) !== -1),
        isStyle = (_allStyles.indexOf(attr) !== -1),
        listeners;

    if(this.toString() !== bind.toString())
    {
      if(child)
      {
        var children = this.querySelectorAll('*'),
            len = children.length;
        if(isStyle)
        {
          listeners = (update ? '_childStyleUpdateListeners' : '_childStyleListeners');
          if(this.kb.attrListeners()[listeners][attr] === undefined) this.kb.attrListeners()[listeners][attr] = [];
          this.kb.attrListeners()[listeners][attr].push(func);
        }
        else
        {
          listeners = (update ? '_childAttrUpdateListeners' : '_childAttrListeners');
          if(this.kb.attrListeners()[listeners][attr] === undefined) this.kb.attrListeners()[listeners][attr] = [];
          this.kb.attrListeners()[listeners][attr].push(func);
        }
        for(var x=0;x<len;x++)
        {
          if(isInput || (attr === _all))
          {
            if(children[x].addInputBinding !== undefined) children[x].addInputBinding();
            if(children[x].addInputBoxBinding !== undefined) children[x].addInputBoxBinding();
          }
          if(isStyle)
          {
            bind.injectStyleProperty(children[x],attr);
            listeners = (update ? '_parentStyleUpdateListeners' : '_parentStyleListeners');
            if(children[x].kb.attrListeners()[listeners][attr] === undefined) children[x].kb.attrListeners()[listeners][attr] = [];
            children[x].kb.attrListeners()[listeners][attr].push(this);
          }
          else
          {
            if(attr === _all)
            {
              listeners = (update ? '_childStyleUpdateListeners' : '_childStyleListeners');
              if(this.kb.attrListeners()[listeners][attr] === undefined) this.kb.attrListeners()[listeners][attr] = [];
              this.kb.attrListeners()[listeners][attr].push(func);
              listeners = (update ? '_parentStyleUpdateListeners' : '_parentStyleListeners');
              var len = _allStyles.length;
              for(var i = 0;i<len;i++)
              {
                bind.injectStyleProperty(children[x],_allStyles[i]);
                if(children[x].kb.attrListeners()[listeners][_allStyles[i]] === undefined) children[x].kb.attrListeners()[listeners][_allStyles[i]] = [];
                children[x].kb.attrListeners()[listeners][_allStyles[i]].push(this);
              }
            }
            listeners = (update ? '_parentAttrUpdateListeners' : '_parentAttrListeners');
            if(children[x].kb.attrListeners()[listeners][attr] === undefined) children[x].kb.attrListeners()[listeners][attr] = [];
            children[x].kb.attrListeners()[listeners][attr].push(this);
          }
        }
      }
      else
      {
        if(isStyle)
        {
          listeners = (update ? '_styleUpdateListeners' : '_styleListeners');
          bind.injectStyleProperty(this,attr);
          if(this.kb.attrListeners()[listeners][attr] === undefined) this.kb.attrListeners()[listeners][attr] = [];
          this.kb.attrListeners()[listeners][attr].push(func);
        }
        else
        {
          if(isInput || (attr === _all))
          {
            if(this.addInputBinding !== undefined) this.addInputBinding();
            if(this.addInputBoxBinding !== undefined) this.addInputBoxBinding();
          }
          if(attr === _all)
          {
            listeners = (update ? '_styleUpdateListeners' : '_styleListeners');
            var len = _allStyles.length;
            for(var x = 0;x<len;x++)
            {
              bind.injectStyleProperty(this,_allStyles[x]);
            }
            if(this.kb.attrListeners()[listeners][attr] === undefined) this.kb.attrListeners()[listeners][attr] = [];
            this.kb.attrListeners()[listeners][attr].push(func);
          }
          listeners = (update ? '_attrUpdateListeners' : '_attrListeners');
          if(this.kb.attrListeners()[listeners][attr] === undefined) this.kb.attrListeners()[listeners][attr] = [];
          this.kb.attrListeners()[listeners][attr].push(func);
        }
      }
    }
    else
    {
      if(isInput || (attr === _all))
      {
        var inputs = document.querySelectorAll('input, textarea'),
            len = inputs.length;
        for(var x=0;x<len;x++)
        {
          if(inputs[x].addInputBinding !== undefined) inputs[x].addInputBinding();
          if(inputs[x].addInputBoxBinding !== undefined) inputs[x].addInputBoxBinding();
        }
      }
      if(isStyle)
      {
        var els = Array.prototype.slice.call(document.body.querySelectorAll('*')),
            len = (els.length+1);
        els.unshift(document.body);
        for(var x=0;x<len;x++)
        {
          bind.injectStyleProperty(els[x],attr);
        }
        listeners = (update ? _styleUpdateListeners : _styleListeners);
        if(_styleListeners[attr] === undefined) _styleListeners[attr] = [];
        listeners[attr].push(func);
      }
      else
      {
        if(attr === _all)
        {
          var els = Array.prototype.slice.call(document.body.querySelectorAll('*')),
              len = (els.length+1),
              lenStyles = _allStyles.length;
          els.unshift(document.body);
          for(var x=0;x<len;x++)
          {
            for(var i=0;i<lenStyles;i++)
            {
              bind.injectStyleProperty(els[x],_allStyles[i]);
            }
          }
          listeners = (update ? _styleUpdateListeners : _styleListeners);
          if(_styleListeners[attr] === undefined) _styleListeners[attr] = [];
          listeners[attr].push(func);
        }
        listeners = (update ? _attrUpdateListeners : _attrListeners);
        if(_attrListeners[attr] === undefined) _attrListeners[attr] = [];
        listeners[attr].push(func);
      }
    }
  }

  function removeListener(attr,func,child,update)
  {
    if(typeof func !== 'function') return bind;

    var isInput = (['value','checked'].indexOf(attr) !== -1),
        isStyle = (_allStyles.indexOf(attr) !== -1),
        listeners,
        x;

        function cut(attr,list)
        {
          var listenerFuncs = list[attr],
              len = listenerFuncs.length;
          for(x=0;x<len;x++)
          {
            if(listenerFuncs[x].toString() === func.toString())
            {
              listenerFuncs.splice(x,1);
            }
          }
        }

    if(this.toString() !== bind.toString())
    {
      if(child)
      {
        var children = this.querySelectorAll('*'),
            len = children.length;
        if(isStyle)
        {
          listeners = (update ? '_childStyleUpdateListeners' : '_childStyleListeners');
          cut(attr,this.kb.attrListeners()[listeners]);
          listeners = (update ? '_parentStyleUpdateListeners' : '_parentStyleListeners');
        }
        else
        {
          if(attr === _all)
          {
            listeners = (update ? '_childStyleUpdateListeners' : '_childStyleListeners');
            cut(attr,this.kb.attrListeners()[listeners]);
          }
          listeners = (update ? '_childAttrUpdateListeners' : '_childAttrListeners');
          cut(attr,this.kb.attrListeners()[listeners]);
          listeners = (update ? '_parentAttrUpdateListeners' : '_parentAttrListeners');
        }
        for(x=0;x<len;x++)
        {
          var parents = children[x].kb.attrListeners()[listeners][attr],
              parentLen = parents.length;
          for(var i=0;i<parentLen;i++)
          {
            if(parents[i].isEqualNode(this))
            {
              parents.slice(i,1);
            }
          }
          if(attr === _all)
          {
            listenersStyle = (update ? '_parentStyleUpdateListeners' : '_parentStyleListeners');
            var parents = children[x].kb.attrListeners()[listeners][attr],
                parentLen = parents.length;
            for(var i=0;i<parentLen;i++)
            {
              if(parents[i].isEqualNode(this))
              {
                parents.slice(i,1);
              }
            }
          }
        }
      }
      else
      {
        if(isStyle)
        {
          listeners = (update ? '_styleUpdateListeners' : '_styleListeners');
          cut(attr,this.kb.attrListeners()[listeners]);
        }
        else
        {
          if(attr === _all)
          {
            listeners = (update ? '_styleUpdateListeners' : '_styleListeners');
            cut(attr,this.kb.attrListeners()[listeners]);
          }
          listeners = (update ? '_attrUpdateListeners' : '_attrListeners');
          cut(attr,this.kb.attrListeners()[listeners]);
        }
      }
    }
    else
    {
      if(isStyle)
      {
        listeners = (update ? _styleUpdateListeners : _styleListeners);
        cut(attr,listeners);
      }
      else
      {
        if(attr === _all)
        {
          listeners = (update ? _styleUpdateListeners : _styleListeners);
          cut(attr,listeners);
        }
        listeners = (update ? _attrUpdateListeners : _attrListeners);
        cut(attr,listeners);
      }
    }
  }

  bind.addAttrListener = function(attr,func,child)
  {
    addListener.call(this,attr,func,child,false);
    return bind;
  }

  bind.addAttrUpdateListener = function(attr,func,child)
  {
    addListener.call(this,attr,func,child,true);
    return bind;
  }

  bind.removeAttrListener = function(attr,func,child)
  {
    removeListener.call(this,attr,func,child,false);
    return bind;
  }

  bind.removeAttrUpdateListener = function(attr,func,child)
  {
    removeListener.call(this,attr,func,child,true);
    return bind;
  }

  function addChildAttrListener(attr,func)
  {
    bind.addAttrListener.call(this,attr,func,true);
    return this;
  }

  function addChildAttrUpdateListener(attr,func)
  {
    bind.addAttrUpdateListener.call(this,attr,func,true);
    return this;
  }

  function removeChildAttrListener(attr,func)
  {
    bind.removeAttrListener.call(this,attr,func,true);
    return this;
  }

  function removeChildAttrUpdateListener(attr,func)
  {
    bind.removeAttrUpdateListener.call(this,attr,func,true);
    return this;
  }

  bind.injectedPrototypes = function()
  {
    return _injected;
  }

  return bind;
})
