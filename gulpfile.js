'use strict';

const gulp = require('gulp');
const symlink = require('gulp-symlink');
const fs = require('fs');

/* ------------------------------------------------
 * Sym Links
 * ------------------------------------------------ */
gulp.task('remove-link-src', next => {
  unlink('./node_modules/src', next);
});

gulp.task('dev-sym-links', ['remove-link-src'], () => {
  return gulp.src(['src/'])
    .pipe(symlink(['./node_modules/src'], {
      force: true
    }));
});

function unlink(symlink, next) {
  fs.lstat(symlink, (lerr, lstat) => {
    if (lerr || !lstat.isSymbolicLink()) {
      return next();
    }

    fs.unlink(symlink, () => {
      return next();
    });
  });
}