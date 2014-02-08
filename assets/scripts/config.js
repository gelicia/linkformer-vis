// Require.js allows us to configure shortcut alias
var config = {

	/**
     * The shim config allows us to configure dependencies for
     * scripts that do not call define() to register a module
     */
	shim: {
	    'd3': {
	        exports: 'd3'
	    },

	    'geom': {
	    	deps: ['d3'],
	    	exports: 'geom'
	    },

	    'layout': {
	    	deps: ['d3'],
	    	exports: 'layout'
	    }
	},

    /**
     * path mappings for module names not found directly under baseUrl
     */
	paths: {
		jquery: 'plugins/jquery-1.9.0.min',
		d3: 'plugins/d3/d3.v3',
		geom: 'plugins/d3/geom/geom',
		layout: 'plugins/d3/layout/layout'
	}
};

//TODO: Remove for production
//Adds a unique id to the end of the included
//files to prevent hard caching
config.urlArgs = 'bust=' + (new Date()).getTime();