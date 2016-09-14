define(['./bind_viewmodel','./template','./map','./bind_dom'],function(bind_viewmodel,template,map,bind_dom){

  function instance()
  {

    return instance;
  }

  instance.viewmodels = bind_viewmodel();

  instance.dom = bind_dom();

  instance.templates = template();

  instance.maps = map();

  function getUnkowns(element)
  {

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

    for(var x=0,len=maps.length;x<len;x++)
    {
      maps[x].filters = viewmodel.filters;
      var keys = Object.keys(maps[x].binds);
      setLayer(keys,maps[x],viewmodel);
    }

    return frag;
  }

  function setLayer(keys,map,viewmodel)
  {
    for(var i=0,lenn=keys.length;i<lenn;i++)
    {
      if(map.prop === 'for')
      {
        map.element.removeAttribute('data-bind');
        var val = instance.viewmodels.getScope(viewmodel,map.texts.bind),
            parent = map.element.parentElement,
            html = map.element.outerHTML;
            parent.removeChild(map.element);
        if(instance.viewmodels.isArray(val))
        {
          for(var x=0,len=val.length;x<len;x++)
          {
            var reg = new RegExp('('+map.texts.key+')','g'),
                curr = html.replace(reg,instance.viewmodels.getScopeString(map.texts.bind,x));
            parent.appendChild(setInstance(curr,viewmodel,map.texts.bind,'for'));
          }
        }
        else if(instance.viewmodels.isObject(val))
        {
          var keys = Object.keys(val);
          for(var x=0,len=keys.length;x<len;x++)
          {
            var reg = new RegExp('('+map.texts.key+')','g'),
                curr = html.replace(reg,instance.viewmodels.getScopeString(map.texts.bind,keys[x]));
            parent.appendChild(setInstance(curr,viewmodel,map.texts.bind,'for'));
          }
        }
        else
        {
          console.error("You attempted to loop a standard value of: ",val," in Your binding: ",map.text);
        }
      }
      else
      {
        var val = instance.viewmodels.getScope(viewmodel,keys[i]);
        if(instance.viewmodels.isObject(val) || instance.viewmodels.isArray(val))
        {
          val = val.stringify();
        }
        map.binds[keys[i]].set(val);
        (function(key){
          viewmodel.addDataUpdateListener(key,function(e){
            map.binds[key].set(e.value);
          });
          map.element.addAttrUpdateListener(map.listener,function(e){
            if(instance.viewmodels.getScope(viewmodel,key).toString() !== e.value)
            {
              instance.viewmodels.setScope(viewmodel,key,e.value);
            }
          });
        }(keys[i]))
      }
    }
  }

  instance.add = function(name,viewmodel,template)
  {
    instance.viewmodels.viewmodel(name,viewmodel);

    return  instance.templates.register(name,template);
  }

  instance.create = function(name,innerText,attrs)
  {
    var preAttach = {filters:{}},
        postAttach = {},
        template = instance.templates.getTemplate(name),
        frag = document.createDocumentFragment();

    if(innerText !== undefined) postAttach.html = innerText;
    if(attrs !== undefined)
    {
      var keys = Object.keys(attrs);

      for(var x=0,len=keys.length;x<len;x++)
      {
        postAttach[keys[x]] = attrs[keys[x]];
      }
    }

    frag.appendChild(createTemplateNodes(template,name,'component'));

    return setInstance(template,instance.viewmodels.createViewModel(name,[name,frag.firstChild],preAttach,postAttach),name,'component',frag);
  }

  return instance;
})
