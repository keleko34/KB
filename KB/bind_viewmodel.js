define([],function(){

  var _model = {},
      _viewmodels = {},
      _dataListeners = {},
      _dataUpdateListeners = {},
      _set = function(local,key,value,oldValue,name,obj,scopeString)
      {
        var e = _changeEvent(_viewmodels[name],name,obj,value,oldValue,scopeString,key);

        if(e._preventDefault) return false;
        return true;
      },
      _update = function(local,key,value,oldValue,name,obj,scopeString)
      {
        var e = _changeEvent(_viewmodels[name],name,obj,value,oldValue,scopeString,key);

        if(e._preventDefault) return false;
        return true;
      },
      _added = function(local,key,value,oldValue,name,obj,scopeString)
      {
        var e = _changeEvent(_viewmodels[name],name,obj,value,oldValue,scopeString,key);

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
    if(isArray(obj))
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

  function _changeEvent(viewmodel,name,obj,local,value,oldValue,scopeString,key,args,action)
  {
    this.stopPropagation = function(){this._stopPropogation = true;};
    this.preventDefault = function(){this._preventDefault = true;};
    this.viewModel = viewmodel;
    this.viewModelKey = vm;
    this.scope = obj;
    this.value = value;
    this.oldValue = oldValue;
    this.scopeString = scopeString;
    this.key = key;
    this.args = args;
    this.action = action;
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
       if(_set(this,_key,v,_oldValue,_name,_obj,_scopeString))
       {
         _val = v;
         if(isObject(v) || isArray(v))
         {
           model.createObservable(_name,this,_key);
         }
       }
       _update(this,_key,v,_oldValue,_name,_obj,_scopeString);

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

      for(var x=0,len=keys.length;x<len;x++)
      {
        loopCreateObservable(obj[prop],keys[x],val);
      }
      val.__kbname = (obj.__kbname !== undefined ? obj.__kbname : "");
      val.__kbref = (obj.__kbref !== undefined ? obj.__kbref : obj);
      val.__kbscopeString = ((obj.__kbscopeString || obj.__kbscopeString.length === 0) ? getScopeString(obj.__kbscopeString,prop) : "");
      val.toJSON = function(){
        return deepCopy(this,{},function(k,v){
          if(k !== '__kbref' && k !== '__kbname' && k !== '__kbscopeString') return v;
        });
      }
      Object.defineProperty((set || obj),prop,setNormal(val,prop,_set,_update,obj.__kbname,obj.__kbref,obj.__kbscopeString));
    }
    else if(isArray(obj[prop]))
    {
      val = model.observableArray();
      for(var x=0,len=obj[prop].length;x<len;x++)
      {
        loopCreateObservable(obj[prop],x,val);
      }
      val.__kbname = (obj.__kbname !== undefined ? obj.__kbname : "");
      val.__kbref = (obj.__kbref !== undefined ? obj.__kbref : obj);
      val.__kbscopeString = ((obj.__kbscopeString || obj.__kbscopeString.length === 0)  ? getScopeString(obj.__kbscopeString,prop) : "");
      val.toJSON = function(){
        return deepCopy(this,{},function(k,v){
          if(k !== '__kbref' && k !== '__kbname' && k !== '__kbscopeString') return v;
        });
      }
      Object.defineProperty((set || obj),prop,setNormal(val,prop,_set,_update,obj.__kbname,obj.__kbref,obj.__kbscopeString));
    }
    else
    {
      val = obj[prop];
      Object.defineProperty((set || obj),prop,setNormal(val,prop,_set,_update,obj.__kbname,obj.__kbref,obj.__kbscopeString));
    }
    return (set || obj);
  }

  function model()
  {



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
    arr.splice = function()
    {
      var ret = Array.prototype.splice.apply(this,arguments);
      updateCheck(this);
      return ret;
    }

    arr.push = function()
    {
      var ret = Array.prototype.push.apply(this,arguments);
      updateCheck(this);
      return ret;
    }

    arr.pop = function()
    {
      var ret = Array.prototype.pop.apply(this,arguments);
      updateCheck(this);
      return ret;
    }

    arr.shift = function()
    {
      var ret = Array.prototype.shift.apply(this,arguments);
      updateCheck(this);
      return ret;
    }

    arr.unshift = function()
    {
      var ret = Array.prototype.unshift.apply(this,arguments);
      updateCheck(this);
      return ret;
    }

    arr.fill = function()
    {
      var ret = Array.prototype.fill.apply(this,arguments);
      updateCheck(this);
      return ret;
    }

    arr.reverse = function()
    {
      var ret = Array.prototype.reverse.apply(this,arguments);
      updateCheck(this);
      return ret;
    }

    arr.sort = function()
    {
      var ret = Array.prototype.sort.apply(this,arguments);
      updateCheck(this);
      return ret;
    }

    /* add our own methods for adding and removing and keeping the values observable */
    arr.add = function(val)
    {
      Object.defineProperty(arr,(arr.length),setNormal(val,(arr.length),_set,_update,arr.__kbname,arr.__kbref,arr.__kbscopeString));
      if(!_added(arr,(arr.length),val,undefined,arr.__kbname,arr.__kbref,arr.__kbscopeString))
      {
        arr.remove((arr.length-1));
      }
      return arr;
    }

    arr.remove = function(val)
    {
      if(arr.indexOf(val) !== undefined)
      {
        arr.splice(arr.indexOf(val),1);
      }
      else if(typeof val === 'number')
      {
        arr.splice(val,1);
      }
      return arr;
    }

    arr.toJSON = function(val)
    {
      return deepCopy(this,[],function(k,v)
      {
        if(k !== '__kbref' && k !== '__kbname' && k !== '__kbscopeString') return v;
      });
    }

    arr.addPropertyListener = model.addPropertyListener;
    arr.addPropertyUpdateListener = model.addPropertyUpdateListener;
    arr.addChildPropertyListener = addChildPropertyListener;
    arr.addChildPropertyUpdateListener = addChildPropertyUpdateListener;

    return arr;
  }

  model.observableObject = function()
  {
    var obj = {};

    obj.add = function(prop,val)
    {
      Object.defineProperty(obj,prop,setNormal(val,prop,_set,_update,obj.__kbname,obj.__kbref,obj.__kbscopeString));
      if(!_added(obj,prop,val,undefined,obj.__kbname,obj.__kbref,obj.__kbscopeString))
      {
        obj.remove(prop);
      }
      return obj;
    }

    obj.remove = function(prop)
    {
      obj[prop] = undefined;
      return obj;
    }

    obj.stringify = function()
    {
      return JSON.stringify(obj);
    }

    obj.toJSON = function(val)
    {
      return deepCopy(this,{},function(k,v)
      {
        if(k !== '__kbref' && k !== '__kbname' && k !== '__kbscopeString') return v;
      });
    }

    obj.addPropertyListener = model.addPropertyListener;
    obj.addPropertyUpdateListener = model.addPropertyUpdateListener;
    obj.addChildPropertyListener = addChildPropertyListener;
    obj.addChildPropertyUpdateListener = addChildPropertyUpdateListener;

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
        obj.__kbname = name;
        obj.__kbref = obj;
        obj.__kbscopeString = "";
      }
      else if(isArray(obj))
      {
        var newArr = model.observableArray();
        for(var x=0,len = obj.length;x<len;x++)
        {
          newObj[x] = obj[x];
        }
        obj = newObj;
        obj.__kbname = name;
        obj.__kbref = obj;
        obj.__kbscopeString = "";
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
  }

  model.createViewModel = function(name,params)
  {
    if(model.isRegistered(name))
    {
      var _vm = Object.create(_viewmodels[name].prototype);
          _viewmodels[name].apply(_vm,params);
          var vmKeys = Object.keys(_vm),
          obsv = model.observableObject();
      obsv.__proto__ = _vm.__proto__;
      obsv.__kbname = name;
      obsv.__kbref = obsv;
      obsv.__kbscopeString = "";
      for(var x=0,len=vmKeys.length;x<len;x++)
      {
        obsv[vmKeys[x]] = _vm[vmKeys[x]];
        model.createObservable(name,obsv,vmKeys[x]);
      }
      obsv.constructor = _viewmodels[name];
      return obsv;
    }
    else
    {
      console.error("There is no viewmodel by the name ",name);
    }
  }

  model.isRegistered = function(name)
  {
    return (_viewmodels[name] !== undefined);
  }

  model.getModel = function()
  {
    return _model;
  }

  function addListener(prop,func,update,child)
  {
    if(!update)
    {
      if(child)
      {

      }
      else
      {

      }
    }
    else
    {
      if(child)
      {

      }
      else
      {

      }
    }
  }

  function addChildPropertyListener(prop,func)
  {
    model.addPropertyListener.call(this,prop,func,true);
  }

  function addChildPropertyUpdateListener(prop,func)
  {
    model.addPropertyUpdateListener.call(this,prop,func,true);
  }

  model.addPropertyListener = function(scopeString,func,children)
  {
    addListener.call(this,scopeString,func,false,children);
  }

  model.addPropertyUpdateListener = function(scopeString,func,children)
  {
    addListener.call(this,scopeString,func,true,children);
  }

  return model;
});
