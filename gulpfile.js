var gulp = require('gulp'),
    sass = require('gulp-sass'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    notify = require('gulp-notify'),
    runSequence = require('run-sequence'),
    awspublish = require('gulp-awspublish'),
    livereload = require('gulp-livereload'),
    lr = require('tiny-lr'),
    server = lr(),
    libVersion = require('./package.json').version,
    awsCreds = require('./aws_credentials.json');


gulp.task('styles', function() {
  return gulp.src('sass/app.scss')
    .pipe(sass())
    .pipe(gulp.dest('css'))
    .pipe(livereload(server))
    .pipe(notify({ message: 'Styles task complete' }));
});


gulp.task('publish', function() {

  // create a new publisher
  var publisher = awspublish.create({ key: awsCreds.key,  secret: awsCreds.secret, bucket: awsCreds.bucket });

  // define custom headers
  var headers = {
     'Cache-Control': 'max-age=315360000, no-transform, public'
     // ...
   };

  return gulp.src('dist/*.css')

    // publisher will add Content-Length, Content-Type and Cache-Control headers
    // and if not specified will set x-amz-acl to public-read by default
    .pipe(publisher.publish(headers));

    // // create a cache file to speed up consecutive uploads
    // .pipe(publisher.cache())

    //  // print upload updates to console
    // .pipe(awspublish.reporter());
});


gulp.task('watch', function() {

  // Watch .scss files
  gulp.watch('sass/**/*.scss', ['styles']);

});


gulp.task('minify-css', function () {
  return gulp.src('css/app.css')
    .pipe(rename({suffix: '.' + libVersion}))
    .pipe(minifycss())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist'));
});





// gulp.task('deploy', ['minify-css', 'publish'], function() {
//   // Do stuff
// });


gulp.task('deploy', function(callback) {
  runSequence('minify-css',
              /* ['build-scripts', 'build-styles'], */
              'publish',
              function () {
                console.log("Library was successfully deployed to Amazon S3");
              });
});


gulp.task('default', function() {
    gulp.start('styles', 'watch');
});