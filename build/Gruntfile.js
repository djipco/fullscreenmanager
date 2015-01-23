module.exports = function (grunt) {

    'use strict';

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        bumpup: {
            options: {
                updateProps: {
                    pkg: 'package.json'
                }
            },
            file: 'package.json'
        },

        uglify: {
            options: {
                banner: grunt.file.read('BANNER'),
                compress: {
                    drop_console: true
                },
                preserveComments: false
            },
            build: {
                src: '../src/<%= pkg.name %>.js',
                dest: '../dist/<%= pkg.name %>-<%= pkg.version %>.min.js'
            }
        },

        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                version: '<%= pkg.version %>',
                description: '<%= pkg.description %>',
                url: '<%= pkg.url %>',
                //logo: '<%= pkg.logo %>',
                options: {
                    outdir: '../dist/docs',
                    linkNatives: true,
                    paths: ['../src']
                }
            }
        },

        replace: {
            dist: {
                options: {
                    patterns: [
                        {
                            match: 'version',
                            replacement: '<%= pkg.version %>'
                        },
                        {
                            match: 'author',
                            replacement: '<%= pkg.author %>'
                        }
                    ]
                },
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: ['../dist/<%= pkg.name %>-<%= pkg.version %>.min.js'],
                        dest: '../dist/'
                    }
                ]
            }
        },

        copy: {
            main: {
                src: '../dist/<%= pkg.name %>-<%= pkg.version %>.min.js',
                dest: '../dist/examples/js/<%= pkg.name %>.min.js',
            }
        },

        compress: {
            main: {
                options: {
                    archive: '../packaged/<%= pkg.name %>-<%= pkg.version %>.zip'
                },
                files: [
                    {src: ['**'], cwd: "../dist/", expand: true}
                ]
            }
        }

    });

    grunt.loadNpmTasks('grunt-bumpup');
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-yuidoc");
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.registerTask("default", ['bumpup:prerelease', 'uglify', 'yuidoc', 'replace', 'copy', 'compress']);

};
