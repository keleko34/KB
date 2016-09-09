define([],function(){

  var _model = {},
      _viewmodels = {},
      _dataListeners = {},
      _dataUpdateListeners = {},
      _set = function()
      {

      },
      _update = function()
      {

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
    var scope =(isObject(obj) ? obj.__kbscopeString : (typeof obj === 'string' ? obj : ''));
    if(isArray(obj))
    {
      return scope+"["+prop+"]";
    }
    else
    {
      return (scope.length !== 0 "."+prop ? : "prop");
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

  function _changeEvent(viewmodel,name,obj,value,oldValue,scopeString,key,args,action)
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
        _key = prop,
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
      val.__kbname = (obj.__kbname !== undefined ? obj.__kbname : obj);
      val.__kbref = (obj.__kbref !== undefined ? obj.__kbref : obj);
      val.__kbscopeString = (obj.__kbscopeString ? getScopeString(obj.__kbscopeString,val) : "");
      val.toJSON = function(){
        return deepCopy(this,{},function(k,v){
          if(k !== '__kbref' && k !== '__kbname' && k !== '__kbscopeString') return v;
        });
      }
      Object.define((set || obj),prop,setNormal(val,prop,_set,_update,obj.__kbname,obj.__kbref,obj.__kbscopeString));
    }
    else if(isArray(obj[prop]))
    {
      val = model.observableArray();
      for(var x=0,len=obj[prop].length;x<len;x++)
      {
        loopCreateObservable(obj[prop],x,val);
      }
      val.__kbname = (obj.__kbname !== undefined ? obj.__kbname : obj);
      val.__kbref = (obj.__kbref !== undefined ? obj.__kbref : obj);
      val.__kbscopeString = (obj.__kbscopeString ? getScopeString(obj.__kbscopeString,val) : "");
      val.toJSON = function(){
        return deepCopy(this,{},function(k,v){
          if(k !== '__kbref' && k !== '__kbname' && k !== '__kbscopeString') return v;
        });
      }
      Object.define((set || obj),prop,setNormal((set || obj),prop,_set,_update,obj.__kbname,obj.__kbref,obj.__kbscopeString));
    }
    else
    {
      val = obj[prop];
      Object.define((set || obj),prop,setNormal((set || obj),prop,_set,_update,obj.__kbname,obj.__kbref,obj.__kbscopeString));
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
          /* should send an update script here, like itemAdded */
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
    arr.add = function()
    {

    }

    arr.remove = function()
    {

    }

    return arr;
  }

  model.observableObject = function()
  {
    var obj = {};

    obj.add = function()
    {

    }

    obj.remove = function()
    {

    }

    obj.stringify = function()
    {
      return JSON.stringify(obj);
    }

    return {};
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

  model.setViewModel = function(name,data)
  {
    if(isObject(data))
    {

    }
    else if(data === 'function')
    {

    }
  }

  model.isRegistered = function(name)
  {

  }

  model.getModel = function()
  {
    return _model;
  }







  model.setToModel = function(attr,value)
  {

  }

  model.setViewModel = function(el,vm)
  {

  }

  return viewmodel;
});
