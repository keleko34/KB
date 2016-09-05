var gulp = require('gulp')
  , connect = require('gulp-connect')
  , prompt = require('gulp-prompt')
  , inject = require('gulp-inject')
  , sort = require('sort-stream')
  , replace = require('gulp-replace')
  , file = require('gulp-file')
  , query = require('querystring')
  , closureCompiler = require('gulp-closure-compiler')
  , fs = require('fs');

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
  return next();
}


gulp.task('build', function(){

});

gulp.task('connect', function(){
  connect.server({
    root: '.',
    livereload: false,
    port:8080,
    middleware:function(connect, opt){
        return [route]
      }
  });
});

gulp.task('default', ['build','connect']);
