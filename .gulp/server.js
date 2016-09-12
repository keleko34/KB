var query = require('querystring')
  , connect = require('gulp-connect');

module.exports = function()
{
  function route(req,res,next)
  {
    if(req.url.substring(0,(req.url.indexOf('?') !== -1 ? req.url.indexOf('?') : req.url.length)) === '/'){
      req.url = '/test/index.html'
    }
    if(req.url.indexOf('/KB') === 0){
      var q = query.parse(req.url.substring((req.url.indexOf('?')+1),req.url.length));
      if(q.env){
        if(q.env.toLowerCase() === 'build'){
          req.url = '/KB/Build/KB.js';
        }
        else if(q.env.toLowerCase() === 'min'){
          req.url = '/KB/Min/KB.min.js';
        }
      }
    }
    if(req.url.indexOf('/component') === 0)
    {

    }
    return next();
  }

  return function()
  {
    connect.server({
      root: '.',
      livereload: false,
      port:8080,
      middleware:function(connect, opt){
          return [route]
        }
    });
  }
}
