var CreateKB = (function(){
	function CreateKB(){
        
        //holds all preset listeners per attribute eg: {innerHTML:[func,func,func]}
        var _attrListeners = {}
        //holds all postset listeners per attribute eg: {innerHTML:[func,func,func]}
          , _attrUpdateListeners = {} 
        //holds all injected objects and thier descriptors, functions and set and update functions eg: {HTMLElement:{obj:HTMLElement,proto:HTMLElement.prototype,descriptors:{},functions:{},set:function(){},update:function(){}}}
          , _injected = {} 
        //holds all synced inputs for checking value updates
          , _inputs = [] 
        //used in all for loops
          , x; 

      
        /*** MAIN CONSTRUCTOR ***/
        function Bind()
        {
          //the base event object that is passed to every listeners upon change
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
          
          //the set function that runs on all changes
          var set = function(el,prop,val,ret,args){
            var e = new changeEvent(el,prop,val,ret,args);
            var ret = true;
            if(_attrListeners[prop] !== undefined)
            {
              for(x=0;x<_attrListeners[prop].length;x+=1)
              {
                _attrListeners[prop][x].call(el,e);
                if(e._stopPropogation)
                {
                  return ret;
                }
                if(e._preventDefault)
                {
                  ret = false;
                }
              }
            }
            return ret;
          }

          //the update function that runs on all changes
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

          //resyncs inputs in case new ones were added to the DOM or old ones were removed
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
          
          //checks attributes inside of setAttribute and removeAttribute
          var checkAttributes = function(e)
          {
            var et = new changeEvent(e.target,e.arguments[0],(e.attr === 'setAttribute' ? e.arguments[1] : ""),e.target.getAttribute(e.arguments[0]),(e.attr === 'setAttribute' ? [e.arguments[1]] : [""]));
            if(_attrListeners[et.attr] !== undefined)
            {
              for(x=0;x<_attrListeners[et.attr].length;x+=1)
              {
                _attrListeners[et.attr][x].call(et.target,et);
                if(et._stopPropogation)
                {
                  e.stopPropagation();
                }
                if(et._preventDefault)
                {
                  e.preventDefault();
                }
              }
            }
          }
          
          var checkUpdateAttributes = function(e)
          {
            var et = new changeEvent(e.target,e.arguments[0],(e.attr === 'setAttribute' ? e.arguments[1] : ""),e.target.getAttribute(e.arguments[0]),(e.attr === 'setAttribute' ? [e.arguments[1]] : [""]));
            if(_attrUpdateListeners[et.attr] !== undefined)
            {
              for(x=0;x<_attrUpdateListeners[et.attr].length;x+=1)
              {
                _attrUpdateListeners[et.attr][x].call(et.target,et);
                if(et._stopPropogation)
                {
                  e.stopPropagation();
                }
              }
            }
          }

          //injects main prototypes for listening to dom changes
          Bind.inject(HTMLInputElement,set,update);
          Bind.inject(Node,set,update);
          Bind.inject(Element,set,update);
          Bind.inject(HTMLElement,set,update);
          Bind.inject(Document,set,update);
          
          var injectedKeys = Object.keys(_injected);
          
          //checks if any objects were injected without a set, if so the default set and get are added
          for(x=0;x<injectedKeys.length;x++)
          {
            if(_injected[injectedKeys[x]].set === undefined)
            {
              Bind.inject(_injected[injectedKeys[x]].obj,set,update);
            }
          }
          
          Object.keys(_injected).forEach(function(k,i){});

          //for keeping binds with inputs
          Bind.addAttrUpdateListener('appendChild',reSyncInputs);
          Bind.addAttrUpdateListener('removeChild',reSyncInputs);
          Bind.addAttrUpdateListener('innerHTML',reSyncInputs);
          Bind.addAttrUpdateListener('outerHTML',reSyncInputs);
          Bind.addAttrUpdateListener('innerText',reSyncInputs);
          Bind.addAttrUpdateListener('outerText',reSyncInputs);
          Bind.addAttrUpdateListener('textContent',reSyncInputs);
          
          //allows for html attribute changes to be listened to just like properties
          Bind.addAttrListener('setAttribute',checkAttributes);
          Bind.addAttrListener('removeAttribute',checkAttributes);
          
          Bind.addAttrUpdateListener('setAttribute',checkUpdateAttributes);
          Bind.addAttrUpdateListener('removeAttribute',checkUpdateAttributes);
          
          //initially adds inputs for watching
          reSyncInputs();
        }

        Bind.injectProperty = function(obj,key,set,update)
        {
          var _proto = obj.prototype,
              _descriptor = Object.getOwnPropertyDescriptor(_proto,key),
              _injectName = obj.toString().split(/\s+/)[1].split('{')[0].replace('()','');
          if(_injected[_injectName] === undefined)
          {
            _injected[_injectName] = {obj:obj,proto:_proto,descriptors:{},set:undefined,update:undefined};
          }
          _injected[_injectName].set = (set !== undefined ? set : _injected[_injectName].set);
          _injected[_injectName].update = (update !== undefined ? update : _injected[_injectName].update);
          
          _injected[_injectName].descriptors[key] = _descriptor;
          
          if(_descriptor.set !== undefined && _descriptor.configurable)
          {
              Object.defineProperty(_proto,key,{
                  get:_descriptor.get,
                  set:function(v)
                  {
                      var oldValue = _descriptor.get.apply(this);
                      if(typeof _injected[_injectName].set == 'function' && _injected[_injectName].set(this,key,v,oldValue,arguments))
                      {
                        _descriptor.set.apply(this,arguments);
                      }
                      if(typeof _injected[_injectName].update === 'function')
                      {
                        _injected[_injectName].update(this,key,v,oldValue);
                      }
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
                    var action = null;
                    if(typeof _injected[_injectName].set == 'function' && _injected[_injectName].set(this,key,null,null,arguments))
                    {
                      action =  _descriptor.value.apply(this,arguments);
                    }
                    if(typeof _injected[_injectName].update === 'function')
                    {
                      _injected[_injectName].update(this,key,null,null,arguments,action);
                    }
                    return action;
                  },
                  writable:true,
                  enumerable:true,
                  configurable:true
              });
          }
        else if(_descriptor.value !== undefined && _descriptor.configurable)
        {
          Object.defineProperty(_proto,key,{
              get:function()
              {
                return _descriptor.value;
              },
              set:function(v)
              {
                  var oldValue = _descriptor.value;
                  if(typeof _injected[_injectName].set == 'function' && _injected[_injectName].set(this,key,v,oldValue))
                  {
                    _descriptor.value = v;
                  }
                  if(typeof _injected[_injectName].update === 'function')
                  {
                    _injected[_injectName].update(this,key,v,oldValue);
                  }
              },
              enumerable:true,
              configurable:true
          });
        }
        }
      
        /*** Inject Method ***
         -- injects an objects prototypes to allow for property event listeners 
         */
        Bind.inject = function(obj,set,update){
          var _proto = obj.prototype,
              _injectName = obj.toString().split(/\s+/)[1].split('{')[0].replace('()',''),
              _keys = Object.keys(_proto),
              _descriptors = {},
              _onKeyDown = function(e){
                var oldValue = this.value;
                setTimeout((function(){
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
          
          if(_injected[_injectName] === undefined)
          {
            _injected[_injectName] = {obj:obj,proto:_proto,descriptors:{},set:undefined,update:undefined};
          }
          _injected[_injectName].set = set;
          _injected[_injectName].update = update;
          

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

            Object.defineProperty(_proto,"kb_removeInputBinding",{value:removeInputBinding,configurable:true,enumerable:true});
            Object.defineProperty(_proto,"kb_addInputBinding",{value:addInputBinding,configurable:true,enumerable:true});
          }


          for(x=0;x<_keys.length;x+=1)
          {
              if(_injected[_injectName].descriptors[_keys[x]] === undefined)
              {
                Bind.injectProperty(obj,_keys[x]);
              }
          }
          return Bind;
        }

        /*** Injected Accessor ***
         -- returns a list of the injected objects
         */
        Bind.injected = function()
        {
          return _injected;
        }

        /*** Pre Set Attribute Listener ***
         -- adds a property event listener to the desired property
         */
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

        /*** Post Set Attribute Listener ***
         -- adds a property event listener to the desired property
         */
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

        /*** Remove Pre Set Attribute Listener ***
         -- removes a property event listener from the desired property
         */
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

        /*** Remove Post Set Attribute Listener ***
         -- removes a property event listener from the desired property
         */
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
