var gulp = require('gulp'),
    sass = require('gulp-sass'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    notify = require('gulp-notify'),
    runSequence = require('run-sequence'),
    awspublish = require('gulp-awspublish'),
    livereload = require('gulp-livereload'),
    bump = require('gulp-bump'),
    lr = require('tiny-lr'),
    server = lr(),
    libVersion = require('./package.json').version,
    awsCreds = require('./aws_credentials.json');


gulp.task('styles', function() {
  return gulp.src('sass/static-lib.scss')
    .pipe(sass())
    .pipe(gulp.dest('css'))
    .pipe(livereload(server))
    .pipe(notify({ message: 'Styles task complete' }));
});

gulp.task('bump', function(){
  var options = {
    type: 'prerelease'
  };
  gulp.src('./package.json')
  .pipe(bump(options))
  .pipe(gulp.dest('./'));
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

     // gzip, Set Content-Encoding headers and add .gz extension
    .pipe(awspublish.gzip({ ext: '.gz' }))

    // publisher will add Content-Length, Content-Type and  headers specified above
    // If not specified it will set x-amz-acl to public-read by default
    .pipe(publisher.publish(headers))

    // create a cache file to speed up consecutive uploads
    .pipe(publisher.cache())

     // print upload updates to console
    .pipe(awspublish.reporter())
    .pipe(notify({ message: 'Static lib was successfully deployed to S3' }));
});


gulp.task('watch', function() {

  // Watch .scss files
  gulp.watch('sass/**/*.scss', ['styles']);

});


gulp.task('minify-css', function () {
  console.log(libVersion);
  return gulp.src('css/static-lib.css')
    .pipe(rename({suffix: '.' + libVersion}))
    .pipe(minifycss())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist'));
});

gulp.task('deploy', function(callback) {
  runSequence('bump', 'minify-css', 'publish');
});


gulp.task('default', function() {
    gulp.start('styles', 'watch');
});
