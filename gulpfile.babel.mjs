/**
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
import gulp from 'gulp';
import del from 'del';
import runSequence from 'run-sequence';
import gulpLoadPlugins from 'gulp-load-plugins';
import rollup from 'rollup';
import { uglify } from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';
import babel from 'rollup-plugin-babel';

const $ = gulpLoadPlugins();

// Optimize images
gulp.task('images', () =>
  gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size({title: 'images'}))
);

// Copy all files at the root level (app)
gulp.task('copy', () =>
  gulp.src([
    'app/*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'))
    .pipe($.size({title: 'copy'}))
);

gulp.task('copy-qr', () =>
  gulp.src([
    'app/scripts/jsqrcode/*'
  ], {
    dot: true
  }).pipe(gulp.dest('dist/scripts/jsqrcode/'))
    .pipe($.size({title: 'copy-qr'}))
);

gulp.task('copy-sw', () =>
  gulp.src([
    'app/scripts/sw/*'
  ], {
    dot: true
  }).pipe(gulp.dest('dist/scripts/sw/'))
    .pipe($.size({title: 'copy-sw'}))
);

// Compile and automatically prefix stylesheets
gulp.task('styles', () => {
  const AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ];

  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src([
    'app/styles/**/*.css'
  ])
    //.pipe($.newer('.tmp/styles'))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/styles'))
    .pipe($.concat('app.css'))
    // Concatenate and minify styles
    .pipe($.cssnano())
    .pipe($.size({title: 'styles'}))
    .pipe(gulp.dest('dist/styles'));
});

gulp.task('scripts', () => rollup({
  input: 'app/scripts/main.js',
  output: { 
      file: 'dist/app/scripts/main.mjs',
      format: 'es'
  },
  plugins: [
      uglify({}, minify)
  ]
}));

// Scan your HTML for assets & optimize them
gulp.task('html', () => {
  return gulp.src('app/**/*.html')
    .pipe($.useref({
      searchPath: '{.tmp,app}',
      noAssets: true
    }))

    // Minify any HTML
    .pipe($.if('*.html', $.htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      removeOptionalTags: true
    })))
    // Output files
    .pipe($.if('*.html', $.size({title: 'html', showFiles: true})))
    .pipe(gulp.dest('dist'));
});

// Clean output directory 
gulp.task('clean', () => del(['.tmp', 'dist/*', '!dist/.git'], {dot: true}));

gulp.task('webserver', function() {
  gulp.src('dist')
    .pipe($.webserver({
      port: '8080',
      directoryListing: false
    }));
});


// Build production files, the default task
gulp.task('default', ['clean'], cb =>
  runSequence(
    'styles',
    ['html', 'scripts', 'images', 'copy', 'copy-qr', 'copy-sw'],
    cb
  )
);