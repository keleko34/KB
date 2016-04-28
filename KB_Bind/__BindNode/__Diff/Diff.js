define([],function(){
  function CreateDiff()
  {
    function Diff(o,n)
    {
      //o = o.replace(/\s+$/,'');
      //n = n.replace(/\s+$/,'');

      function concatString(arr,pos,count)
      {
        var str = "";
        for(var x=0;x<count;x+=1)
        {
          str += arr[pos+x];
        }
        return str;
      }

      function concatArr(arr,pos,count)
      {
        for(var x=1;x<count;x+=1)
        {
          arr[pos] = arr[pos]+arr.splice((pos+x),1);
        }
        return arr;
      }
      //need to fix reduce
      o = (typeof o === 'string' ? (o == "" ? [] : o.split(/\s+/)) : o).reduce(function(w,v,i,a){
        var arr = [];
        if(w.constructor.toString() === Array.toString())
        {
          arr = w;
        }
        if(typeof v === 'string' && typeof a[i] )


        if(typeof a[i] === 'string' && typeof a[i+1] === 'string')
        {
          a = concatArr(a,i,1);
        }
        return a;
      });
      n = (typeof n === 'string' ? (n == "" ? [] : n.split(/\s+/)) : n).reduce(function(w,v,i,a){
        var count = 0;
        loop:for(var x=0;x<o.length;x+=1)
        {
          if(typeof o[x] === 'string' && o[x].indexOf(concatString(a,i,count)) > -1)
          {
            count +=1;
          }
          else
          {
            break loop;
          }
        }
        a = concatArr(a,i,count);
        return a;
      });
      console.log(o,n);
      //var diffString = Diff.diffString(o,n);

    }

    //iterate word array ex ['word','word2','word3'] to object: {word:{rows:[{pos:0,bind:undefined}]},word2:{rows:[{pos:1,bind:undefined}]},word3:{rows:[{pos:2,bind:undefined}]}}
    // if word in array has binding it will be format as {value:func,bind:func}, bind is passed along to the bind for the position
    Diff.convertWordArrToObj = function(arr)
    {
      var currValue = '',
          currBind;
      return arr.reduce(function(o,v,i){
        currValue = (typeof v.value === 'function' ? v.value() : v);
        currBind = (typeof v.bind === 'function' ? v.bind() : undefined);
        if(o[currValue] === undefined)
        {
          o[currValue] = {rows:[i],binds:[currBind]};
        }
        else
        {
          o[currValue].rows.push(i);
          o[currValue].binds.push(currBind);
        }
       return o;
      },{});
    }

    //checks if bindings just updated
    Diff.diffString = function(oldS,newS)
    {

    }

    //does hueristic word check for individual binds
    Diff.diffWords = function(oldS,newS)
    {
      var ns = Diff.convertWordArrToObj(newS),
          os = Diff.convertWordArrToObj(oldS),
          t = [];

      Object.keys(ns).forEach(function(k){
        if(os[k] !== undefined)
        {
          ns[k].rows.forEach(function(d,x){
            if(os[k].rows.indexOf(d) > -1)
            {
              t.push({change:'none',pos:d,from:'self',text:k,bind:os[k].binds[os[k].rows.indexOf(d)]});
            }
            else if(os[k].rows.indexOf(d+1) > -1)
            {
              t.push({change:'move',pos:d,posMove:d+1,from:'old',text:k,bind:os[k].binds[os[k].rows.indexOf(d+1)]});
            }
            else if(os[k].rows.indexOf(d-1) > -1)
            {
              t.push({change:'move',pos:d,posMove:d-1,from:'old',text:k,bind:os[k].binds[os[k].rows.indexOf(d-1)]});
            }
            else
            {
              t.push({change:'add',pos:d,from:'self',text:k,bind:os[k].binds[os[k].rows.indexOf(d)]});
            }
          });
        }
        else
        {
          ns[k].rows.forEach(function(d,x){
            t.push({change:'add',pos:d,from:'self',text:k,bind:undefined});
          });
        }
      });

      Object.keys(os).forEach(function(k){
        if(ns[k] !== undefined)
        {
          os[k].rows.forEach(function(d,x){
            if(ns[k].rows.indexOf(d) > -1)
            {
              t.push({change:'none',pos:d,from:'old',text:k,bind:os[k].binds[x]});
            }
            else if(ns[k].rows.indexOf(d+1) > -1)
            {
              t.push({change:'move',pos:d+1,posMove:d,from:'old',text:k,bind:os[k].binds[x]});
            }
            else if(ns[k].rows.indexOf(d-1) > -1)
            {
              t.push({change:'move',pos:d-1,posMove:d,from:'old',text:k,bind:os[k].binds[x]});
            }
            else
            {
              t.push({change:'delete',pos:d,from:'old',text:k,bind:os[k].binds[x]});
            }
          });
        }
        else
        {
          os[k].rows.forEach(function(d,x){
            t.push({change:'delete',pos:d,from:'old',text:k,bind:os[k].binds[x]});
          });
        }
      });

        return t.sort(function(a,b){
          return (a.pos > b.pos ? 1 : -1);
        })
        .filter(function(k,i){
          if(k.change === 'none' && k.from === 'old')
          {
            return false;
          }
          for(var x=0;x<t.length;x+=1)
          {
            if(x > i && k.from !== 'self' && k.change === t[x].change && k.pos === t[x].pos && k.text === t[x].text)
            {
              return false;
            }
          }
          return true;
        });

    }
    return Diff;
  }
  return CreateDiff;
})
