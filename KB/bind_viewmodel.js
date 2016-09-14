define([],function(){

  var _model = {},
      _viewmodels = {},
      _dataListeners = {},
      _dataUpdateListeners = {},
      _dataAddedListeners = [],
      _all = "*",
      _set = function(local,key,value,oldValue,name,obj,scopeString)
      {
        var e = new _changeEvent(_viewmodels[name],name,obj,local,value,oldValue,scopeString,key);
        if(_dataListeners[_all] !== undefined)
        {
          loop:for(var x=0,len=_dataListeners[_all].length;x<len;x++)
          {
            _dataListeners[_all][x](e);
            if(e._stopPropogation) break loop;
          }
        }

        if(e._stopPropogation === undefined && _dataListeners[key] !== undefined)
        {
          loop:for(var x=0,len=_dataListeners[key].length;x<len;x++)
          {
            _dataListeners[key][x](e);
            if(e._stopPropogation) break loop;
          }
        }

        if(e._stopPropogation === undefined && _dataListeners[scopeString] !== undefined)
        {
          loop:for(var x=0,len=_dataListeners[scopeString].length;x<len;x++)
          {
            _dataListeners[scopeString][x](e);
            if(e._stopPropogation) break loop;
          }
        }

        if(e._stopPropogation === undefined && obj.__kblisteners[scopeString] !== undefined && (scopeString.indexOf('.') !== -1 || scopeString.indexOf('[') !== -1))
        {
          loop:for(var x=0,len=obj.__kblisteners[scopeString].length;x<len;x++)
          {
            obj.__kblisteners[scopeString][x](e);
            if(e._stopPropogation) break loop;
          }
        }

        if(e._stopPropogation === undefined && local.__kblisteners[key] !== undefined)
        {
          loop:for(var x=0,len=local.__kblisteners[key].length;x<len;x++)
          {
            local.__kblisteners[key][x](e);
            if(e._stopPropogation) break loop;
          }
        }

        if(e._stopPropogation === undefined && local.__kbparentlisteners[key] !== undefined)
        {
          loop:for(var x=0,len=local.__kbparentlisteners[key].length;x<len;x++)
          {
            local.__kbparentlisteners[key][x](e);
            if(e._stopPropogation) break loop;
          }
        }

        if(e._preventDefault) return false;
        return true;
      },
      _update = function(local,key,value,oldValue,name,obj,scopeString)
      {
        var e = new _changeEvent(_viewmodels[name],name,obj,local,value,oldValue,scopeString,key);

        if(_dataUpdateListeners[_all] !== undefined)
        {
          loop:for(var x=0,len=_dataUpdateListeners[_all].length;x<len;x++)
          {
            _dataUpdateListeners[_all][x](e);
            if(e._stopPropogation) break loop;
          }
        }

        if(e._stopPropogation === undefined && _dataUpdateListeners[key] !== undefined)
        {
          loop:for(var x=0,len=_dataUpdateListeners[key].length;x<len;x++)
          {
            _dataUpdateListeners[key][x](e);
            if(e._stopPropogation) break loop;
          }
        }

        if(e._stopPropogation === undefined && _dataUpdateListeners[scopeString] !== undefined)
        {
          loop:for(var x=0,len=_dataUpdateListeners[scopeString].length;x<len;x++)
          {
            _dataUpdateListeners[scopeString][x](e);
            if(e._stopPropogation) break loop;
          }
        }

        if(e._stopPropogation === undefined && obj.__kbupdatelisteners[scopeString] !== undefined && (scopeString.indexOf('.') !== -1 || scopeString.indexOf('[') !== -1))
        {
          loop:for(var x=0,len=obj.__kbupdatelisteners[scopeString].length;x<len;x++)
          {
            obj.__kbupdatelisteners[scopeString][x](e);
            if(e._stopPropogation) break loop;
          }
        }

        if(e._stopPropogation === undefined && local.__kbupdatelisteners[key] !== undefined)
        {
          loop:for(var x=0,len=local.__kbupdatelisteners[key].length;x<len;x++)
          {
            local.__kbupdatelisteners[key][x](e);
            if(e._stopPropogation) break loop;
          }
        }

        if(e._stopPropogation === undefined && local.__kbparentupdatelisteners[key] !== undefined)
        {
          loop:for(var x=0,len=local.__kbparentupdatelisteners[key].length;x<len;x++)
          {
            local.__kbparentupdatelisteners[key][x](e);
            if(e._stopPropogation) break loop;
          }
        }

        if(e._preventDefault) return false;
        return true;
      },
      _added = function(local,key,value,oldValue,name,obj,scopeString)
      {
        var e = new _changeEvent(_viewmodels[name],name,obj,local,value,oldValue,scopeString,key);

        loop:for(var x=0,len=_dataAddedListeners.length;x<len;x++)
        {
          _dataAddedListeners[x](e);
          if(e._stopPropogation) break loop;
        }

        if(e._stopPropogation === undefined)
        {
          loop:for(var x=0,len=local.__kbdatacreatelisteners.length;x<len;x++)
          {
            local.__kbdatacreatelisteners[x](e);
            if(e._stopPropogation) break loop;
          }
        }

        if(e._preventDefault) return false;
        return true;
      }

  function splitScopeString(str)
  {
    return Array.prototype.concat.apply([],str.split(".").map(function(k,i){
      return k.split("[")
      .map(function(d,x){
        return (d.indexOf("]") > -1 ? "["+d : d);
      });
    }));
  }

  function getScopeString(obj,prop)
  {
    var scope =((isObject(obj) || isArray(obj)) ? obj.__kbscopeString : (typeof obj === 'string' ? obj : ''));
    if(isArray(obj) || (typeof prop === 'number'))
    {
      return scope+"["+prop+"]";
    }
    else
    {
      return (scope.length !== 0 ? "."+ prop : prop);
    }
  }

  function isArray(v)
  {
    return (typeof v === 'object' && !!v && v.constructor.toString() === Array.toString());
  }

  function isObject(v)
  {
    return (typeof v === 'object' && !!v && v.constructor.toString() !== Array.toString());
  }

  function isObservable(obj,prop)
  {
    var desc = Object.getOwnPropertyDescriptor(obj,prop);
    if(Object.keys(desc).indexOf('value') === -1){return true;}
    return false;
  }

  function deepCopy(obj,obj2,overwrite)
  {
    var keys = Object.keys(obj),
        key,
        x;

        obj2 = (obj2 !== undefined ? obj2 : (isObject(obj) ? {} : []));

    for(x=0;x<keys.length;x++)
    {
      key = obj[keys[x]];
      if(isObject(key))
      {
        obj2[keys[x]] = (overwrite ? overwrite(keys[x],key) : {});
        if(obj2[keys[x]]) deepCopy(key,obj2[keys[x]],overwrite);
      }
      else if(isArray(key))
      {
        obj2[keys[x]] = (overwrite ? overwrite(keys[x],key) : []);
        if(obj2[keys[x]]) deepCopy(key,obj2[keys[x]],overwrite);
      }
      else
      {
        obj2[keys[x]] = (overwrite ? overwrite(keys[x],key) : key);
      }
    }
    return obj2;
  }

  function _changeEvent(viewmodel,name,obj,local,value,oldValue,scopeString,key)
  {
    this.stopPropagation = function(){this._stopPropogation = true;};
    this.preventDefault = function(){this._preventDefault = true;};
    this.instance = viewmodel;
    this.viewmodel = name;
    this.scope = obj;
    this.localScope = local;
    this.value = value;
    this.oldValue = oldValue;
    this.scopeString = scopeString;
    this.key = key;
  }

  function setNormal(val,key,set,update,name,obj,scopeString)
  {
    var _val = val,
        _key = key,
        _set = set,
        _update = update,
        _name = name,
        _obj = obj,
        _scopeString = scopeString,
        _oldValue;
    return {
      get:function(){return _val;},
      set:function(v)
      {
        _oldValue = _val;
        if(isObject(_oldValue) || isArray(_oldValue))
        {
          if(JSON.stringify(v) === JSON.stringify(_oldValue))
          {
            return;
          }
        }
        else
        {
          if(v.toString() === _oldValue.toString())
          {
            return;
          }
        }
       if(_set(this,_key,v,_oldValue,_name,_obj,getScopeString(this,_key)))
       {
         _val = v;
         if(isObject(v) || isArray(v))
         {
           model.createObservable(_name,this,_key);
         }
       }
       _update(this,_key,v,_oldValue,_name,_obj,getScopeString(this,_key));

      },
      enumerable:true,
      configurable:true
    }
  }

  function loopCreateObservable(obj,prop,set)
  {
    var val;
    if(isObject(obj[prop]))
    {
      var keys = Object.getOwnPropertyNames(obj[prop]);
      val = model.observableObject();

      Object.defineProperties(val,{
        __kbname:{
          value:(obj.__kbname !== undefined ? obj.__kbname : ""),
          writable:false,
          enumerable:false,
          configurable:true
        },
        __kbref:{
          value:(obj.__kbref !== undefined ? obj.__kbref : obj),
          writable:false,
          enumerable:false,
          configurable:true
        },
        __kbscopeString:{
          value:((obj.__kbscopeString || obj.__kbscopeString.length === 0) ? getScopeString(obj.__kbscopeString,prop) : ""),
          writable:false,
          enumerable:false,
          configurable:true
        }
      });

      for(var x=0,len=keys.length;x<len;x++)
      {
        loopCreateObservable(obj[prop],keys[x],val);
      }
      Object.defineProperty((set || obj),prop,setNormal(val,prop,_set,_update,(set.__kbname || obj.__kbname),(set.__kbref || obj.__kbref),(set.__kbscopeString || obj.__kbscopeString)));
    }
    else if(isArray(obj[prop]))
    {
      val = model.observableArray();

      Object.defineProperties(val,{
        __kbname:{
          value:(obj.__kbname !== undefined ? obj.__kbname : ""),
          writable:false,
          enumerable:false,
          configurable:true
        },
        __kbref:{
          value:(obj.__kbref !== undefined ? obj.__kbref : obj),
          writable:false,
          enumerable:false,
          configurable:true
        },
        __kbscopeString:{
          value:((obj.__kbscopeString || obj.__kbscopeString.length === 0) ? getScopeString(obj.__kbscopeString,prop) : ""),
          writable:false,
          enumerable:false,
          configurable:true
        }
      });

      for(var x=0,len=obj[prop].length;x<len;x++)
      {
        loopCreateObservable(obj[prop],x,val);
      }
      Object.defineProperty((set || obj),prop,setNormal(val,prop,_set,_update,(set.__kbname || obj.__kbname),(set.__kbref || obj.__kbref),(set.__kbscopeString || obj.__kbscopeString)));
    }
    else
    {
      val = obj[prop];
      Object.defineProperty((set || obj),prop,setNormal(val,prop,_set,_update,(set.__kbname || obj.__kbname),(set.__kbref || obj.__kbref),(set.__kbscopeString || obj.__kbscopeString)));
    }
    return (set || obj);
  }

  function model()
  {
    /* our constructor needs something */

    return model;
  }

  model.observableArray = function()
  {
    var arr = [];

    function updateCheck(arr)
    {
      for(var x=0,len=arr.length;x<len;x++)
      {
        if(!isObservable(arr,x))
        {
          model.createObservable(arr.__kbname,arr,x);
          if(!_added(arr,x,arr[x],undefined,arr.__kbname,arr.__kbref,arr.__kbscopeString))
          {
            arr.remove(x);
          }
        }
      }
    }

    /* replace all mutator methods to listen for changes */
    Object.defineProperties(arr,{
      splice:{
        value:function(){
          var ret = Array.prototype.splice.apply(this,arguments);
          updateCheck(this);
          return ret;
        },
        writable:false,
        enumerable:false,
        configurable:true
      },
      push:{
        value:function(){
          var ret = Array.prototype.push.apply(this,arguments);
          updateCheck(this);
          return ret;
        },
        writable:false,
        enumerable:false,
        configurable:true
      },
      pop:{
        value:function(){
          var ret = Array.prototype.pop.apply(this,arguments);
          updateCheck(this);
          return ret;
        },
        writable:false,
        enumerable:false,
        configurable:true
      },
      shift:{
        value:function(){
          var ret = Array.prototype.shift.apply(this,arguments);
          updateCheck(this);
          return ret;
        },
        writable:false,
        enumerable:false,
        configurable:true
      },
      unshift:{
        value:function(){
          var ret = Array.prototype.unshift.apply(this,arguments);
          updateCheck(this);
          return ret;
        },
        writable:false,
        enumerable:false,
        configurable:true
      },
      fill:{
        value:function(){
          var ret = Array.prototype.fill.apply(this,arguments);
          updateCheck(this);
          return ret;
        },
        writable:false,
        enumerable:false,
        configurable:true
      },
      reverse:{
        value:function(){
          var ret = Array.prototype.reverse.apply(this,arguments);
          updateCheck(this);
          return ret;
        },
        writable:false,
        enumerable:false,
        configurable:true
      },
      sort:{
        value:function(){
          var ret = Array.prototype.sort.apply(this,arguments);
          updateCheck(this);
          return ret;
        },
        writable:false,
        enumerable:false,
        configurable:true
      },
      add:{
        value:function(val){
          Object.defineProperty(arr,(arr.length),setNormal(val,(arr.length),_set,_update,arr.__kbname,arr.__kbref,arr.__kbscopeString));
          if(!_added(arr,(arr.length),val,undefined,arr.__kbname,arr.__kbref,arr.__kbscopeString))
          {
            arr.remove((arr.length-1));
          }
          return arr;
        },
        writable:false,
        enumerable:false,
        configurable:true
      },
      remove:{
        value:function(val){
          if(arr.indexOf(val) !== undefined)
          {
            arr.splice(arr.indexOf(val),1);
          }
          else if(typeof val === 'number')
          {
            arr.splice(val,1);
          }
          return arr;
        },
        writable:false,
        enumerable:false,
        configurable:true
      },
      stringify:{
        value:function(){
          return JSON.stringify(arr);
        },
        writable:false,
        enumerable:false,
        configurable:true
      },
      toJSON:{
        value:function(val){
          return deepCopy(this,[],function(k,v)
          {
            if(k.indexOf('__kb') === -1) return v;
          });
        },
        writable:false,
        enumerable:false,
        configurable:true
      },
      __kblisteners:{
        value:{},
        writable:false,
        enumerable:false,
        configurable:true
      },
      __kbupdatelisteners:{
        value:{},
        writable:false,
        enumerable:false,
        configurable:true
      },
      __kbparentlisteners:{
        value:{},
        writable:false,
        enumerable:false,
        configurable:true
      },
      __kbparentupdatelisteners:{
        value:{},
        writable:false,
        enumerable:false,
        configurable:true
      },
      __kbdatacreatelisteners:{
        value:[],
        writable:false,
        enumerable:false,
        configurable:true
      },
      addDataListener:{
        value:model.addDataListener,
        writable:false,
        enumerable:false,
        configurable:true
      },
      addDataUpdateListener:{
        value:model.addDataUpdateListener,
        writable:false,
        enumerable:false,
        configurable:true
      },
      addChildDataListener:{
        value:addChildDataListener,
        writable:false,
        enumerable:false,
        configurable:true
      },
      addChildDataUpdateListener:{
        value:addChildDataUpdateListener,
        writable:false,
        enumerable:false,
        configurable:true
      },
      removeDataListener:{
        value:model.removeDataListener,
        writable:false,
        enumerable:false,
        configurable:true
      },
      removeDataUpdateListener:{
        value:model.removeDataUpdateListener,
        writable:false,
        enumerable:false,
        configurable:true
      },
      removeChildDataListener:{
        value:removeChildDataListener,
        writable:false,
        enumerable:false,
        configurable:true
      },
      removeChildDataUpdateListener:{
        value:removeChildDataUpdateListener,
        writable:false,
        enumerable:false,
        configurable:true
      },
      addDataCreateListener:{
        value:model.addDataCreateListener,
        writable:false,
        enumerable:false,
        configurable:true
      },
      removeDataCreateListener:{
        value:model.removeDataCreateListener,
        writable:false,
        enumerable:false,
        configurable:true
      }
    });

    return arr;
  }

  model.observableObject = function()
  {
    var obj = {};

    Object.defineProperties(obj,{
      add:{
        value:function(prop,val){
          Object.defineProperty(obj,prop,setNormal(val,prop,_set,_update,obj.__kbname,obj.__kbref,obj.__kbscopeString));
          if(!_added(obj,prop,val,undefined,obj.__kbname,obj.__kbref,obj.__kbscopeString))
          {
            obj.remove(prop);
          }
          return obj;
        },
        writable:false,
        enumerable:false,
        configurable:true
      },
      remove:{
        value:function(prop){
          obj[prop] = undefined;
          return obj;
        },
        writable:false,
        enumerable:false,
        configurable:true
      },
      stringify:{
        value:function(){
          return JSON.stringify(obj);
        },
        writable:false,
        enumerable:false,
        configurable:true
      },
      toJSON:{
        value:function(val){
          return deepCopy(this,{},function(k,v)
          {
            if(k,indexOf('__kb') === -1) return v;
          });
        },
        writable:false,
        enumerable:false,
        configurable:true
      },
      __kblisteners:{
        value:{},
        writable:false,
        enumerable:false,
        configurable:true
      },
      __kbupdatelisteners:{
        value:{},
        writable:false,
        enumerable:false,
        configurable:true
      },
      __kbparentlisteners:{
        value:{},
        writable:false,
        enumerable:false,
        configurable:true
      },
      __kbparentupdatelisteners:{
        value:{},
        writable:false,
        enumerable:false,
        configurable:true
      },
      __kbdatacreatelisteners:{
        value:[],
        writable:false,
        enumerable:false,
        configurable:true
      },
      addDataListener:{
        value:model.addDataListener,
        writable:false,
        enumerable:false,
        configurable:true
      },
      addDataUpdateListener:{
        value:model.addDataUpdateListener,
        writable:false,
        enumerable:false,
        configurable:true
      },
      addChildDataListener:{
        value:addChildDataListener,
        writable:false,
        enumerable:false,
        configurable:true
      },
      addChildDataUpdateListener:{
        value:addChildDataUpdateListener,
        writable:false,
        enumerable:false,
        configurable:true
      },
      removeDataListener:{
        value:model.removeDataListener,
        writable:false,
        enumerable:false,
        configurable:true
      },
      removeDataUpdateListener:{
        value:model.removeDataUpdateListener,
        writable:false,
        enumerable:false,
        configurable:true
      },
      removeChildDataListener:{
        value:removeChildDataListener,
        writable:false,
        enumerable:false,
        configurable:true
      },
      removeChildDataUpdateListener:{
        value:removeChildDataUpdateListener,
        writable:false,
        enumerable:false,
        configurable:true
      },
      addDataCreateListener:{
        value:model.addDataCreateListener,
        writable:false,
        enumerable:false,
        configurable:true
      },
      removeDataCreateListener:{
        value:model.removeDataCreateListener,
        writable:false,
        enumerable:false,
        configurable:true
      }
    });

    return obj;
  }

  model.createObservable = function(name,obj,prop)
  {
    if(obj.__kbname === undefined && obj.__kbscopeString === undefined && obj.__kbref === undefined)
    {
      if(isObject(obj))
      {
        var keys = Object.getOwnPropertyNames(obj),
            newObj = model.observableObject();
        for(var x=0,len = keys.length;x<len;x++)
        {
          newObj[keys[x]] = obj[keys[x]];
        }
        obj = newObj;

        Object.defineProperties(obj,{
          __kbname:{
            value:name,
            writable:false,
            enumerable:false,
            configurable:true
          },
          __kbref:{
            value:obj,
            writable:false,
            enumerable:false,
            configurable:true
          },
          __kbscopeString:{
            value:"",
            writable:false,
            enumerable:false,
            configurable:true
          }
        });
      }
      else if(isArray(obj))
      {
        var newArr = model.observableArray();
        for(var x=0,len = obj.length;x<len;x++)
        {
          newObj[x] = obj[x];
        }
        obj = newObj;
        Object.defineProperties(obj,{
          __kbname:{
            value:name,
            writable:false,
            enumerable:false,
            configurable:true
          },
          __kbref:{
            value:obj,
            writable:false,
            enumerable:false,
            configurable:true
          },
          __kbscopeString:{
            value:"",
            writable:false,
            enumerable:false,
            configurable:true
          }
        });
      }
    }
    return loopCreateObservable(obj,prop,obj);
  }

  model.isObject = isObject;

  model.isArray = isArray;

  model.deepCopy = deepCopy;

  model.isObservable = isObservable;

  model.viewmodel = function(name,data)
  {
    if(!model.isRegistered(name))
    {
      if(isObject(data))
      {
        var _keys = Object.keys(data),
            x;
        _viewmodels[name] = eval("(function(){"
                                 +"return function "+name+"(){"
                                 +"for(x=0,len=_keys.length;x<len;x++){this[_keys[x]] = data[_keys[x]];}"
                                 +"};"
                                 +"}())");
      }
      else if(typeof data === 'function')
      {
        _viewmodels[name] = data;
      }
    }
    else
    {
      console.error("A Viewmodel by the name ",name," already exists");
    }
    return model;
  }

  model.createViewModel = function(name,params,extensions)
  {
    if(model.isRegistered(name))
    {
      var _vm = Object.create(_viewmodels[name].prototype);
          if(extensions !== undefined && isObject(extensions))
          {
            var exts = Object.keys(extensions);
            for(var x=0,len=exts.length;x<len;x++)
            {
              _vm[exts[x]] = extensions[exts[x]];
            }
          }
          _viewmodels[name].apply(_vm,params);
          var vmKeys = Object.keys(_vm),
          obsv = model.observableObject();
      obsv.__proto__ = _vm.__proto__;

      Object.defineProperties(obsv,{
          __kbname:{
            value:name,
            writable:false,
            enumerable:false,
            configurable:true
          },
          __kbref:{
            value:obsv,
            writable:false,
            enumerable:false,
            configurable:true
          },
          __kbscopeString:{
            value:"",
            writable:false,
            enumerable:false,
            configurable:true
          }
        });

      for(var x=0,len=vmKeys.length;x<len;x++)
      {
        obsv[vmKeys[x]] = _vm[vmKeys[x]];
        model.createObservable(name,obsv,vmKeys[x]);
      }
      Object.defineProperty(obsv,'constructor',{
        value:_viewmodels[name],
        writable:false,
        enumerable:false,
        configurable:true
      })
      return obsv;
    }
    else
    {
      console.error("There is no viewmodel by the name ",name);
    }
    return null;
  }

  model.isRegistered = function(name)
  {
    return (_viewmodels[name] !== undefined);
  }

  model.getModel = function()
  {
    return _model;
  }

  function parentloop(obj,prop,func,update,remove,initial)
  {
    var _listeners = (update ? obj.__kbparentupdatelisteners : obj.__kbparentlisteners),
        _keys = Object.keys(obj);
    if(!initial)
    {
      if(!remove)
      {
        if(_listeners[prop] === undefined) _listeners[prop] = [];
        _listeners[prop].push(func);
      }
      else
      {
        loop:for(var x=0,len=_listeners[prop].length;x<len;x++)
        {
          if(_listeners[prop][x].toString() === func.toString())
          {
            _listeners[prop].splice(x,1);
            break loop;
          }
        }
      }
    }
    for(var x=0,len=_keys.length;x<len;x++)
    {
      var val = obj[_keys[x]];
      if(isObject(val) || isArray(val))
      {
        parentloop(val,prop,func,update,remove);
      }
    }
  }

  function addListener(prop,func,update,child)
  {
    if(!(this.toString() === model.toString()))
    {
      if(!child)
      {
        _listeners = (update ? this.__kbupdatelisteners : this.__kblisteners);
        if(_listeners[prop] === undefined) _listeners[prop] = [];
        _listeners[prop].push(func);
      }
      else
      {
        parentloop(this,prop,func,update,false,true);
      }
    }
    else
    {
      _listeners = (update ? _dataUpdateListeners : _dataListeners);
      if(_listeners[prop] === undefined) _listeners[prop] = [];
      _listeners[prop].push(func);
    }
  }

  function addChildDataListener(prop,func)
  {
    model.addDataListener.call(this,prop,func,true);
  }

  function addChildDataUpdateListener(prop,func)
  {
    model.addDataUpdateListener.call(this,prop,func,true);
  }

  model.addDataListener = function(scopeString,func,children)
  {
    addListener.call(this,scopeString,func,false,children);
    return model;
  }

  model.addDataUpdateListener = function(scopeString,func,children)
  {
    addListener.call(this,scopeString,func,true,children);
    return model;
  }

  function dataCreate(func,remove)
  {
    if(!(this.toString() === model.toString()))
    {
      if(!remove)
      {
        this.__kbdatacreatelisteners.push(func);
      }
      else
      {
        loop:for(var x=0,len=this.__kbdatacreatelisteners.length;x<len;x++)
        {
          if(this.__kbdatacreatelisteners[x].toString() === func.toString())
          {
            this.__kbdatacreatelisteners.splice(x,1);
            break loop;
          }
        }
      }
    }
    else
    {
      if(!remove)
      {
        _dataAddedListeners.push(func);
      }
      else
      {
        loop:for(var x=0,len=_dataAddedListeners.length;x<len;x++)
        {
          if(_dataAddedListeners[x].toString() === func.toString())
          {
            _dataAddedListeners.splice(x,1);
            break loop;
          }
        }
      }
    }
  }

  model.addDataCreateListener = function(func)
  {
    dataCreate.call(this,func);
    return model;
  }

  model.removeDataCreateListener = function(func)
  {
    dataCreate.call(this,func,true);
    return model;
  }

  function removeListener(prop,func,update,child)
  {
    var _listeners;
    if(!(this.toString() === model.toString()))
    {
      if(!child)
      {
        _listeners = (update ? this.__kbupdatelisteners : this.__kblisteners);
        loop:for(var x=0,len=_listeners[prop].length;x<len;x++)
        {
          if(_listeners[prop][x].toString() === func.toString())
          {
            _listeners[prop].splice(x,1);
            break loop;
          }
        }
      }
      else
      {
        parentloop(this,prop,func,update,true,true);
      }
    }
    else
    {
      _listeners = (update ? _dataUpdateListeners : _dataListeners);
      loop:for(var x=0,len=_listeners[prop].length;x<len;x++)
      {
        if(_listeners[prop][x].toString() === func.toString())
        {
          _listeners[prop].splice(x,1);
          break loop;
        }
      }
    }
  }

  function removeChildDataListener(prop,func)
  {
    model.removeDataListener.call(this,prop,func,true);
  }

  function removeChildDataUpdateListener(prop,func)
  {
    model.removeDataUpdateListener.call(this,prop,func,true);
  }

  model.removeDataListener = function(scopeString,func,children)
  {
    removeListener.call(this,scopeString,func,false,children);
    return model;
  }

  model.removeDataUpdateListener = function(scopeString,func,children)
  {
    removeListener.call(this,scopeString,func,true,children);
    return model;
  }

  return model;
});
