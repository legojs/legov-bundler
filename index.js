var gulp = require('gulp');
var useref = require('gulp-useref');
var path = require('path');
var cwd = process.cwd();

module.exports = function (config) {
  gulp.task('default', function() {
    return gulp.src(cwd + '/*/*.html')
      .pipe(useref())
      .pipe(gulp.dest('../views'));
  });

  gulp.start();
}