var gulp = require('gulp')
  , prompt = require('gulp-prompt')
  , inject = require('gulp-inject')
  , sort = require('sort-stream')
  , replace = require('gulp-replace')
  , file = require('gulp-file')
  , closureCompiler = require('gulp-closure-compiler')
  , fs = require('fs')

gulp.task('build', function(){

        var ignorePath = ['./KB.js','./Build/KB.js','./Min/KB.min.js']
          , subFiles = gulp.src(['./KB/**/*.js']).pipe(sort(function(a,b){
            return 1;
          }))
          , reD = /(define)(.*)(function\()(.*)(\))(.*)(?:{)/
          , reE = /}\)(?![\s\S]*}\))/m;
        gulp.src('./KB/KB.js')
        .pipe(inject(subFiles,{
          relative:true,
          starttag: '/* BUILD SECTION */',
          endtag: '/* END BUILD SECTION */',
          transform: function(filepath,file,i,length){
            if(ignorePath.indexOf('./'+filepath) < 0)
            {
              console.log('\033[36mInjecting File:\033[37m',filepath);
              var contents = file.contents.toString('utf8'),
                  re = /(function Create)(.*)(\()/,
                  module = 'Create'+re.exec(contents)[2];

              contents = contents.replace(reE,"}());");
              contents = contents.replace(reD,"var "+module+" = (function(){");
              return contents;
            }
            else
            {
              return "";
            }
          },
          ignorePath:ignorePath
        }))
        .pipe(replace(reE,"}())"))
        .pipe(replace(reD,("var CreateKB = (function(){")))
        .pipe(gulp.dest('./KB/Build'));

        console.log('\033[36mRunning clojure compiler minification:\033[37m');

         gulp.src('./KB/Build/KB.js')
        .pipe(closureCompiler({
          compilerPath:"./compiler.jar",
          fileName:"KB.min.js"
        }))
        .pipe(gulp.dest('./KB/Min'));
  return
});
