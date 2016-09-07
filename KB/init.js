define(['./bind_dom','./bind_viewmodel'],function(bind_dom,bind_viewmodel){

  /* BUILD */
  /* END BUILD */

  function init(){

    return init;
  }

  init.binder = bind_dom.call(bind_dom);
  init.addAttrListener = init.binder.addAttrListener.bind(init.binder);
  init.addAttrUpdateListener = init.binder.addAttrUpdateListener.bind(init.binder);

  init.viewmodel = bind_viewmodel.call(bind_viewmodel);
  init.setViewModel = bind_viewmodel.setViewModel.bind(init.viewmodel);

  return init;
});
