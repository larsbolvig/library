// var gulp = require('gulp');
// var sass = require('gulp-sass');

// gulp.task('styles', function () {
//     gulp.src('sass/app.scss')
//         .pipe(sass())
//         .pipe(gulp.dest('css'));
// });


var gulp = require('gulp'),
    sass = require('gulp-sass'),
    coffee = require('gulp-coffee'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    lr = require('tiny-lr'),
    server = lr();


gulp.task('styles', function() {
  return gulp.src('sass/app.scss')
    // .pipe(sass({ style: 'expanded' }))
    // .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(sass())
    .pipe(gulp.dest('css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('css'))
    .pipe(livereload(server))
    .pipe(notify({ message: 'Styles task complete' }));
});



gulp.task('watch', function() {

  // Watch .scss files
  gulp.watch('sass/**/*.scss', ['styles']);

  // Watch .js files
  // gulp.watch('coffee/**/*.coffee', ['scripts']);


});


gulp.task('oneTest', function() {
  notify({ message: 'oneTest has just run' });
});

gulp.task('twoTest', function() {
  notify({ message: 'twoTest has just run' });
});

gulp.task('runBoth', ['oneTest', 'twoTest'], function() {
  notify({ message: 'twoTest has just run' });
});


gulp.task('deploy', ['array', 'of', 'task', 'names'], function() {
  // Do stuff
});


// gulp.task('default', function() {
//     gulp.start('styles', 'scripts');
// });

gulp.task('default', function() {
    gulp.start('styles', 'watch');
});