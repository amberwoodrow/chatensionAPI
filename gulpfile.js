// MODULE DEPENDENCIES

var gulp = require('gulp');
var babel = require('gulp-babel');
var jshint = require('gulp-jshint');
var nodemon = require('gulp-nodemon');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var io = require('socket.io');
var gutil = require('gulp-util');

// CONFIG

var paths = {
  sass: [
    './client/public/styles/main.scss'
  ],
  server: [
    './server/bin/www'
  ],
  content: [
    './client/public/scripts/chatContent.js'
  ]
};

var nodemonConfig = {
  script: paths.server,
  ext: 'html js css scss jsx',
  ignore: ['node_modules']
};

// GULP TASKS

gulp.task('babel-build', function() {
  // build command line: 
  // babel --presets react ../extension/content.js --watch --out-dir ./build_output
  console.log('Babel built');
  return gulp.src('./client/public/scripts/chatContent.js')
    .pipe(babel({
      presets: ['react']
    }))
    .pipe(gulp.dest('./client/public/build_output'));
});

gulp.task('sass-build', function () {
  console.log("Sass built");
  gulp.src('./client/public/styles/main.scss')
  .pipe(sass.sync().on('error', sass.logError))
  .pipe(gulp.dest('./client/public/build_output'));
});

gulp.task('lint', function() {
  return gulp.src(paths.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('nodemon', function (cb) {
  var called = false;
  return nodemon(nodemonConfig)
  .on('start', function () {
    if (!called) {
      called = true;
      cb();
    }
  });
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['lint']);
  gulp.watch(paths.content, ['babel-build']);
  gulp.watch(paths.sass, ['sass-build']);
});

gulp.task('default', ['nodemon', 'watch'], function(){});

