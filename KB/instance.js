define(['./bind_viewmodel','./template','./map','./bind_dom'],function(bind_viewmodel,template,map,bind_dom){

  function instance()
  {

  }

  instance.viewmodels = bind_viewmodel();

  instance.dom = bind_dom();

  instance.templates = template();

  instance.maps = map();

  instance.add = function(name,viewmodel,template)
  {
    instance.viewmodels.viewmodel(name,viewmodel);

    instance.templates.register(name,template);

    return instance;
  }

  instance.create = function(name)
  {

  }

  return instance;
})
