/**
 * Created by Shaun on 11/13/2014.
 */

var gulp = require('gulp');
var concat = require('gulp-concat');
var babel = require('gulp-babel');
var browserify = require('browserify');
var babelify = require('babelify');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var karma = require('karma').server;
var runSequence = require('run-sequence');
var clean = require('gulp-clean');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var karmaConfig = __dirname + '/karma.conf.js';
var jsSources = [
  'bower_components/kilo/kilo.js',
  'bower_components/lodash/lodash.min.js',
  'src/**/*.js'
];

gulp.task('clean', function() {
  return gulp.src('dist', {read: false})
    .pipe(clean());
});

/*gulp.task('build', function() {
  return gulp.src(jsSources)
    .pipe(babel())
    .pipe(concat('kitties.js'))
    .pipe(gulp.dest('dist'));
});*/

gulp.task('build', function () {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: './src/main.js',
    debug: true,
    // defining transforms here will avoid crashing your stream
    transform: [babelify.configure({
      stage: 1
    })]
  });

  return b.bundle()
    //.on('error', function(err) { console.log('Browserify: JS Error!'); })
    .pipe(source('kitties.js'))
    .pipe(buffer())
    //.pipe(sourcemaps.init({loadMaps: true}))
    // Add transformation tasks to the pipeline here.
    //.pipe(uglify())
    //.on('error', gutil.log)
    //.pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('build-prod', function() {
  return gulp.src(jsSources)
    .pipe(concat('kitties.js'))
    .pipe(gulp.dest('dist'))
    .pipe(uglify())
    .pipe(rename('kitties.min.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('test', function(cb) {
  return karma.start({
    configFile: karmaConfig,
    singleRun: true
  }, cb);
});

gulp.task('watch', function() {
  return gulp.watch('src/**/*.js', ['build']);
});

gulp.task('ci', function(cb) {
  return karma.start({
    configFile: karmaConfig
  }, cb);
});

gulp.task('default', function(cb) {
  runSequence('clean', 'build', 'watch', cb);
});

gulp.task('prod', function(cb) {
  runSequence('test', 'clean', 'prod-build', cb);
});