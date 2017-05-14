/**
 * Created by Administrator on 2017/5/9.
 */
var url = require("url");
var datajson = require("./data/main.js");
const gulp = require('gulp'),
      rename = require('gulp-rename'),   //�ļ�������
      uglify = require('gulp-uglify'),  //js��ѹ��
      concat = require('gulp-concat'),   //�ļ��ĺϲ�
      sass = require('gulp-sass'),       //sass�ı���
      cleanCSS = require('gulp-clean-css'),  //css��ѹ��
      browserify = require('gulp-browserify'), //ģ�黯�Ĵ��
      webserver = require('gulp-webserver'),  //web����������
      imagemin = require('gulp-imagemin'),    //ͼƬ��ѹ��
      rev = require('gulp-rev'),               //���ļ�����MD5��׺
      revCollector = require('gulp-rev-collector'), //·���滻
      pngquant = require('imagemin-pngquant');   //ͼƬ�����ѹ��

gulp.task('js', function () {
    gulp.src('src/js/common/*.js')
        //.pipe(concat("app.js"))
        //.pipe(rename({suffix: '.min'}))
        //.pipe(uglify())
        //.pipe(browserify({
        //    insertGlobals : true,
        //    debug : !gulp.env.production
        //}))
        .pipe(gulp.dest("./build/js/common")) //������ļ���
});


gulp.task("css",function(){
    gulp.src("src/css/*.scss")
        .pipe(sass())
        .pipe(cleanCSS())
        .pipe(rev())
        .pipe(gulp.dest("./build/css"))
        .pipe(rev.manifest())
        .pipe(gulp.dest("./rev/css"))
})

gulp.task("revhtml",function(){
    gulp.src(['rev/**/*.json', 'src/**/*.html'])
        .pipe(revCollector({
            replaceReved: true,
            dirReplacements: {
                '/css': '../css',
                'js': '../js/',
                //'cdn/': function(manifest_value) {
                //    return '//cdn' + (Math.floor(Math.random() * 9) + 1) + '.' + 'exsample.dot' + '/img/' + manifest_value;
                //}
            }
        }))
        .pipe(gulp.dest("build"))
})

gulp.task("testImagemin", function(){
    gulp.src("src/img/*.{png,jpg,gif,ico}")
        /*.pipe(imagemin({
            optimizationLevel: 5, //���ͣ�Number  Ĭ�ϣ�3  ȡֵ��Χ��0-7���Ż��ȼ���
            progressive: true, //���ͣ�Boolean Ĭ�ϣ�false ����ѹ��jpgͼƬ
            interlaced: true, //���ͣ�Boolean Ĭ�ϣ�false ����ɨ��gif������Ⱦ
            multipass: true //���ͣ�Boolean Ĭ�ϣ�false ����Ż�svgֱ����ȫ�Ż�
        }))*/
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],//��Ҫ�Ƴ�svg��viewbox����
            use: [pngquant()] //ʹ��pngquant���ѹ��pngͼƬ��imagemin���
        }))
        .pipe(gulp.dest("./dist/img"))
})

gulp.task("build",["js","css","revhtml"])

gulp.task("webserver",["build"], function(){
    //gulp.watch("./src/css/*.scss",["css"]);
    //gulp.watch("./src/html/*.html",["html"]);
    gulp.src('./build')
        .pipe(webserver({
            livereload: true,
            directoryListing: true,
            port:3300,
            open: "/html/search.html",
            middleware:function(req,res,next){
                var paths = url.parse(req.url).pathname,
                    data = datajson.getData();
                data.forEach(function(item){
                    if(item.route==paths){
                        item.handle(req,res,next)
                    }
                })
                next();
            }
        }));
})