var gulp = require('gulp'),
	gutil = require('gulp-util'),
	compass = require('gulp-compass'),
	shell = require('gulp-shell'),
	webserver = require('gulp-webserver'),
	flatten = require('gulp-flatten'),
	babel = require('gulp-babel')
    uglify = require('gulp-uglify'),
	path = require('path');

gulp.task('test', function(){
	gutil.log('This is a test.');
});

gulp.task('sass', function(){
	gulp.src('./components/sass/*.scss')
		.pipe(compass({
			project: path.join(__dirname, 'components'),
			css: 'css',
			sass: 'sass',
			require: ['susy']
		}))
		.pipe(flatten())
		.pipe(gulp.dest('build/css'));
});

gulp.task('img', function(){
	return gulp.src('components/img/*')
	.pipe(gulp.dest('build/img'));
});

gulp.task('js', function(){
	return gulp.src('components/js/**/*.js')
		.pipe(babel({
			presets: ['es2015']
		}))
		// .pipe(uglify())
	.pipe(gulp.dest('build/js'));
});

gulp.task('fonts', function(){
	return gulp.src('components/fonts/*')
	.pipe(gulp.dest('build/fonts'));
});

gulp.task('html', function(){
	return gulp.src('components/**/*.html')
	.pipe(gulp.dest('build'));
});

// This task will only work for KBIA.
gulp.task('upload', shell.task([
	'aws s3 cp build s3://apps.kbia.org/eclipse-planner --recursive --profile kbia'
]));

gulp.task('build', ['img', 'js', 'html', 'sass']);

gulp.task('deploy', ['build', 'upload']);

gulp.task('watch',function(){
	gutil.log('Gulp will say that this task has finished, but don\'t believe its dirty lies.');
	gutil.log('Hit \^c to actually exit watch mode.');
	gulp.watch('components/**/*.js',['js']);
	gulp.watch('components/**/*.html',['html']);
	gulp.watch('components/**/*.jpg',['img']);
    gulp.watch('components/**/*.scss',['sass']);
});

gulp.task('serve',['build'], function(){
	gutil.log('Gulp will say that this task has finished, but don\'t believe its dirty lies.');
	gutil.log('Hit \^c to actually exit watch mode.');
	gulp.src('build')
		.pipe(webserver({
			livereload: true,
			directorylisting: true,
			open: true
		}))
	gulp.watch('components/**/*.js',['js']);
	gulp.watch('components/**/*.html',['html']);
	gulp.watch('components/**/*.jpg',['img']);
    gulp.watch('components/**/*.scss',['sass']);
});