var gulp = require('gulp')
  , connect = require('./.gulp/server')
  , build = require('./.gulp/build');

gulp.task('build', build());

gulp.task('connect', connect());

gulp.task('default', ['build','connect']);
