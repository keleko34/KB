define(['./bind_dom'],function(bind_dom){

  /* BUILD */
  /* END BUILD */

  function init(){

    return init;
  }

  init.binder = bind_dom.call(bind_dom);
  init.addAttrListener = init.binder.addAttrListener.bind(init.binder);
  init.addAttrUpdateListener = init.binder.addAttrUpdateListener.bind(init.binder);

  return init;
});
