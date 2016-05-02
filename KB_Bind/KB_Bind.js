define(['./__Assets/KB','./__BindNode'],function(CreateKB,CreateBindNode){
  function CreateKB_Bind()
  {
    /* BUILD SECTION */
      /* END BUILD SECTION */

    var _textBinds = []
      , _attrBinds = []
      , _pipedAttribute = {}
      , _startBind = "{{"
      , _endBind = "}}"
      , _onChangeEvents = {}
      , _KBListener = CreateKB()
      , _textListeners = ['innerHTML','textContent','innerText','outerHTML','outerText','appendChild','removeChild']
      , _onUpdate = function(e)
        {
          KB_Bind.updateUnsynced();
          KB_Bind();
          if(_textListeners.indexOf(e.attr) > -1)
          {
            _textBinds.forEach(function(k,i){
              k.compareCheck();
            });
          }
          else
          {
            _attrBinds.forEach(function(k,i){
              k.compareCheck();
            });
          }
        }

    function KB_Bind()
    {
      var textNodes = KB_Bind.SearchAllTextNodes(_startBind)
        , attrNodes = KB_Bind.SearchAllAttributes(_endBind)

      textNodes.forEach(function(k,i){
        _textBinds.push(CreateBindNode()
        .startBind(_startBind)
        .endBind(_endBind)
        .pipedAttributes(_pipedAttribute));
        _textBinds[_textBinds.length-1](k);
      });

      attrNodes.forEach(function(k,i){
        _attrBinds.push(CreateBindNode()
        .startBind(_startBind)
        .endBind(_endBind)
        .isAttr(true));
        _attrBinds[_attrBinds.length-1](k);
      });

      _textListeners.forEach(function(k,i){
        _KBListener.removeAttrUpdateListener(k,_onUpdate);
        _KBListener.addAttrUpdateListener(k,_onUpdate);
      });

      KB_Bind.getAllAttributeTypes().forEach(function(k,i){
        _KBListener.removeAttrUpdateListener(k,_onUpdate);
        _KBListener.addAttrUpdateListener(k,_onUpdate);
        k.pipedAttributes(_pipedAttribute);
      });

      _textBinds.forEach(function(k,i){
         k.pipedAttributes(_pipedAttribute);
      });

      _attrBinds.forEach(function(k,i){
         k.pipedAttributes(_pipedAttribute);
      });
    }

    KB_Bind.textBinds = function()
    {
      return _textBinds;
    }

    KB_Bind.attributeBinds = function()
    {
      return _attrBinds;
    }

    KB_Bind.pipedAttributes = function()
    {
      return _pipedAttribute;
    }

    KB_Bind.addPipedAttribute = function(n,f)
    {
      if(typeof n === 'string' && typeof f === 'function')
      {
        _pipedAttribute[n] = f;
      }
    }

    KB_Bind.removePipedAttribute = function(n)
    {
      if(_pipedAttribute[n] !== undefined)
      {
        _pipedAttribute[n] = undefined;
      }
    }

    KB_Bind.SearchAllTextNodes = function(searchText)
    {
      var lookingInBody = false;
      return Array.prototype.concat.apply([],(Array.prototype.slice.call(document.all).map(function(k,i){
        if(k.nodeName === 'BODY') lookingInBody = true;
        return (lookingInBody ? Array.prototype.concat.apply([],Array.prototype.slice.call(k.childNodes).filter(function(d,x){
          return (d.nodeName === '#text' && d.textContent.indexOf(searchText) > -1);
        })) : null);
      })).filter(function(k,i){
        return (k !== null);
      }));
    }

    KB_Bind.SearchAllAttributes = function(searchText)
    {
      var lookingInBody = false;
      return Array.prototype.concat.apply([],(Array.prototype.slice.call(document.all).map(function(k,i){
        if(k.nodeName === 'BODY') lookingInBody = true;
        return (lookingInBody ? Array.prototype.concat.apply([],Array.prototype.slice.call(k.attributes).filter(function(d,x){
          return (d.value.indexOf(searchText) > -1);
        }).map(function(d,x){
          d.parentElement = k;
          return d;
        })) : null);
      })).filter(function(k,i){
        return (k !== null);
      }));
    }

    KB_Bind.getBindsById = function(id)
    {
      return Array.prototype.concat.apply([],_textBinds.map(function(k,i){
        return k.getBindById(id);
      }).filter(function(k,i){
        return (k.length > 0);
      }).concat(_attrBinds.map(function(k,i){
        return k.getBindById(id);
      }).filter(function(k,i){
        return (k.length > 0);
      })));
    }

    KB_Bind.updateBindsById = function(id,value)
    {
      KB_Bind.getBindsById(id).forEach(function(k,i){
        k.value(value).call();
      });
    }

    KB_Bind.updateUnsynced = function()
    {
      _textBinds = _textBinds.map(function(k,i){
        return (k.node().parentElement === null ? null : k);
      }).filter(function(k,i){
        return (k !== null);
      });

      _attrBinds = _attrBinds.map(function(k,i){
        return (k.node().parentElement === null ? null : k);
      }).filter(function(k,i){
        return (k !== null);
      });

      return KB_Bind;
    }

    KB_Bind.getAllAttributeTypes = function()
    {
      return Array.prototype.concat.apply([],_attrBinds.map(function(k,i){
        return Array.prototype.slice.call(k.node().attributes);
      })).filter(function(k,i,self){
        return (self.indexOf(k) === i)
      });
    }

    return KB_Bind;
  }
  if (typeof define === "function" && define.amd)
  {
    define('KB_Bind',CreateKB_Bind); //global KM define in browser
    define([],CreateKB_Bind); //define if file refrenced
  }
  else if (typeof module === "object" && module.exports)
  {
    module.exports = CreateKB_Bind;
  }
  return CreateKB_Bind;
});
