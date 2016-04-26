define([],function(){
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
})
