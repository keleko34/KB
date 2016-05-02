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
      var count = 0;
      //need to fix reduce
      o = (typeof o === 'string' ? (o == "" ? [] : o.split(/\s+/)) : o).reduce(function(w,v,i,a){
        if(typeof v === 'string' && w[count] === undefined)
        {
          w[count] = v;
        }
        else if(typeof v === 'string')
        {
          w[count] = w[count]+" "+v;
        }
        else if(typeof v === 'object' && w[count] === undefined)
        {
          w[count] = v;
          count += 1;
        }
        else
        {
          count += 1;
          w[count] = v;
          count += 1;
        }
        return w;
      },[]);

      count = 0;
      countN = 0;
      var found = false;
      var endOfFound = false;
      var currValue = '';
      var last = '';
      var bindCount = 0;
      n = (typeof n === 'string' ? (n == "" ? [] : n.split(/\s+/)) : n).reduce(function(w,v,i,a){
        found = false;
        endOfFound = false;
        if(w[count] === undefined)
        {
          w[count] = v;
        }
        else
        {
          w[count] = w[count]+" "+v;
        }
        for(var x=0;x<o.length;x+=1)
        {
          currValue = (typeof o[x] === 'string' ? o[x] : o[x].value());
          bindCount = (typeof o[x] === 'string' ? 0 : o[x].value().split(/\s+/).length)
          last = w[count].substring(0,w[count].lastIndexOf(" "));
          if(currValue.indexOf(w[count]) > -1)
          {
            found = true;
          }
          else if(!found && w[count] !== v && currValue.indexOf(last) > -1 && currValue.length === last.length)
          {
            endOfFound = true;
          }
          else if(currValue.split(/\s+/).indexOf(v) > -1 && currValue.split(/\s+/)[currValue.split(/\s+/).indexOf(v)].length === v.length)
          {
            endOfFound = true;
          }
          else if(bindCount === 0 && count === x && (currValue.split(/\s+/).length+1) === w[count].split(/\s+/).length)
          {
            endOfFound = true;
          }
          else if(bindCount > 0 && count === x && w[count].split(/\s+/).length === bindCount+1)
          {
            endOfFound = true;
          }
        }
        if(!found && endOfFound && w[count] !== v)
        {
          w[count] = w[count].substring(0,w[count].lastIndexOf(" "));
          count += 1;
          w[count] = v;
        }
        return w;
      },[]);

      console.log(o,n);
     return Diff.diffWords(o,n);

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
