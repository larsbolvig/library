// New Test again :)
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    notify = require('gulp-notify'),
    runSequence = require('run-sequence'),
    awspublish = require('gulp-awspublish'),
    livereload = require('gulp-livereload'),
    clean = require('gulp-clean'),
    bump = require('gulp-bump'),
    git = require('gulp-git'),
    es = require('event-stream'),
    lr = require('tiny-lr'),
    fs = require('fs'),
    path = require('path'),
    server = lr(),
    awsCreds = require('./aws_credentials.json'),
    libVersion, jsonData, pkg;


// create a new publisher
var publisher = awspublish.create({ key: awsCreds.key,  secret: awsCreds.secret, bucket: awsCreds.bucket });

// define custom headers for files uploaded to S3
var headers = {
   'Cache-Control': 'max-age=315360000, no-transform, public'
 };

// Type of release: major|minor|patch|prerelease
var releaseType = 'prerelease';


gulp.task('styles', function() {
  return gulp.src('scss/static-lib.scss')
    .pipe(sass())
    .pipe(gulp.dest('css'))
    .pipe(livereload(server))
    .pipe(notify({ message: 'Styles task complete' }));
});


gulp.task('gitPush', function(){
  git.push('origin', 'master');
});

// Tag the repo with a new version of Staticlib
gulp.task('tag', function(){
  git.tag('v'+libVersion, 'New Staticlib release');
});


gulp.task('push-tag', ['tag'], function(){
  git.push('origin', 'v'+libVersion);
});


gulp.task('set-version-number', function () {
  jsonData = fs.readFileSync(path.join(__dirname, 'package.json'));
  pgk = JSON.parse(jsonData);
  libVersion = pgk.version;
});


gulp.task('bump', function(){
  var options = {
    type: releaseType
  };
  return gulp.src('./package.json')
  .pipe(bump(options))
  .pipe(gulp.dest('./'));
});


gulp.task('connectionTest', function () {
  return gulp.src('dist/img/DK.png')
    .pipe(publisher.publish(headers))
    .on('error', function () {
      console.log("Couldn't connect to Amazon S3. Please check your AWS credentials.");
    });

});


// CLEANING TASKS
gulp.task('clean', function() {
  return gulp.src(['dist/css/*.css','dist/js/**/*.js'])
    .pipe(clean());
});


gulp.task('clean-vendor-js', function() {
  return gulp.src('dist/js/vendor-js/*.js')
    .pipe(clean());
});


gulp.task('upload', function() {

  // globs for txt and bin files
  var txtFiles = 'dist/**/*.{js,css,svg}';
  var picFiles = 'dist/**/*.{png,jpg,jpeg}';

  // gzip text files stream
  var gzStream = gulp
    .src(txtFiles)
    .pipe(awspublish.gzip({ ext: '' }));

  // picture stream
  var picStream = gulp
    .src(picFiles);

  return es.merge(gzStream, picStream)
    .pipe(publisher.publish(headers))
    .pipe(publisher.sync())
    .pipe(publisher.cache())
    .pipe(awspublish.reporter({
      states: ['create', 'update', 'delete']
    }));
});


gulp.task('upload-vendor-js', function() {

  // globs for txt and bin files
  var txtFiles = 'dist/**/*.{js,css,svg}';
  var picFiles = 'dist/**/*.{png,jpg,jpeg}';

  // gzip text files stream
  var gzStream = gulp
    .src(txtFiles)
    .pipe(awspublish.gzip({ ext: '' }));

  // picture stream
  var picStream = gulp
    .src(picFiles);

  return es.merge(gzStream, picStream)
    .pipe(publisher.publish(headers))
    .pipe(publisher.sync()) /* carfefull!! */
    .pipe(publisher.cache())
    .pipe(awspublish.reporter({
      states: ['create', 'update', 'delete']
    }))
    .pipe(notify({ message: 'Vendor js uploaded successfully to S3.' }));
});


gulp.task('watch', function() {
  // Watch .scss files
  gulp.watch('scss/**/*.scss', ['styles']);

});


gulp.task('publish-vendor-js', function () {
  return gulp.src('js/vendor-js/*.js')
    .pipe(rename({suffix: '.' + 'v'+libVersion}))
    .pipe(gulp.dest('dist/js/vendor-js'));
});


gulp.task('publish-lib-js', function () {
  return gulp.src('js/lib-js/*.js')
    .pipe(rename({suffix: '.' + 'v'+libVersion}))
    .pipe(gulp.dest('dist/js/lib-js'));
});


gulp.task('minify-css', function () {
  return gulp.src('css/static-lib.css')
    .pipe(rename({suffix: '.' + 'v'+libVersion}))
    .pipe(minifycss())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist/css'));
});


gulp.task('deploy', function() {
  runSequence(
    'connectionTest',
    'bump',
    'set-version-number',
    'clean',
    'minify-css',
    'publish-vendor-js',
    'publish-lib-js',
    'push-tag',
    'upload');
});


gulp.task('deploy-vendor-js', function() {
  runSequence(
    'connectionTest',
    'clean-vendor-js',
    'publish-vendor-js',
    'upload-vendor-js');
});


gulp.task('default', function() {
    gulp.start('styles', 'watch');
});
