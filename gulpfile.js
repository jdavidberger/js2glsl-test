var gulp = require('gulp');
var browserify = require('browserify');

var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var shell =  require('gulp-shell');
var fs = require('fs'); 
var PNGDiff = require('png-diff');

gulp.task('default', [ 'verify-headless', 'run-unittest']); 

//// ** Headless compilation ** //

gulp.task('build-headless', function() {
    var b = browserify({
	entries: './headless/headlessTestRunner.js',
	standalone: 'js2glsl',
	debug: true
    }); 
  return b.bundle()
    .pipe(source('headlessTestRunner.bundle.js'))
    .pipe(buffer())
    .pipe(gulp.dest('./headless/')) 
});

gulp.task('run-headless', ['build-headless'], 
	  shell.task([
	      'slimerjs headless/index.js'
	  ])
	 ); 

gulp.task('verify-headless', ['run-headless'], function() {
    var files = fs.readdirSync("headless/test_images"); 
    files.forEach(function(testImageName) {

	var baselineImagePath = "./headless/baseline_images/" + testImageName;
	var testImagePath = "./headless/test_images/" + testImageName;
	PNGDiff.outputDiff(testImagePath, baselineImagePath, "./headless/diff_images/"+testImageName
	, function(err, diffMetric) {
	    if(diffMetric != 0) { 
		console.log("=================== IMAGE " + testImagePath + " FAILED ====================");
	    }
	}); 
    }); 
});

//// ** Unit-test compilation ** //

gulp.task('build-unittest', function() {
    var b = browserify({
	entries: './index.js',
	debug: true
    }); 
  return b.bundle()
    .pipe(source('index.bundle.js'))
    .pipe(buffer())
    .pipe(gulp.dest('.')) 
});

gulp.task('run-unittest', ['build-unittest'], 
	  shell.task([
	      'slimerjs run-mocha.js'
	  ])
	 ); 
