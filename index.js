var gulp = require('gulp');
var useref = require('gulp-useref');
var path = require('path');
var vinylPaths = require('vinyl-paths');

module.exports = function (config) {
  /*
  gulp.task('lint', function() {
      gulp.src('./js/*.js')
          .pipe(jshint())
          .pipe(jshint.reporter('default'));
  });

  // 编译Sass
  gulp.task('sass', function() {
      gulp.src('./scss/*.scss')
          .pipe(sass())
          .pipe(gulp.dest('./css'));
  });

  // 合并，压缩文件
  gulp.task('scripts', function() {
      gulp.src('./js/*.js')
          .pipe(concat('all.js'))
          .pipe(gulp.dest('./dist'))
          .pipe(rename('all.min.js'))
          .pipe(uglify())
          .pipe(gulp.dest('./dist'));
  });*/
  var cwd = process.cwd().split(path.sep);
  var soil_path = cwd.slice(2, 3)[0];//得到:wxpay.oa.com-boss
  var abs = cwd.slice(0, 3).join(path.sep);

  //定位站点信息
  var location = soil_path.split('-');
  var host = location[0] || '';
  var rewrite = location[1] || 'main';//默认的转发
  config.site[host] = config.site[host] || {};

  if (!config.site[host][rewrite]) {
    console.log('\n  [%s]错误的站点目录。', soil_path);
    return;
  }

  var root = config.site[host][rewrite].root;
  var view = config.site[host][rewrite].view;

  console.log('\n  文件监控已启动，每次`Ctrl + S`将自动分析并打包。');
  var watcher = gulp.watch('*/*.html');
  var count = 0;
  watcher.on('change', function(event) {
    console.log('\n  File ' + event.path + ' was ' + event.type + '( ' + ++count + ' ), running tasks...');
    gulp.task('default', function () {
      var project = event.path.split(path.sep).slice(-2)[0];
      var view_path = path.join(abs, view, project);
      var root_path = path.join(abs, root);
      var partial_path = path.join(root_path, 'partial');
      var vp = vinylPaths();  

      //第一次useful，搞定文件合并和存储；第二次，加上目录前缀
      var steam = gulp.src(event.path)
        .pipe(useref({
          base: root_path
        }))
        .pipe(useref({
          import: function (content, target, options, alternateSearchPath) {
            //替换资源路径和图片路径
            content = content
              .replace(/asset/g, rewrite + '/asset')
              .replace(/vendor/g, rewrite + '/vendor')
              .replace(/partial/g, rewrite + '/partial');
            var asset = '';
            if ('partial' !== project) {
              asset = 'asset/';
            }
            
            return content.replace(/img\//g, '/' + rewrite + '/' + asset + project + '/img/');     
          }
        }))
        .pipe(vp);

      if ('partial' !== project) {
        steam.pipe(gulp.dest(view_path));
      } else {
        steam.pipe(gulp.dest(partial_path));
      }
        
      steam.on('finish', function () {
          console.log('\n  打包完毕。');
          console.log('\n    页面目录：%s', view_path);
          console.log('\n    资源目录：%s \n', root_path);
          //记录所有修改的文件并计算其md5值
          console.log('Paths:', vp.paths);
        });

      if ('partial' !== project) {
        var img_path = path.join(root_path, 'asset', project, 'img');
      } else {
        var img_path = path.join(partial_path, 'img');
      }
      
      //图片要单独搞
      gulp.src('img/*')
        .pipe(gulp.dest(img_path))
        .on('finish', function () {
          console.log('\n  图片收集完毕。');
          console.log('\n    图片目录：%s', img_path);
        });
    });

    gulp.start();
  });  
}