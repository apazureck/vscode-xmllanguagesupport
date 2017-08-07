"use strict";
var gulp = require("gulp"),
    watch = require("gulp-watch");

gulp.task("watch", () => {
    return watch("test/input/**/*").pipe(gulp.dest("out/test/input"));
});