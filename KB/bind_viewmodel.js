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

  function isArray(v)
  {
    return (typeof v === 'object' && !!v && v.constructor.toString() === Array.toString());
  }

  function isObject(v)
  {
    return (typeof v === 'object' && !!v && v.constructor.toString() !== Array.toString());
  }

  function deepCopy(obj,obj2)
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
        obj2[keys[x]] = {};
        deepCopy(key,obj2[keys[x]]);
      }
      else if(isArray(key))
      {
        obj2[keys[x]] = [];
        deepCopy(key,obj2[keys[x]]);
      }
      else
      {
        obj2[keys[x]] = key;
      }
    }
    return obj2;
  }

  function _changeEvent(viewmodel,vm,obj,value,oldValue,scopeString,key,args,action)
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

  function model()
  {
    return viewmodel;
  }

  model.isObject = isObject;

  model.isArray = isArray;

  model.deepCopy = deepCopy;

  model.createViewModel = function(data)
  {
    if(isObject(data))
    {

    }
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
