var gulp = require('gulp'),
    sass = require('gulp-sass'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    notify = require('gulp-notify'),
    livereload = require('gulp-livereload'),
    lr = require('tiny-lr'),
    server = lr();


gulp.task('styles', function() {
  return gulp.src('sass/app.scss')
    .pipe(sass())
    .pipe(gulp.dest('css'))
    .pipe(livereload(server))
    .pipe(notify({ message: 'Styles task complete' }));
});



gulp.task('watch', function() {

  // Watch .scss files
  gulp.watch('sass/**/*.scss', ['styles']);

});


gulp.task('minify-css', function () {
  return gulp.src('css/app.css')
    .pipe(rename({suffix: '.v0-0-1'}))
    .pipe(minifycss())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist'));
});

gulp.task('deploy', ['minify-css'], function() {
  // Do stuff
});


gulp.task('default', function() {
    gulp.start('styles', 'watch');
});