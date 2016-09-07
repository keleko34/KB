var gulp = require('gulp')
  , connect = require('./.gulp/server')
  , build = require('./.gulp/build');
  /*
  , connect = require('gulp-connect')
  , prompt = require('gulp-prompt')
  , inject = require('gulp-inject')
  , sort = require('sort-stream')
  , replace = require('gulp-replace')
  , file = require('gulp-file')
  , query = require('querystring')
  , closureCompiler = require('gulp-closure-compiler')
  , fs = require('fs');
  */




gulp.task('build', build());

gulp.task('connect', connect());

gulp.task('default', ['build','connect']);
