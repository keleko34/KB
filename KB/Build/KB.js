var CreateKB = (function(){
	function CreateKB(){

        var _attrListeners = {}
          , _attrUpdateListeners = {}
          , _injected = []
          , _inputs = [];

        function Bind()
        {
          var changeEvent = function(el,attr,value,oldValue,args,action){
            this.stopPropagation = function(){this._stopPropogation = true;};
            this.preventDefault = function(){this._preventDefault = true;};
            this.value = value;
            this.oldValue = oldValue;
            this.target = el;
            this.attr = attr;
            this.arguments = args;
            this.action = action;
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

          var update = function(el,prop,val,ret,args,action){
            var e = new changeEvent(el,prop,val,ret,args,action);
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

          var reSyncInputs = function(){
            var x=0,
                i = document.getElementsByTagName('INPUT');
            for(x=0;x<_inputs.length;x++)
            {
              if(_inputs[x].parentElement === undefined)
              {
                _inputs[x].kb_removeInputBinding();
                _inputs.splice(x,1);
              }
            }
            for(x=0;x<i.length;x++)
            {
              if(i[x].kb_onkeydown === undefined)
              {
                i[x].kb_addInputBinding();
              }
            }
          }

          Bind.inject(HTMLInputElement,set,update);
          Bind.inject(Node,set,update);
          Bind.inject(Element,set,update);
          Bind.inject(HTMLElement,set,update);
          Bind.inject(Document,set,update);


          //for keeping binds with inputs
          Bind.addAttrUpdateListener('appendChild',reSyncInputs);
          Bind.addAttrUpdateListener('removeChild',reSyncInputs);
          Bind.addAttrUpdateListener('innerHTML',reSyncInputs);
          Bind.addAttrUpdateListener('outerHTML',reSyncInputs);
          Bind.addAttrUpdateListener('innerText',reSyncInputs);
          Bind.addAttrUpdateListener('outerText',reSyncInputs);
          Bind.addAttrUpdateListener('textContent',reSyncInputs);

          reSyncInputs();
        }

        Bind.inject = function(obj,set,update){
          var _proto = obj.prototype,
              _injectName = obj.toString().split(/\s+/)[1].split('{')[0].replace('()',''),
              _keys = Object.keys(_proto),
              x,
              _descriptors = {},
              _functions = {},
              _onKeyDown = function(e){
                var oldValue = this.value;
                setTimeout((function(){
                  console.log('yay',this.value);
                  if(!set(this,'value',this.value,oldValue))
                  {
                    _descriptors["value"].set.call(this,oldValue);
                  }
                  else
                  {
                    if(typeof update === 'function')
                    {
                      update(this,"value",this.value,oldValue);
                    }
                  }
                }).bind(this),0);
              }

          if(_injected.indexOf(_injectName) > -1) return;

          _injected.push(_injectName);

          if(_keys.indexOf("value") > -1)
          {
            var removeInputBinding = function(){
              this.kb_onkeydown = undefined;
              this.removeEventListener('keydown',_onKeyDown);
            }
            var addInputBinding = function(){
              this.kb_onkeydown = true;
              this.addEventListener('keydown',_onKeyDown);
            }

            Object.defineProperty(_proto,"kb_removeInputBinding",{value:removeInputBinding});
            Object.defineProperty(_proto,"kb_addInputBinding",{value:addInputBinding});
          }


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

        Bind.injected = function()
        {
          return _injected;
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
}())
