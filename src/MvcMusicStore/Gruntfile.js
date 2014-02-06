module.exports = function (grunt) {

    var staticFilePattern = '**/*.{js,css,map,html,htm,ico,jpg,jpeg,png,gif,eot,svg,ttf,woff}';

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
        clean: {
            options: { force: true },
            build: ['public']
        },
        copy: {
            bower: {
                files: [
                    {   // JavaScript
                        expand: true,
                        flatten: true,
                        cwd: "bower_components/",
                        src: [
                            "modernizr/modernizr.js",
                            "jquery/**/*.js",
                            "jquery.validation/jquery.validate.js",
                            "bootstrap/dist/**/*.js",
                            "respond/dest/**/*.js",
                        ],
                        dest: "public/js/",
                        options: { force: true }
                    },
                    {   // CSS
                        expand: true,
                        flatten: true,
                        cwd: "bower_components/",
                        src: [
                            "bootstrap/dist/**/*.css",
                        ],
                        dest: "public/css/",
                        options: { force: true }
                    },
                    {   // Fonts
                        expand: true,
                        flatten: true,
                        cwd: "bower_components/",
                        src: [
                            "bootstrap/**/*.{woff,svg,eot,ttf}",
                        ],
                        dest: "public/fonts/",
                        options: { force: true }
                    }
                ]
            },
            assets: {
                files: [
                    {
                        expand: true,
                        cwd: "assets/",
                        src: [
                            staticFilePattern
                        ],
                        dest: "public/",
                        options: { force: true }
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
                    "public/css/site.css": "assets/**/*.less"
                }
            },
            release: {
                options: {
                    cleancss: true
                },
                files: {
                    "public/css/site.css": "assets/**/*.less"
                }
            }
        },
        typescript: {
            dev: {
                src: ['Assets/**/*.ts'],
                dest: 'public/js/site.js',
                options: {
                    module: 'amd', // or commonjs
                    target: 'es5', // or es3
                    sourcemap: false
                }
            },
            release: {
                src: ['Assets/**/*.ts'],
                dest: 'public/js/site.js',
                options: {
                    module: 'amd', // or commonjs
                    target: 'es5', // or es3
                    sourcemap: true
                }
            }
        },
        watch: {
            dev: {
                files: ['bower_components/' + staticFilePattern, 'assets/**/*.*'],
                tasks: ['dev']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-typescript');
    //grunt.loadNpmTasks('grunt-contrib-jshint');
    //grunt.loadNpmTasks('grunt-contrib-qunit');
    //grunt.loadNpmTasks('grunt-contrib-concat');

    //grunt.registerTask('test', ['jshint', 'qunit']);
    grunt.registerTask('dev', ['clean', 'copy', 'less:dev', 'typescript:dev']);
    grunt.registerTask('release', ['clean', 'copy', 'uglify', 'less:release', 'typescript:release']);
    grunt.registerTask('default', ['dev']);
};