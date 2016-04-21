var CreateKB = (function(){
	function CreateKB(){

      /* BUILD SECTION */



      /* END BUILD SECTION */

        var _attrListeners = {};

        function Bind()
        {
          var changeEvent = function(el,attr,value,oldValue){
            this.stopPropagation = function(){this._stopPropogation = true;};
            this._stopPropogation = false;
            this.preventDefault = function(){this._preventDefault = true;};
            this.value = value;
            this.oldValue = oldValue;
            this.target = el;
            this.attr = attr;
          }

          var set = function(el,prop,val,ret){
            var e = new changeEvent(el,prop,val,ret);
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
          Bind.inject(Node,set);
          Bind.inject(Element,set);
          Bind.inject(HTMLElement,set);
          Bind.inject(Document,set);
        }

        Bind.inject = function(obj,set){
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
                          var action = _functions[key].apply(this,arguments);
                          set(this,key,arguments,action);
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
}())
