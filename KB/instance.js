define(['./bind_viewmodel','./template','./map','./bind_dom'],function(bind_viewmodel,template,map,bind_dom){

  var _reNodes = /(<\/.*?>)/g;

  function instance()
  {

    return instance;
  }

  instance.viewmodels = bind_viewmodel();

  instance.dom = bind_dom();

  instance.templates = template();

  instance.maps = map();

  function convertAttributes(element)
  {
    var attributes = element.attributes,
        attrs = {};
    for(var x=0,len=attributes.length;x<len;x++)
    {
      attrs[attributes[x].name] = attributes[x].value;
    }
    return attrs;
  }

  function replaceUnkowns(element)
  {
    var children = element.children;
    for(var x=0,len=children.length;x<len;x++)
    {
      if(children[x] instanceof HTMLUnknownElement)
      {
        element.replaceChild(instance.create(children[x].tagName.toLowerCase(),children[x].innerHTML,convertAttributes(children[x])),children[x]);
      }
      else if(children[x].children.length !== 0)
      {
        replaceUnkowns(children[x]);
      }
    }
  }

  function createTemplateNodes(template,name,type)
  {
    var div = document.createElement('div');
    div.innerHTML = template;
    div.setAttribute("class",type+"__wrapper");
    div.setAttribute("data-"+type,name);
    return div;
  }

  function setInstance(template,viewmodel,name,type,frag)
  {
    if(frag === undefined)
    {
      var frag = document.createDocumentFragment();
          frag.appendChild(createTemplateNodes(template,name,type));
    }

    var node = frag.firstChild,
        maps = instance.maps.mapComponent(node),
        filters = Object.keys(viewmodel.filters);

    node.__kbViewModel = viewmodel;
    node.__kbMaps = maps;

    for(var x=0;x<maps.length;x++)
    {
      maps[x].filters = viewmodel.filters;
      var keys = Object.keys(maps[x].binds);
      if(setLayer(keys,maps[x],viewmodel,name) === false)
      {
        maps.splice(x,1);
      }
    }

    replaceUnkowns(node);

    return frag;
  }

  function replaceTextNode(name,node,html,type)
  {
    var frag = document.createDocumentFragment(),
        parent = node.parentElement,
        tNode = createTemplateNodes(html,name,(type || 'text'));
    frag.appendChild(tNode);
    parent.replaceChild(frag,node);
    replaceUnkowns(parent);
    return tNode;
  }

  function setLayer(keys,map,viewmodel,name)
  {
    for(var i=0,lenn=keys.length;i<lenn;i++)
    {
      if(map.prop === 'for')
      {
        var val = instance.viewmodels.getScope(viewmodel,map.binds.key),
            div = replaceTextNode(name,map.target,'','loop'),
            obj = {},
            node = {};
        if(instance.viewmodels.isArray(val))
        {
          for(var x=0,len=val.length;x<len;x++)
          {
            div.appendChild(instance.create(map.binds.component,'',{},{key:map.binds.key,listener:val,placement:x,parent:div,component:map.binds.component}));
          }
          return false;
        }
        else
        {
          console.error("You attempted to loop a non array: ",val," in Your binding: ",map.text);
        }
      }
      else
      {
        var val = instance.viewmodels.getScope(viewmodel,keys[i]);
        if(instance.viewmodels.isObject(val) || instance.viewmodels.isArray(val))
        {
          val = val.stringify();
        }
        if(keys[i] === 'innerHTML' && val.match(_reNodes))
        {
          replaceTextNode(name,map.target,val);
          return false;
        }
        else
        {
          map.binds[keys[i]].set(val);
        }
        (function(key,m){
          viewmodel.addDataUpdateListener(key,function(e){
            m.binds[key].set(e.value);
            if(m.prop === 'value') instance.dom.fireEvent(m.element,m.prop,'set');
          });
          if(m.element[m.listener] === undefined)
          {
            m.element[m.listener] = m.binds[key].value;
            instance.dom.injectPrototypeProperty(m.element,m.listener,'Custom');
          }
          m.element.addAttrListener(m.listener,function(e){
            if(instance.viewmodels.getScope(viewmodel,key).toString() !== e.value && m.texts.length === 1)
            {
              m.binds[key].set(e.value);
              instance.viewmodels.setScope(viewmodel,key,e.value);
            }
            else if(Object.keys(m.binds).length !== 1)
            {
              e.preventDefault();
            }
          });
        }(keys[i],map));
      }
    }
  }

  instance.add = function(name,viewmodel,template)
  {
    instance.viewmodels.viewmodel(name,viewmodel);

    return  instance.templates.register(name,template);
  }

  instance.create = function(name,innerHTML,attrs,loop)
  {
    var preAttach = instance.viewmodels.observableObject(),
        postAttach = instance.viewmodels.observableObject(),
        template = instance.templates.getTemplate(name),
        frag = document.createDocumentFragment();

    preAttach.add('filters',instance.viewmodels.observableObject());

    if(innerHTML !== undefined) postAttach.add('innerHTML',innerHTML);
    if(attrs !== undefined)
    {
      var keys = Object.keys(attrs);

      for(var x=0,len=keys.length;x<len;x++)
      {
        postAttach.add(keys[x],attrs[keys[x]]);
      }
    }

    frag.appendChild(createTemplateNodes(template,name,'component'));

    if(loop !== undefined)
    {
      if(loop.listener.__kblooped === undefined) Object.defineProperty(loop.listener,'__kblooped',{
        value:{},
        writable:false,
        enumerable:false,
        configurable:true
      });

      if(loop.listener.__kblooped[loop.placement] !== undefined)
      {
        postAttach.add(loop.key,loop.listener.__kblooped[loop.placement]);
      }
      else
      {
        postAttach.add(loop.key,instance.viewmodels.observableObject());
        postAttach[loop.key].add('key',loop.placement);
        postAttach[loop.key].add('value',loop.listener[loop.placement]);
        postAttach[loop.key].add('listener',loop.listener);

        loop.listener.__kblooped[loop.placement] = postAttach[loop.key];

        postAttach[loop.key].addDataUpdateListener('*',function(e){
          if(JSON.stringify(e.localScope.listener[e.localScope.key]) !== JSON.stringify(e.value))
          {
            e.localScope.listener[e.localScope.key] = e.value;
          }
        });
        if(!loop.listener.__kbattached)
        {
          loop.listener.__kbattached = true;
          loop.listener.addDataUpdateListener('*',function(e){
            if(JSON.stringify(loop.listener.__kblooped[e.key].value) !== JSON.stringify(e.value))
            {
              loop.listener.__kblooped[e.key].value = e.value;
            }
          })
          .addDataCreateListener(function(e){
            if(loop.parent.children[e.key] === undefined)
            {
              loop.parent.appendChild(instance.create(loop.component,'',{},{key:loop.key,listener:loop.listener,placement:e.key,parent:loop.parent,component:loop.component}));
            }
            else
            {
              loop.parent.insertBefore(instance.create(loop.component,'',{},{key:loop.key,listener:loop.listener,placement:e.key,parent:loop.parent,component:loop.component}),loop.parent.children[e.key]);
            }
          })
          .addDataDeleteListener(function(e){
            loop.parent.removeChild(loop.parent.children[e.localScope.length]);
          })
        }
      }
    }

    var viewmodel = instance.viewmodels.createViewModel(name,[name,frag.firstChild],preAttach,postAttach);

    /*
    if(loop !== undefined)
    {
      var keys = Object.keys(attrs);

      for(var x=0,len=keys.length;x<len;x++)
      {
        (function(key,viewmodel,listener,placement){
          viewmodel.addDataListener(key,function(e){
            if(e.key === 'index')
            {
              listener[placement] = e.value;
            }
            else
            {
              instance.viewmodels.setScope(listener[placement],key,e.value);
            }
          })
        }(keys[x],viewmodel,loop.listener,loop.placement));
      }
      if(!loop.listener.__kbattached)
      {
        loop.listener.__kbattached = true;

        loop.listener.addDataCreateListener(function(e){
          var obj;
          if(!instance.viewmodels.isObject(loop.listener[e.key]))
          {
            obj = {};
            obj.index = loop.listener[e.key];
          }
          else
          {
            obj = loop.listener[e.key];
          }

          loop.parent.appendChild(instance.create(loop.component,'',obj,{listener:loop.listener,placement:e.key,parent:loop.parent,component:loop.component}));
        })
        .addDataDeleteListener(function(e){
          loop.parent.removeChild(loop.parent.children[e.key]);
        })
        loop.listener.addDataUpdateListener('*',function(e){
          console.log(e,loop.listener);
          if(loop.listener[e.key] !== undefined)
          {
            if(instance.viewmodels.isObject(loop.listener[e.key]))
            {
              var keys = Object.keys(loop.listener[e.key]);
              for(var x =0,len=keys.length;x<len;x++)
              {
                loop.parent.children[e.key].__kbViewModel[keys[x]] = loop.listener[e.key][keys[x]];
              }
            }
            else
            {
              loop.parent.children[e.key].__kbViewModel.index = e.value;
            }
          }
        });
      }
    }
    */

    return setInstance(template,viewmodel,name,'component',frag);
  }

  return instance;
})
