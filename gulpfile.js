var gulp = require('gulp');
var ftp = require('gulp-ftp');
var zip = require('gulp-zip');
var shell = require('gulp-shell');
var sequence = require('run-sequence');
var del = require('del');
var env = require('node-env-file');
var notifier = require('node-notifier');

//env(__dirname + '/.env');

var appDeploy = [
    '.htaccess',
    './*.png',
    './*.ico',
    './composer.json',
    './composer.phar',

    './app/**/*',
    '!./app/config/**/*.yml',
    '!./app/database/**/*',
    '!./app/cache/**/*',
    './app/cache/index.html',
    './extensions/**/*',
    './files/index.html',
    './files/.htaccess',
    './index.php',
    './src/**/*',
    './theme/base-2014/**/*',
    './vendor/**/*'
];

var cleanup = [
    './dist/[tT]ests/**',
    './dist/vendor/psr/log/Psr/Log/Test/**/*',
    './dist/vendor/symfony/form/Symfony/Component/Form/Test/**/*',
    './dist/vendor/twig/twig/lib/Twig/Test/**/*',
    './dist/vendor/twig/twig/test/**/*',
    './dist/vendor/swiftmailer/swiftmailer/test-suite/**/*',
    './dist/composer.*',
    './dist/vendor/symfony/locale/Symfony/Component/Locale/Resources/data/**/*',
    './dist/app/database/.gitignore',
    './dist/app/view/img/debug-nipple-src.png',
    './dist/app/view/img/*.pxm',
    './dist/vendor/swiftmailer/swiftmailer/doc/**/*',
    './dist/vendor/swiftmailer/swiftmailer/notes/**/*',
    './dist/theme/base-2014/Gruntfile.js',
    './dist/theme/base-2014/package.json',
    './dist/theme/base-2014/bower.json'
];

var themeDeploy = [
    './theme/kforce/config.yml',
    './theme/kforce/.htaccess',
    './theme/kforce/dist/img/**/*',
    './theme/kforce/dist/js/**/*',
    './theme/kforce/dist/css/**/*',
    './theme/kforce/dist/templates/**/*'
];

gulp.task('bundle:clean', function(cb) {
    del(['./dist/**/*'], cb);
});

gulp.task('bundle:transfer', function() {
    return gulp.src(appDeploy, {base: '.'})
        .pipe(gulp.dest('dist'));
});

gulp.task('bundle:theme', function() {
    return gulp.src(themeDeploy, {base: '.'})
        .pipe(gulp.dest('dist'));
});

gulp.task('bundle:update', shell.task(['./composer-update.sh']));

gulp.task('bundle:cleanup', function(cb) {
    del(cleanup, cb);
});

gulp.task('bundle:zip', function() {
    return gulp.src(['./dist/**/*', './dist/**/.htaccess'], {base: './dist'})
        .pipe(zip('kforce-bundle.zip'))
        .pipe(gulp.dest('dist'));
});

gulp.task('bundle', function(cb) {
    sequence('bundle:clean', 'bundle:transfer', 'bundle:theme', 'bundle:update', 'bundle:cleanup', 'bundle:zip', cb);
});

// This will just upload the zip file, so be sure to run
// gulp bundle
// first
gulp.task('deploy:app', function() {
    return gulp.src('dist/oasis-bundle.zip', {base: './dist'})
        .pipe(ftp({
            host: process.env.FTPHOST,
            user: process.env.FTPUSER,
            pass: process.env.FTPPASS,
            remotePath: process.env.FTPDIR
        }))
        .on('finish', function() {
            notifier.notify({title: 'App Deploy Complete'});
        });
});

//Most of the time you will want this
gulp.task('deploy:theme', function() {
    return gulp.src(themeDeploy, {base: '.'})
        .pipe(ftp({
            host: process.env.FTPHOST,
            user: process.env.FTPUSER,
            pass: process.env.FTPPASS,
            remotePath: process.env.FTPDIR
        }))
        .on('finish', function() {
            notifier.notify({title: 'Theme Deploy Complete'});
        });
});
