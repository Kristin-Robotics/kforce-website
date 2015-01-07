//Googling all of the respective gulp extensions below will give you information on their purpose
var gulp = require('gulp');
var less = require('gulp-less');
var rev = require('gulp-rev-all');
var minifyHTML = require('gulp-minify-html');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var newer = require('gulp-newer');
var plumber = require('gulp-plumber');
var autoprefixer = require('gulp-autoprefixer');
var sequence = require('run-sequence');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');

//Non gulp includes
var argv = require('yargs').argv;
var path = require('path');
var del = require('del');


var isDist = argv.dist;

var onError = function (err) {
    gutil.beep();
    console.log(err);
    this.emit('end')
};

gulp.task('clean:css', function(cb) {
    del(['_tmp/css/**/*'], cb);
});

//Compile scss files into a single css file
gulp.task('css', ['clean:css'], function() {
    return gulp.src('src/css/main.less', {base: path.join(process.cwd(), 'src/css')})
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe( less({
            paths: [path.join(__dirname, 'src', 'vendor')]
        }) )
        .pipe(autoprefixer({cascade: false}))
        .pipe(gulp.dest('_tmp/css'));
});

gulp.task('clean:js', function(cb) {
    del(['_tmp/js/**/*'], cb);
});

//Concatenate js files and uglify in building for production
gulp.task('js', ['clean:js'], function() {
    return gulp.src(['src/vendor/jquery/dist/jquery.js'])
        .pipe(concat('main.js'))
        .pipe(gulpif(isDist, uglify()))
        .pipe(gulp.dest('_tmp/js'));
});

gulp.task('clean:img', function(cb) {
    del(['_tmp/img/**/*'], cb);
});

//Move images over
gulp.task('img', ['clean:img'], function() {
    return gulp.src('src/img/**/*')
        .pipe(gulp.dest('_tmp/img'));
});

gulp.task('clean:templates', function(cb) {
    del(['_tmp/templates/**/*'], cb);
});

//Move templates over
gulp.task('templates', ['clean:templates'], function() {
    return gulp.src('src/templates/**/*')
        .pipe(gulp.dest('_tmp/templates'));
});

gulp.task('clean:rev', function(cb) {
    del(['dist/**/*'], cb);
});

//Replace names in templates with fingerprinted file names for cache-busting
gulp.task('rev', ['clean:rev'], function() {
    return gulp.src(['_tmp/**/*'])
        .pipe(rev({
            transformPath: function (rev, source, path) {
                //If the path is absolute, we need to make it templatable
                if (source.search(/\.\.\//) === -1) {
                    return "{{ paths.theme }}dist/" + rev;
                } else {
                    return rev;
                }
            },
            ignore: ['.twig']
        }))
        .pipe( gulp.dest('dist') )
        .pipe(rev.manifest())
        .pipe( gulp.dest(''));
});


//Watch for file changes
gulp.task('watch', function() {
    sequence('build');
    gulp.watch('src/js/**/*', function() {
        sequence('js', 'rev');
    });
    gulp.watch('src/css/**/*', function() {
        sequence('css', 'rev');
    });
    gulp.watch('src/img/**/*', function() {
        sequence('img', 'rev');
    });
    gulp.watch('src/templates/**/*', function() {
        sequence('templates', 'rev');
    });
});

//Just build the thing
gulp.task('build', function() {
    sequence(['js', 'css', 'img', 'templates'], 'rev');
});

