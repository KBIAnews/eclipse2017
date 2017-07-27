module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.initConfig({
		uglify: {
			my_target:{
				files: {
					'django-project/static/js/player.js': ['django-project/static/components/js/player.js'],
					'django-project/static/js/siriwave.js': ['django-project/static/components/js/siriwave.js'],
					'django-project/static/js/home.js': ['django-project/static/components/js/home.js'],
					'django-project/static/js/smoothscroll.js': ['django-project/static/components/js/smoothscroll.js']
				}
			}
		},
		compass: {
			dev: {
				options: {
					config: 'config.rb'
				}
			}
		},
		watch: {
			scripts: {
				files: ['django-project/static/components/js/*.js'],
				tasks: ['uglify']
			},
			sass: {
				files: ['django-project/static/components/sass/*.scss'],
				tasks: ['compass:dev']
			}
		}
	});

	grunt.registerTask('default', 'watch');
}