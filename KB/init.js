define(['./instance'],function(instance){

  /* BUILD */
  /* END BUILD */

  function init(){

    return init;
  }

  init.instance = instance();

  init.viewmodels = init.instance.viewmodels;

  init.dom = init.instance.dom;

  init.templates = init.instance.templates;

  init.maps = init.instance.maps;

  init.create = init.instance.create;

  init.addDataListener = init.viewmodels.addDataListener.bind(init.viewmodels);
  init.addDataUpdateListener = init.viewmodels.addDataUpdateListener.bind(init.viewmodels);
  init.addDataCreateListener = init.viewmodels.addDataCreateListener.bind(init.viewmodels);
  init.addDataRemoveListener = init.viewmodels.addDataRemoveListener.bind(init.viewmodels);

  /*
  init.binder = bind_dom.call(bind_dom);
  init.addAttrListener = init.binder.addAttrListener.bind(init.binder);
  init.addAttrUpdateListener = init.binder.addAttrUpdateListener.bind(init.binder);

  init.viewmodels = bind_viewmodel.call(bind_viewmodel);
  init.setViewModel = bind_viewmodel.viewmodel.bind(init.viewmodels);
  init.createViewModel = bind_viewmodel.createViewModel.bind(init.viewmodels);
  init.addDataListener = bind_viewmodel.addDataListener.bind(init.viewmodels);
  init.addDataUpdateListener = bind_viewmodel.addDataUpdateListener.bind(init.viewmodels);
  init.addDataCreateListener = bind_viewmodel.addDataCreateListener.bind(init.viewmodels);
  */

  return init;
});
