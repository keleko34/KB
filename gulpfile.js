var gulp = require('gulp')
  , prompt = require('gulp-prompt')
  , inject = require('gulp-inject')
  , sort = require('sort-stream')
  , replace = require('gulp-replace')
  , file = require('gulp-file')
  , closureCompiler = require('gulp-closure-compiler')
  , fs = require('fs');

gulp.task('build', function(){
  return gulp.src('*')
  .pipe(prompt.prompt({
    type: 'input',
    name: 'component',
    message: 'Which component would you like to build?'
  },
  function(res){
    fs.stat('./'+res.component+'/'+res.component+'.js',function(err,stats){
      if(!err && stats.isFile())
      {
        console.log('\033[36mStarting to compile component:\033[37m',res.component);
        var ignorePath = ['./'+res.component+'.js','./Build/'+res.component+'.js','./Min/'+res.component+'.min.js']
          , subFiles = gulp.src(['./'+res.component+'/**/*.js']).pipe(sort(function(a,b){
            return 1;
          }))
          , reD = /(define)(.*)(function\()(.*)(\))(.*)(?:{)/
          , reE = /}\)(?![\s\S]*}\))/m;
        gulp.src('./'+res.component+'/'+res.component+'.js')
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
        .pipe(replace(reD,("var Create"+res.component+" = (function(){")))
        .pipe(gulp.dest('./'+res.component+'/Build'));

        console.log('\033[36mRunning clojure compiler minification:\033[37m');
        gulp.src('./'+res.component+'/Build/'+res.component+'.js')
        .pipe(closureCompiler({
          compilerPath:"./compiler.jar",
          fileName:res.component+".min.js"
        }))
        .pipe(gulp.dest('./'+res.component+'/Min'));
      }
      else
      {
        console.error('\033[31mThere is no component by the name:\033[37m ',res.component);
      }
    });
  }));
});

gulp.task('create',function(){
  return gulp.src('*')
  .pipe(prompt.prompt({
    type: 'input',
    name: 'component',
    message: 'What would You like to name this component?'
  },
  function(res){
    fs.stat('./'+res.component+'/'+res.component+'.js',function(err,stats){
      if(err)
      {
        var jsFile = "/* BUILD SECTION */\n/* END BUILD SECTION */\n\ndefine([],function(){\n\tfunction Create"+res.component+"(){\n\t\tfunction "+res.component+"(node){"
        +"\n\t\t\tnode = (typeof node === 'string' ? document.querySelector(node) : (typeof node === 'object' ? node : null));\n\t\t\tif(!node)\n\t\t\t{\n\t\t\t\tconsole.error('you have passed an invalid node into "+res.component+": ',node);\n\t\t\t\treturn;\n\t\t\t}"
        +"\n\t\t}\n\t\treturn "+res.component+";\n\t}\n\treturn Create"+res.component+";\n})";

        var cssFile = "."+res.component+"{\n\n}";

        file('./'+res.component+".js",jsFile,{src:true})
        .pipe(gulp.dest('./'+res.component));

        file('./'+res.component+".css",cssFile,{src:true})
        .pipe(gulp.dest('./'+res.component));

        file('./README.md',"",{src:true})
        .pipe(gulp.dest('./'+res.component));

        file('./Build/'+res.component+".js","",{src:true})
        .pipe(gulp.dest('./'+res.component));

        file('./Min/'+res.component+".min.js","",{src:true})
        .pipe(gulp.dest('./'+res.component));

      }
      else
      {
        console.error('\033[31mThere is already a component by the name:\033[37m ',res.component);
      }
    });
  }));
})
