module.exports = function (grunt) {

    var staticFilePattern = '**/*.{js,css,map,html,htm,jpg,jpeg,png,gif,eot,svg,ttf,woff}';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'public/app.min.js': ['<%= typescript.base.dest %>']
                }
            }
        },
        clean: ['public/vendor', 'public/fonts'],
        copy: {
            bower: {
                files: [
                    {
                        expand: true,
                        cwd: "bower_components/respond/dest/",
                        src: staticFilePattern,
                        dest: "public/vendor/respond/"
                    },
                    {
                        expand: true,
                        cwd: "bower_components/bootstrap/dist/",
                        src: staticFilePattern,
                        dest: "public/vendor/bootstrap/"
                    },
                    {
                        expand: true,
                        cwd: "bower_components/bootstrap/dist/fonts",
                        src: staticFilePattern,
                        dest: "public/fonts/"
                    },
                    {
                        src: "bower_components/jquery.validation/jquery.validate.js",
                        dest: "public/vendor/jquery.validation/jquery.validate.js"
                    },
                    {
                        src: "bower_components/modernizr/modernizr.js",
                        dest: "public/vendor/modernizr/modernizr.js"
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/jquery/',
                        src: staticFilePattern,
                        dest: 'public/vendor/jquery/'
                    }
                ]
            }
        },
        less: {
            dev: {
                options: {
                    cleancss: false
                },
                files: {
                    "public/css/site.css": "public/**/*.less"
                }
            },
            release: {
                options: {
                    cleancss: true
                },
                files: {
                    "public/css/site.css": "public/**/*.less"
                }
            }
        },
        watch: {
            bower: {
                files: ['bower_components/' + staticFilePattern],
                tasks: ['clean', 'copy:bower']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-less');
    //grunt.loadNpmTasks('grunt-contrib-jshint');
    //grunt.loadNpmTasks('grunt-contrib-qunit');
    //grunt.loadNpmTasks('grunt-contrib-concat');

    //grunt.registerTask('test', ['jshint', 'qunit']);
    grunt.registerTask('dev', ['clean', 'copy', 'less:dev']);
    grunt.registerTask('release', ['clean', 'copy', 'uglify', 'less:release']);
    grunt.registerTask('default', ['dev']);
};