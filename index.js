var gulp = require('gulp');
var useref = require('gulp-useref');
var path = require('path');

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
  var project = cwd.slice(-1)[0];

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
  
  gulp.task('default', function () {
    var view_path = path.join(abs, view, project);
    var root_path = path.join(abs, root);
    var asset_path = path.join(root_path, 'asset', project, 'img');
    //第一次useful，搞定文件合并和存储；第二次，加上目录前缀
    gulp.src('*.html')
      .pipe(useref({
        base: root_path
      }))
      .pipe(useref({
        import: function (content, target, options, alternateSearchPath) {
          return content.replace('/asset/', '/' + rewrite + '/asset/');
        }
      }))
      .pipe(gulp.dest(view_path))
      .on('finish', function () {
        console.log('\n  打包完毕。');
        console.log('\n    页面目录：%s', view_path);
        console.log('\n    资源目录：%s \n', root_path);
      });

    //图片要单独搞
    gulp.src('img/*')
      .pipe(gulp.dest(asset_path))
      .on('finish', function () {
        console.log('\n  图片收集完毕。');
        console.log('\n    图片目录：%s', asset_path);
      });
  });

  //gulp.start();
  console.log('\n  文件监控已启动，每次`Ctrl + S`将自动分析并打包。');
  var watcher = gulp.watch('*.html', ['default']);
  var count = 0;
  watcher.on('change', function(event) {
    console.log('\n  File ' + event.path + ' was ' + event.type + '( ' + ++count + ' ), running tasks...');
  });  
}