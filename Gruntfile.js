module.exports = function (grunt) {
	grunt.initConfig({
		uglify: {
			my_target: {
				options: {
					beautify: true
				},
				files: {
					'./lib/launchers/uitest-min.js': ['./static/uitest.js']
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask("default", ['uglify']);
}