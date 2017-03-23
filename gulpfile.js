const gulp = require('gulp')
const eslint = require('gulp-eslint')
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')

const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const cssnano = require('gulp-cssnano')

const htmlmin = require('gulp-htmlmin')
const imagemin = require('gulp-imagemin')

const clean = require('gulp-clean')
const rename = require('gulp-rename')
const browserify = require('browserify')
const babelify = require('babelify')
const partialify = require('partialify')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')

const sequence = require('gulp-sequence')
const browserSync = require('browser-sync').create()

/* config */
const files = {
  vendor: ['assets/js/angular.min.js', 'assets/js/angular-*.min.js'],
  pages: ['login', 'cases', 'setting']
}



/* task */
const task = {
  eslint() {
    return gulp.src(files.js)
      .pipe(eslint())
      .pipe(eslint.format())
  },
  vendor() {
    return gulp.src(files.vendor)
      .pipe(concat('vendor.js'))
      .pipe(gulp.dest('dist/js'))
  },
  js(pageName) {
    return browserify(`src/pages/${pageName}`)
      .transform(babelify)
      .transform(partialify)
      .bundle()
      .on('error', function (err) {
        console.error(`Error: ${err.message}`)
        this.emit('end')
      })
      .pipe(source(`${pageName}.js`))
      .pipe(buffer())
      .pipe(uglify())
      .pipe(gulp.dest('dist/js'))
  },
  html(pageName) {
    return gulp.src(`src/pages/${pageName}/index.html`)
      .pipe(htmlmin({
        collapseWhitespace: true
      }))
      .pipe(rename(`${pageName}.html`))
      .pipe(gulp.dest('dist/'))
  },
  scss(pageName) {
    return gulp.src(`src/pages/${pageName}/index.scss`)
      .pipe(sass.sync().on('error', sass.logError))
      .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
      }))
      .pipe(cssnano())
      .pipe(rename(`${pageName}.css`))
      .pipe(gulp.dest('dist/css'))
  },
  image(path) {
    return gulp.src(path)
      .pipe(imagemin())
      .pipe(gulp.dest('dist/images'))
  }
}

/* task-clean */
gulp.task('clean', () => {
  return gulp.src('dist', {
    read: false
  }).pipe(clean())
})

/* task-browserSync */
gulp.task('browserSync', () => {
  browserSync.init(['./dist/**/*.*'], {
    server: {
      baseDir: './dist'
    }
  })
})

/* task-watch */
gulp.task('watch', ['browserSync'], () => {
  /* watch file add，delete */
  gulp.watch('src/pages/*/*.*')
    .on('change', (e) => {
      let filePath = e.path
      /** 获取模块名 */
      let pagePath = filePath.split('\\')
      let pageName = pagePath[pagePath.length - 2]
      /** 获取后缀 */
      let pathArr = filePath.split('.')
      let ext = pathArr[pathArr.length - 1]

      // 根据文件后缀来判断并执行相应的任务
      task[ext](pageName)
    })

  gulp.watch('src/assets/images/*.*')
    .on('change', (e) => {
      let filePath = e.path
      task.image(filePath)
    })
  gulp.watch('src/components/*/*.*')
    .on('change', (e) => {
      files.pages.forEach(pageName => {
        task.js(pageName)
      })
    })
})

/* task-build */
gulp.task('build', sequence('clean', () => {
  files.pages.forEach(v => {
    task.js(v)
    task.html(v)
    task.scss(v)
  })
  task.image('src/assets/images/*.*')
}))

/* task-default */
gulp.task('default', sequence('build', ['watch']))