/* ways to speed up code */
/*
   1. style listeners are added on demand
*/


var CreateKB = (function(){
	function CreateKB(){

        //holds all preset listeners per attribute eg: {innerHTML:[func,func,func]}
        var _attrListeners = {}
        //holds all postset listeners per attribute eg: {innerHTML:[func,func,func]}
          , _attrUpdateListeners = {}
        //holds all injected objects and thier descriptors, functions and set and update functions eg: {HTMLElement:{obj:HTMLElement,proto:HTMLElement.prototype,descriptors:{},functions:{},set:function(){},update:function(){}}}
          , _injected = {}
          
          , _allStyles = Object.getOwnPropertyNames(document.body.style)
        //used in all for loops
          , x
        // used in all inner loops
          , i
          , all = '*'

          , _bindAllStyle = function(attr,els)
            {
              if(els === undefined)
              {
                els = Array.prototype.slice.call(document.body.querySelectorAll('*'));
                els.unshift(document.body);
              }
              var x,
                  elLength = els.length;
              if(attr === '*'){
                var _allStylesLen = _allStyles.length,
                    i;
                for(x=0;x<elLength;x++){
                  for(i=0;i<_allStylesLen;i++){
                    Bind.injectStyle(els[x],_allStyles[i],_set,_update);
                  }
                }
              }
              else{
                for(x=0;x<elLength;x++){
                  Bind.injectStyle(els[x],attr,_set,_update);
                }
              }
            }

          , _loopParents = function(el,attr,update,e){
            var x,
                type = (update ? "kb_childAttrUpdateListeners" : "kb_childAttrListeners"),
                attrListeners,
                attrListenersLen;

            e.child = el;
            /* Fancily this is more speedy than a while loop... */
            loop:for(x=0;(el !== null && el !== undefined);x=x){
              el = el.parentElement;
              if(el !== null && el !== undefined){
                 attrListeners = el[type]()[attr];
                if(attrListeners !== undefined){
                  attrListenersLen = attrListeners.length;
                  for(i=0;i<attrListenersLen;i++)
                  {
                    e.target = el;
                    attrListeners[i].call(el,e);
                    if(e._stopPropogation !== undefined) break loop;
                  }
                }
              }
            }
          }
        //the base event object that is passed to every listeners upon change
          , _changeEvent = function(el,attr,value,oldValue,args,action,type){
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
        //the set function that runs on all changes
          , _set = function(el,prop,val,ret,args){
              var e = new _changeEvent(el,prop,val,ret,args,'set'),
                  allListeners = _attrListeners[all],
                  allListenersLength,
                  attrListeners = _attrListeners[prop],
                  attrListenerLength,
                  elListener = (el.kb_attrListeners !== undefined ? el.kb_attrListeners()[prop] : undefined),
                  elListenerLength;

              if(allListeners !== undefined)
              {
                allListenersLength = allListeners.length;
                loop:for(x=0;x<allListenersLength;x+=1)
                {
                  allListeners[x].call(el,e);
                  if(e._stopPropogation !== undefined) break loop;
                }
              }

              if(attrListeners !== undefined && e._stopPropogation === undefined)
              {
                attrListenerLength = attrListeners.length;
                loop:for(x=0;x<attrListenerLength;x+=1)
                {
                  attrListeners[x].call(el,e);
                  if(e._stopPropogation !== undefined) break loop;
                }
              }

              if(elListener !== undefined && e._stopPropogation === undefined)
              {
                elListenerLength = elListener.length;
                loop:for(x=0;x<elListenerLength;x+=1)
                {
                  elListener[x].call(el,e);
                  if(e._stopPropogation !== undefined) break loop;
                }
              }

              _loopParents(el,prop,false,e);

              if(e._preventDefault !== undefined) return false;

              return true;
            }
        //the update function that runs on all changes
          , _update = function(el,prop,val,ret,args,action){
            var e = new _changeEvent(el,prop,val,ret,args,action,'update'),
                allListeners = _attrUpdateListeners[all],
                allListenersLength,
                attrListeners = _attrUpdateListeners[prop],
                attrListenerLength,
                elListener = (el.kb_attrUpdateListeners !== undefined ? el.kb_attrUpdateListeners()[prop] : undefined),
                elListenerLength;

            if(allListeners !== undefined)
            {
              allListenersLength = allListeners.length;
              loop:for(var x=0;x<allListenersLength;x+=1)
              {
                allListeners[x].call(el,e);
                if(e._stopPropogation !== undefined) break loop;
              }
            }

            if(attrListeners !== undefined && e._stopPropogation === undefined)
            {
              attrListenerLength = attrListeners.length;
              loop:for(var x=0;x<attrListenerLength;x+=1)
              {
                attrListeners[x].call(el,e);
                if(e._stopPropogation !== undefined) break loop;
              }
            }

            if(elListener !== undefined && e._stopPropogation === undefined)
            {
              elListenerLength = elListener.length;
              loop:for(var x=0;x<elListenerLength;x+=1)
              {
                elListener[x].call(el,e);
                if(e._stopPropogation !== undefined) break loop;
              }
            }
            
            _loopParents(el,prop,true,e);

            if(e._preventDefault !== undefined) return false;

            return true;
          }

          , _checkBindStyles = function(children)
            {
                var styles = Object.keys(_attrListeners).filter(function(v){
                    return (_allStyles.indexOf(v) !== -1);
                }).concat(Object.keys(_attrUpdateListeners).filter(function(v){
                    return (_allStyles.indexOf(v) !== -1);
                })),
                x,
                len = children.length,
                i,
                styleLen = styles.length;
                for(i=0;i<styleLen;i++){
                  for(x=0;x<len;x++){
                    Bind.injectStyle(children[x],styles[i],_set,_update);
                  }
                }
            }
          , _checkParentStyles = function(children)
            {
              function getParents(child){
                var x,
                    el = child,
                    styles = [];
                loop:for(x=0;(el !== null && el !== undefined);x=x){
                  el = el.parentElement;
                  if(el !== null && el !== undefined){
                    styles.concat(Object.keys(el.kb_childAttrListeners()).filter(function(v){
                      return (_allStyles.indexOf(v) !== -1);
                    })).concat(Object.keys(el.kb_childAttrUpdateListeners()).filter(function(v){
                      return (_allStyles.indexOf(v) !== -1);
                    }));
                  }
                }
                return styles;
              }

              var styles = getParents(children[0]),
                  x,
                  len = children.length,
                  i,
                  styleLen = styles.length;
              for(i=0;i<styleLen;i++){
                for(x=0;x<len;x++){
                  Bind.injectStyle(children[x],styles[i],_set,_update);
                }
              }
            }
        /*** MAIN CONSTRUCTOR ***/
        function Bind()
        {

          //resyncs inputs and styles in case new ones were added to the DOM or old ones were removed
          function reSync(e)
          {
            var arg = e.arguments[0];
            if(e.attr === 'appendChild' && (arg.tagName === 'SCRIPT' || arg.tagName === 'LINK' || arg.nodeName === '#text' || arg.nodeName === '#comment')){
              e.stopPropagation();
              return;
            }
            if(e.attr === 'outerHTML' || e.attr === 'outerText')
            {
              e.target = e.target.parentElement;
            }
            var x=0,
                target = e.target,
                inputs = (e.attr !== 'appendChild' ? target.getElementsByTagName('INPUT') : e.arguments[0].getElementsByTagName('INPUT')),
                textareas = (e.attr !== 'appendChild' ? target.getElementsByTagName('TEXTAREA') : e.arguments[0].getElementsByTagName('TEXTAREA')),
                inp = getAllInputs(inputs,textareas,e),
                inc = getAllInputBoxes(inputs,e),
                all = getAllChildren(target,e);

            for(x=0;x<inp.length;x++)
            {
              inp[x].kb_addInputBinding();
            }

            for(x=0;x<inc.length;x++)
            {
              inc[x].kb_addInputBoxBinding();
            }
            
            /* need to check for child updates from existing style listeners */
            if(_attrListeners['*'].length > 0 || _attrUpdateListeners['*'].length > 0){
              _bindAllStyle('*',all);
            }
            else{
              _checkBindStyles(all);
              _checkParentStyles(all);
            }
          }
          
          function getAllInputs(inputs,textareas,e){
            var inputsLen = inputs.length,
                textLen = textareas.length,
                arr = [],
                x,
                i = 0;
            for(x=0;x<inputsLen;x++){
              var type = inputs[x].type;
              if(type !== 'radio' && type !== 'checkbox' && inputs[x].kb_onkeydown === undefined && inputs[x].kb_onmousedown === undefined){
                arr[i] = inputs[x];
                i++;
              }
            }
            for(x=0;x<textLen;x++){
              arr[i] = textareas[x];
              i++;
            }
            if(e.attr === 'appendChild')
            {
              var node = e.arguments[0],
                  tag = node.tagName;
              if((tag === 'INPUT' && node.type !== 'checkbox' && node.type !== 'radio') || tag === 'TEXTAREA')
              {
                arr[arr.length] = node;
              }
            }
            return arr;
          }
          
          function getAllInputBoxes(inputs,e){
            var inputsLen = inputs.length,
                arr = [],
                x,
                i = 0;
            for(x=0;x<inputsLen;x++){
              var type = inputs[x].type;
              if(type === 'radio' || type === 'checkbox' && inputs[x].kb_onkeydown === undefined && inputs[x].kb_onmousedown === undefined){
                arr[i] = inputs[x];
                i++;
              }
            }
            if(e.attr === 'appendChild')
            {
              var node = e.arguments[0],
                  tag = node.tagName;
              if(tag === 'INPUT' && node.type === 'checkbox' && node.type === 'radio')
              {
                arr[arr.length] = node;
              }
            }
            return arr;
          }
          
          function getAllChildren(el,e){
            var arr = [],
                list = (e.attr !== 'appendChild' ? el.querySelectorAll('*') : e.arguments[0].querySelectorAll('*')),
                len = list.length,
                x,
                i = 0;
            for(x=0;x<len;x++)
            {
              if(list[x].nodeType !== 3 && list[x].nodeType !== 8){
                arr[i] = list[x];
                i++;
              }  
            }
            if(e.attr === 'appendChild')
            {
              var nodeType = e.arguments[0].nodeType;
              if(nodeType !== 3 && nodeType !== 8)
              {
                arr[arr.length] = e.arguments[0];
              }
            }
            return arr;
          }
          
          function syncInputs()
          {
            var x=0,
                inputs = document.getElementsByTagName('INPUT'),
                textareas = document.getElementsByTagName('TEXTAREA'),
                e = {attr:'initial'},
                inp = getAllInputs(inputs,textareas,e),
                inc = getAllInputBoxes(inputs,e);

            for(x=0;x<inp.length;x++)
            {
              inp[x].kb_addInputBinding();
            }

            for(x=0;x<inc.length;x++)
            {
              inc[x].kb_addInputBoxBinding();
            }
          }

          //checks attributes inside of setAttribute and removeAttribute
          
          /* The reason for the setTimeouts is that this ability drastically hurts requirejs performance when it is building its script tags, though this process comes with a caveat and that is the prefentDefault can not work as expected as the value will be set prior to this set being ran and if the chain is blocked and this value is set again prior to this running the oldvalue may be lost, a safer way would be just to watch the 'setAttribute' property rather than an attr itself such as 'class' */
          function checkAttributes(e)
          {
            var oldAttr = e.target.attributes[e.arguments[0]],
                old = (oldAttr !== undefined ? oldAttr.value : ""),
                val = (e.attr === 'setAttribute' ? e.arguments[1] : "");
              if(!_set(e.target,e.arguments[0],val,old,[val])){
                e.preventDefault();
              }
          }

          function checkUpdateAttributes(e)
          {
            var oldAttr = e.target.attributes[e.arguments[0]],
                old = (oldAttr !== undefined ? oldAttr.value : ""),
                val = (e.attr === 'setAttribute' ? e.arguments[1] : "");
              _update(e.target,e.arguments[0],val,old,[val]);
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

          //initially adds inputs for watching
          syncInputs();
        }

        Bind.injectPrototypeProperty = function(obj,key,set,update,_injectName)
        {
          var _proto = obj.prototype,
              _descriptor = Object.getOwnPropertyDescriptor(_proto,key),
              _injectName = (_injectName || obj.toString().split(/\s+/)[1].split('{')[0].replace('()','')),
              _injectedObj = _injected[_injectName],
              _set,
              _update;

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

          if(_injectedObj === undefined)
          {
            _injected[_injectName] = {obj:obj,proto:_proto,descriptors:{},set:undefined,update:undefined};
            _injectedObj = _injected[_injectName];
          }
          _injectedObj.set = (set ? set : _injected[_injectName].set);
          _injectedObj.update = (update ? update : _injected[_injectName].update);

          _injectedObj.descriptors[key] = _descriptor;

          if(_descriptor.set !== undefined && _descriptor.configurable)
          {
              Object.defineProperty(_proto,key,{
                  get:_descriptor.get,
                  set:function(v)
                  {
                      var oldValue = _descriptor.get.apply(this),
                          set = _injectedObj.set,
                          update = _injectedObj.update;
                      if(typeof set === 'function' && set(this,key,v,oldValue,arguments))
                      {
                        _descriptor.set.apply(this,arguments);
                      }
                      if(typeof update === 'function')
                      {
                        update(this,key,v,oldValue,arguments);
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
                    var action = null,
                        set = _injectedObj.set,
                        update = _injectedObj.update;
                    if(typeof set === 'function' && set(this,key,null,null,arguments))
                    {
                      action =  _descriptor.value.apply(this,arguments);
                    }
                    if(typeof update === 'function')
                    {
                      update(this,key,null,null,arguments,action);
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
                  var oldValue = _descriptor.value,
                      set = _injectedObj.set,
                      update = _injectedObj.update;
                  if(typeof set === 'function' && set(this,key,v,oldValue))
                  {
                    _descriptor.value = v;
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
        }

        /*** Inject Method ***
         -- injects an objects prototypes to allow for property event listeners
         */
        Bind.injectPrototypes = function(obj,set,update)
        {
          var _proto = obj.prototype,
              _injectName = obj.toString().split(/\s+/)[1].split('{')[0].replace('()',''),
              _injectedObj = _injected[_injectName],
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
                  var set = _injectedObj.set,
                      update = _injectedObj.update;
                  
                  if(isCheck && !set(this,"checked",this.checked,oldCheck))
                  {
                    _descriptors["checked"].set.call(this,oldCheck);
                  }
                  else if(isCheck)
                  {
                    if(typeof update === 'function')
                    {
                      update(this,"checked",this.checked,oldValue);
                    }
                  }
                  this.value = (isCheck ? (typeof this.checked === 'string' ? (this.checked === 'true' ? "on" : "off") : (this.checked ? "on" : "off")) : this.value);

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

          if(_injectedObj === undefined)
          {
            _injected[_injectName] = {obj:obj,proto:_proto,descriptors:{},set:undefined,update:undefined};
            _injectedObj = _injected[_injectName];
          }
          _injectedObj.set = (set || _set);
          _injectedObj.update = (update || _update);


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
          
          if(el.style.kb_bind === undefined){
            el.style.kb_bind = {obj:el,proto:_proto,descriptors:{},set:undefined,update:undefined};
            el.style.kb_bind.set = (set ? set : _injected[_injectName].set);
            el.style.kb_bind.update = (update ? update : _injected[_injectName].update);
          }
          if(el.style.kb_bind.descriptors[key] === undefined)
          {
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
            /* we have a personal element binding */
            if(typeof func === 'function')
            {
              if(child)
              {

                if(child && this.kb_childAttrListeners()[attr] === undefined) this.kb_childAttrListeners()[attr] = [];
                this.kb_childAttrListeners()[attr].push(func);
              }
              else
              {
                if(this.kb_attrListeners()[attr] === undefined) this.kb_attrListeners()[attr] = [];
                this.kb_attrListeners()[attr].push(func);
              }
              if(_allStyles.indexOf(attr) !== -1) _bindAllStyle(attr,(child ? this.querySelector('*') : [this]));
            }
            return this;
          }
          else
          {
            /* this is a global binding */
            if(typeof func === 'function')
            {
              if(_attrListeners[attr] === undefined) _attrListeners[attr] = [];
              _attrListeners[attr].push(func);
              if(attr === '*' || _allStyles.indexOf(attr) !== -1) _bindAllStyle(attr);
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
            if(typeof func === 'function')
            {
              if(child)
              {
                if(child && this.kb_childAttrUpdateListeners()[attr] === undefined) this.kb_childAttrUpdateListeners()[attr] = [];
                this.kb_childAttrUpdateListeners()[attr].push(func);
              }
              else
              {
                if(this.kb_attrUpdateListeners()[attr] === undefined) this.kb_attrUpdateListeners()[attr] = [];
                this.kb_attrUpdateListeners()[attr].push(func);
              }
            }
            return this;
          }
          else
          {
            if(typeof func === 'function')
            {
              if(_attrUpdateListeners[attr] === undefined) _attrUpdateListeners[attr] = [];
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
}())
