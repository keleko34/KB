define([],function(){
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
          , x
        // used in all inner loops
          , i
        //travels up the dom return back all parents with child listeners
          , getParents = function(el,attr,update){
            var parents = [];
              while(el)
              {
                el = el.parentElement;
                if(el && el[(update ? "kb_childAttrUpdateListeners" : "kb_childAttrListeners")]()[attr] !== undefined){
                  parents.push(el);
                }
              }
              return parents;
            }
        //the base event object that is passed to every listeners upon change
          , _changeEvent = function(el,attr,value,oldValue,args,action){
              this.stopPropagation = function(){this._stopPropogation = true;};
              this.preventDefault = function(){this._preventDefault = true;};
              this.value = value;
              this.oldValue = oldValue;
              this.target = el;
              this.attr = attr;
              this.arguments = args;
              this.action = action;
              this.child = undefined;
            }
        //the set function that runs on all changes
          , _set = function(el,prop,val,ret,args){
              var e = new _changeEvent(el,prop,val,ret,args),
                  all = "*",
                  parents = getParents(el,prop);

              if(_attrListeners[all] !== undefined)
              {
                loop:for(x=0;x<_attrListeners[all].length;x+=1)
                {
                  _attrListeners[all][x].call(el,e);
                  if(e._stopPropogation) break loop;
                }
              }

              if(_attrListeners[prop] !== undefined && !e._stopPropogation)
              {
                loop:for(x=0;x<_attrListeners[prop].length;x+=1)
                {
                  _attrListeners[prop][x].call(el,e);
                  if(e._stopPropogation) break loop;
                }
              }

              if(el.kb_attrListeners !== undefined && el.kb_attrListeners()[prop] !== undefined && !e._stopPropogation)
              {
                loop:for(x=0;x<el.kb_attrListeners()[prop].length;x+=1)
                {
                  el.kb_attrListeners()[prop][x].call(el,e);
                  if(e._stopPropogation) break loop;
                }
              }
            
              if(parents.length > 0)
              {
                parentloop:for(x=0;x<parents.length;x++){
                  loop:for(i=0;i<parents[x].kb_childAttrListeners()[prop].length;i++)
                  {
                    e.child = el;
                    e.target = parents[x];
                    parents[x].kb_childAttrListeners()[prop][i].call(parents[x],e);
                    if(e._stopPropogation) break loop;
                  }
                }  
              }

              if(e._preventDefault) return false;

              return true;
            }
        //the update function that runs on all changes
          , _update = function(el,prop,val,ret,args,action){
            var e = new _changeEvent(el,prop,val,ret,args,action),
                all = "*",
                parents = getParents(el,prop,true);

            if(_attrUpdateListeners[all] !== undefined)
            {
              loop:for(var x=0;x<_attrUpdateListeners[all].length;x+=1)
              {
                _attrUpdateListeners[all][x].call(el,e);
                if(e._stopPropogation) break loop;
              }
            }

            if(_attrUpdateListeners[prop] !== undefined)
            {
              loop:for(var x=0;x<_attrUpdateListeners[prop].length;x+=1)
              {
                _attrUpdateListeners[prop][x].call(el,e);
                if(e._stopPropogation) break loop;
              }
            }

            if(el.kb_attrUpdateListeners !== undefined && el.kb_attrUpdateListeners[prop] !== undefined)
            {
              loop:for(var x=0;x<el.kb_attrUpdateListeners[prop].length;x+=1)
              {
                el.kb_attrUpdateListeners[prop][x].call(el,e);
                if(e._stopPropogation) break loop;
              }
            }
            
            if(parents.length > 0)
            {
              parentloop:for(x=0;x<parents.length;x++){
                loop:for(i=0;i<parents[x].kb_childAttrUpdateListeners()[prop].length;i++)
                {
                  e.child = el;
                  e.target = parents[x];
                  parents[x].kb_childAttrUpdateListeners()[prop][i].call(parent[x],e);
                  if(e._stopPropogation) break loop;
                }
              }  
            }

            if(e._preventDefault) return false;

            return true;
          }


        /*** MAIN CONSTRUCTOR ***/
        function Bind()
        {

          //resyncs inputs and styles in case new ones were added to the DOM or old ones were removed
          function reSync(e)
          {
            if(e.attr === 'outerHTML' || e.attr === 'outerText')
            {
              e.target = e.target.parentElement;
            }
            var x=0,
                extraInput = (e.attr === 'appendChild' && e.arguments[0].tagName === 'INPUT' ? e.arguments[0] : []),
                extraTextArea = (e.attr === 'appendChild' && e.arguments[0].tagName === 'TEXTAREA' ? e.arguments[0] : []),
                inputs = e.target.getElementsByTagName('INPUT'),
                inp = Array.prototype.slice.call(inputs).concat(extraInput)
                      .filter(function(k){return k.type !== 'radio' && k.type !== 'checkbox';})
                      .concat(Array.prototype.slice.call(e.target.getElementsByTagName('TEXTAREA')).concat(extraTextArea)),
                inc = Array.prototype.slice.call(inputs).concat(extraInput).filter(function(k){return k.type === 'radio' || k.type === 'checkbox'}),
                allStyles = Object.getOwnPropertyNames(e.target.style).filter(function(k){return (k !== 'kb_bind')}),
                all = Array.prototype.slice.call(e.target.querySelectorAll('*')).concat((e.attr === 'appendChild' ? [e.arguments[0]] : []))
                      .filter(function(k){return (k.nodeType !== 3 && k.nodeType !== 8)});

            for(x=0;x<inp.length;x++)
            {
              if(inp[x].kb_onkeydown === undefined)
              {
                inp[x].kb_addInputBinding();
              }
            }

            for(x=0;x<inc.length;x++)
            {
              if(inc[x].kb_onmousedown === undefined)
              {
                inc[x].kb_addInputBoxBinding();
              }
            }
            
            for(x=0;x<all.length;x++)
            {
              for(var i=0;i<allStyles.length;i++)
              {

                Bind.injectStyle(all[x],allStyles[i],_set,_update);
              }
            }
          }
          
          function syncInputs()
          {
            var x=0,
                inputs = document.getElementsByTagName('INPUT'),
                inp = Array.prototype.slice.call(inputs)
                      .filter(function(k){return k.type !== 'radio' && k.type !== 'checkbox';})
                      .concat(Array.prototype.slice.call(document.getElementsByTagName('TEXTAREA'))),
                inc = Array.prototype.slice.call(inputs).filter(function(k){return k.type === 'radio' || k.type === 'checkbox'});

            for(x=0;x<inp.length;x++)
            {
              if(inp[x].kb_onkeydown === undefined)
              {
                inp[x].kb_addInputBinding();
              }
            }

            for(x=0;x<inc.length;x++)
            {
              if(inc[x].kb_onmousedown === undefined)
              {
                inc[x].kb_addInputBoxBinding();
              }
            }
          }
          
          function syncStyles()
          {
            var allStyles = Object.getOwnPropertyNames(document.all[0].style);
            for(var x=0;x<document.all.length;x++)
            {
              for(var i=0;i<allStyles.length;i++)
              {
                Bind.injectStyle(document.all[x],allStyles[i],_set,_update);
              }
            }
          }
          

          //checks attributes inside of setAttribute and removeAttribute
          function checkAttributes(e)
          {
            var et = new _changeEvent(e.target,e.arguments[0],(e.attr === 'setAttribute' ? e.arguments[1] : ""),e.target.getAttribute(e.arguments[0]),(e.attr === 'setAttribute' ? [e.arguments[1]] : [""]));
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

          function checkUpdateAttributes(e)
          {
            var et = new _changeEvent(e.target,e.arguments[0],(e.attr === 'setAttribute' ? e.arguments[1] : ""),e.target.getAttribute(e.arguments[0]),(e.attr === 'setAttribute' ? [e.arguments[1]] : [""]));
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

          var injectedKeys = Object.keys(_injected);

          //checks if any objects were injected without a set, if so the default set and get are added
          for(x=0;x<injectedKeys.length;x++)
          {
            if(_injected[injectedKeys[x]].set === undefined)
            {
              Bind.injectPrototypes(_injected[injectedKeys[x]].obj,_set,_update);
            }
          }

          //for keeping binds with inputs
          Bind.addAttrUpdateListener('appendChild',reSync);
          Bind.addAttrUpdateListener('removeChild',reSync);
          Bind.addAttrUpdateListener('innerHTML',reSync);
          Bind.addAttrUpdateListener('outerHTML',reSync);
          Bind.addAttrUpdateListener('innerText',reSync);
          Bind.addAttrUpdateListener('outerText',reSync);
          Bind.addAttrUpdateListener('textContent',reSync);

          //allows for html attribute changes to be listened to just like properties
          Bind.addAttrListener('setAttribute',checkAttributes);
          Bind.addAttrListener('removeAttribute',checkAttributes);

          Bind.addAttrUpdateListener('setAttribute',checkUpdateAttributes);
          Bind.addAttrUpdateListener('removeAttribute',checkUpdateAttributes);
          
          //initially adds all styles for watching
          syncStyles();
          
          //initially adds inputs for watching
          syncInputs();
        }

        Bind.injectPrototypeProperty = function(obj,key,set,update,_injectName)
        {
          var _proto = obj.prototype,
              _descriptor = Object.getOwnPropertyDescriptor(_proto,key),
              _injectName = (_injectName || obj.toString().split(/\s+/)[1].split('{')[0].replace('()',''));

          if(_proto.addAttrListener === undefined && _proto.kb_attrListeners === undefined)
          {
            _proto.kb_attrListeners = function(){
              if(this._kb_attrListeners === undefined){
                this._kb_attrListeners = {};
              }
              return this._kb_attrListeners;
            };
            _proto.addAttrListener = Bind.addAttrListener;
            _proto.removeAttrListener = Bind.removeAttrListener;
          }
          if(_proto.hasOwnProperty('children') &&  _proto.addChildAttrListener === undefined && _proto.kb_childAttrListeners === undefined)
          {
            _proto.kb_childAttrListeners = function(){
              if(this._kb_childAttrListeners === undefined){
                this._kb_childAttrListeners = {};
              }
              return this._kb_childAttrListeners;
            };

            _proto.addChildAttrListener = addChildAttrListener;
            _proto.getchildAttrListeners = function()
            {
              return this.kb_childAttrListeners();
            }
          }
          if(_proto.addAttrUpdateListener === undefined && _proto.kb_attrUpdateListeners === undefined)
          {
            _proto.kb_attrUpdateListeners = function(){
              if(this._kb_attrUpdateListeners === undefined){
                this._kb_attrUpdateListeners = {};
              }
              return this._kb_attrUpdateListeners;
            };
            _proto.addAttrUpdateListener = Bind.addAttrUpdateListener;
            _proto.removeAttrUpdateListener = Bind.removeAttrUpdateListener;
            
          }
          if(_proto.hasOwnProperty('children') &&  _proto.addChildAttrUpdateListener === undefined && _proto.kb_childAttrUpdateListeners === undefined)
          {
            _proto.kb_childAttrUpdateListeners = function(){
              if(this._kb_childAttrUpdateListeners === undefined){
                this._kb_childAttrUpdateListeners = {};
              }
              return this._kb_childAttrUpdateListeners;
            };

            _proto.addChildAttrUpdateListener = addChildAttrUpdateListener;
            _proto.getchildAttrUpdateListeners = function()
            {
              return this.kb_childAttrUpdateListeners();
            }
          }

          if(_injected[_injectName] === undefined)
          {
            _injected[_injectName] = {obj:obj,proto:_proto,descriptors:{},set:undefined,update:undefined};
          }
          _injected[_injectName].set = (set ? set : _injected[_injectName].set);
          _injected[_injectName].update = (update ? update : _injected[_injectName].update);

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
        Bind.injectPrototypes = function(obj,set,update)
        {
          var _proto = obj.prototype,
              _injectName = obj.toString().split(/\s+/)[1].split('{')[0].replace('()',''),
              _keys = Object.getOwnPropertyNames(_proto),
              _descriptors = {},
              _onKeyDown = function(e){
                var isCheck = false;
                var oldCheck = "false";
                if(this.type === 'checkbox' || this.type === 'radio')
                {
                  oldCheck = this.checked;
                  isCheck = true;
                }
                var oldValue = (isCheck ? (typeof this.checked === 'string' ? (this.checked === 'true' ? "on" : "off") : (this.checked ? "on" : "off")) : this.value);
                setTimeout((function(){
                  if(isCheck && !_injected[_injectName].set(this,"checked",this.checked,oldCheck))
                  {
                    _descriptors["checked"].set.call(this,oldCheck);
                  }
                  else if(isCheck)
                  {
                    if(typeof _injected[_injectName].update === 'function')
                    {
                      _injected[_injectName].update(this,"checked",this.checked,oldValue);
                    }
                  }
                  this.value = (isCheck ? (typeof this.checked === 'string' ? (this.checked === 'true' ? "on" : "off") : (this.checked ? "on" : "off")) : this.value);

                  if(!_injected[_injectName].set(this,'value',this.value,oldValue))
                  {
                    _descriptors["value"].set.call(this,oldValue);
                  }
                  else
                  {
                    if(typeof _injected[_injectName].update === 'function')
                    {
                      _injected[_injectName].update(this,"value",this.value,oldValue);
                    }
                  }
                }).bind(this),0);
              }

          if(_injected[_injectName] === undefined)
          {
            _injected[_injectName] = {obj:obj,proto:_proto,descriptors:{},set:undefined,update:undefined};
          }
          _injected[_injectName].set = (set || _set);
          _injected[_injectName].update = (update || _update);


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

            var removeInputBoxBinding = function(){
              this.kb_onmousedown = undefined;
              this.removeEventListener('mouseup',_onKeyDown);
            }
            var addInputBoxBinding = function(){
              this.kb_onmousedown = true;
              this.addEventListener('mouseup',_onKeyDown);
            }

            Object.defineProperty(_proto,"kb_removeInputBinding",{value:removeInputBinding,configurable:true,enumerable:true});
            Object.defineProperty(_proto,"kb_addInputBinding",{value:addInputBinding,configurable:true,enumerable:true});

            Object.defineProperty(_proto,"kb_removeInputBoxBinding",{value:removeInputBoxBinding,configurable:true,enumerable:true});
            Object.defineProperty(_proto,"kb_addInputBoxBinding",{value:addInputBoxBinding,configurable:true,enumerable:true});
          }


          for(x=0;x<_keys.length;x+=1)
          {
              if(_injected[_injectName].descriptors[_keys[x]] === undefined)
              {
                Bind.injectPrototypeProperty(obj,_keys[x],null,null,_injectName);
              }
          }
          return Bind;
        }
        
        Bind.injectStyle = function(el,key,set,update)
        {
          var _descriptor = Object.getOwnPropertyDescriptor(el.style,key),
              _proto = el.style;
          
          if(el.style.kb_bind === undefined)
          {
            el.style.kb_bind = {obj:el,proto:_proto,descriptors:{},set:undefined,update:undefined};
          }
          el.style.kb_bind.set = (set ? set : _injected[_injectName].set);
          el.style.kb_bind.update = (update ? update : _injected[_injectName].update);

          el.style.kb_bind.descriptors[key] = _descriptor;
          
          if(_descriptor.value !== undefined && _descriptor.configurable)
          {
            Object.defineProperty(_proto,key,{
                get:function()
                {
                  return _descriptor.value;
                },
                set:function(v)
                {
                    var oldValue = _descriptor.value;
                    if(typeof el.style.kb_bind.set == 'function' && el.style.kb_bind.set(el,key,v,oldValue))
                    {
                      _descriptor.value = v;
                      el.style.setProperty(key.replace(/([A-Z])/g, "-$1").replace('webkit','-webkit'),v);
                    }
                    if(typeof el.style.kb_bind.update === 'function')
                    {
                      el.style.kb_bind.update(el,key,v,oldValue);
                    }
                },
                enumerable:true,
                configurable:true
            });
          }
          return Bind;
        }

        /*** Injected Accessor ***
         -- returns a list of the injected objects
         */
        Bind.injectedPrototypes = function()
        {
          return _injected;
        }

        /*** Pre Set Attribute Listener ***
         -- adds a property event listener to the desired property
         */
        Bind.addAttrListener = function(attr,func,child)
        {
          if(this.toString() !== Bind.toString())
          {
            if(this.kb_attrListeners()[attr] === undefined)
            {
              this.kb_attrListeners()[attr] = [];
            }
            if(child && this.kb_childAttrListeners()[attr] === undefined)
            {
              this.kb_childAttrListeners()[attr] = [];
            }
            if(typeof func === 'function')
            {
              if(child)
              {
                this.kb_childAttrListeners()[attr].push(func);
              }
              else
              {
                this.kb_attrListeners()[attr].push(func);
              }
            }
            return this;
          }
          else
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
        }
        
        /*** Pre Set Child Attribute Listener ***
         -- adds a property event listener to the desired property on self and all children
         */
        function addChildAttrListener(attr,func)
        {
            Bind.addAttrListener.call(this,attr,func,true);
        }

        /*** Post Set Attribute Listener ***
         -- adds a property event listener to the desired property
         */
        Bind.addAttrUpdateListener = function(attr,func,child)
        {
          if(this.toString() !== Bind.toString())
          {
            if(this.kb_attrUpdateListeners()[attr] === undefined)
            {
              this.kb_attrUpdateListeners()[attr] = [];
            }
            if(child && this.kb_childAttrUpdateListeners()[attr] === undefined)
            {
              this.kb_childAttrUpdateListeners()[attr] = [];  
            }
            if(typeof func === 'function')
            {
              if(child)
              {
                this.kb_childAttrUpdateListeners()[attr].push(func);
              }
              else
              {
                this.kb_attrUpdateListeners()[attr].push(func);
              }
            }
            return this;
          }
          else
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
        }
        
        /*** Post Set Attribute Listener ***
         -- adds a property event listener to the desired property on all child elements
         */
        function addChildAttrUpdateListener(attr,func)
        {
          Bind.addAttrUpdateListener.call(this,attr,func,true);
        }

        /*** Pre Attribute Listeners ***
         -- returns the object of all listeners
         */
        Bind.getAttrListeners = function()
        {
          if(this.toString() !== Bind.toString())
          {
            return this.kb_attrListeners();
          }
          return _attrListeners;
        }

        /*** Post Attribute Listeners ***
         -- returns the object of all listeners
         */
        Bind.getAttrUpdateListeners = function()
        {
          if(this.toString() !== Bind.toString())
          {
            return this.kb_attrUpdateListeners();
          }
          return _attrUpdateListeners;
        }

        /*** Remove Pre Set Attribute Listener ***
         -- removes a property event listener from the desired property
         */
        Bind.removeAttrListener = function(attr,func)
        {
          if(this.toString() !== Bind.toString())
          {
            if(this.kb_attrListeners !== undefined && this.kb_attrListeners()[attr] !== undefined && typeof func === 'function')
            {
              for(var x=0;x<this.kb_attrListeners()[attr].length;x+=1)
              {
                if(this.kb_attrListeners()[attr][x].toString() === func.toString())
                {
                  this.kb_attrListeners()[attr].splice(x,1);
                }
              }
              if(this.kb_childAttrListeners()[attr] !== undefined)
              {
                for(var x=0;x<this.kb_childAttrListeners()[attr].length;x+=1)
                {
                  if(this.kb_childAttrListeners()[attr][x].toString() === func.toString())
                  {
                    this.kb_childAttrListeners()[attr].splice(x,1);
                  }
                }
              }
            }
            return this;
          }
          else
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
            return Bind;
          }
        }

        /*** Remove Post Set Attribute Listener ***
         -- removes a property event listener from the desired property
         */
        Bind.removeAttrUpdateListener = function(attr,func)
        {
          if(this.toString() !== Bind.toString())
          {
            if(this.kb_attrUpdateListeners !== undefined && this.kb_attrUpdateListeners()[attr] !== undefined && typeof func === 'function')
            {
              for(var x=0;x<this.kb_attrUpdateListeners()[attr].length;x+=1)
              {
                if(this.kb_attrUpdateListeners()[attr][x].toString() === func.toString())
                {
                  this.kb_attrUpdateListeners()[attr].splice(x,1);
                }
              }
              if(this.kb_childAttrUpdateListeners()[attr] !== undefined)
              {
                for(var x=0;x<this.kb_childAttrUpdateListeners()[attr].length;x+=1)
                {
                  if(this.kb_childAttrUpdateListeners()[attr][x].toString() === func.toString())
                  {
                    this.kb_childAttrUpdateListeners()[attr].splice(x,1);
                  }
                }
              }
            }
            return this;
          }
          else
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
            return Bind;
          }
        }

        //injects main prototypes for listening to dom changes
        Bind.injectPrototypes(Node,_set,_update);
        Bind.injectPrototypes(Element,_set,_update);
        Bind.injectPrototypes(HTMLElement,_set,_update);
        Bind.injectPrototypes(HTMLInputElement,_set,_update);
        Bind.injectPrototypes(HTMLTextAreaElement,_set,_update);
        Bind.injectPrototypes(Document,_set,_update);

        return Bind;
	}
    if (typeof define === "function" && define.amd)
    {
      define('KB',CreateKB); //global KM define in browser
      define([],function(){return CreateKB;}); //define if file refrenced
    }
    else if (typeof module === "object" && module.exports)
    {
      module.exports = CreateKB;
    }
	return CreateKB;
})
