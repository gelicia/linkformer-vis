// Require.js allows us to configure shortcut alias
var config = {
    /**
     * path mappings for module names not found directly under baseUrl
     */
    paths: {
        jquery: 'vendor/jquery-1.9.0.min',
        facebook: '//connect.facebook.net/en_US/all',
        linkedin: '//platform.linkedin.com/in.js?async=true',
        twitter_bootstrap: 'vendor/bootstrap.min',
        lodash: 'vendor/lodash.min',
        text: 'vendor/text'
    },

	/**
     * The shim config allows us to configure dependencies for
     * scripts that do not call define() to register a module
     */
	shim: {
        'facebook': {
            exports: 'FB',
            init: function () {
                FB.init({
                    appId: '374770549287253',
                    channelUrl: '../../../channel.html',
                    status: false,
                    cookie: true,
                    xfbml: true
                });

                return FB;
            }
        },
        linkedin: {
            exports: 'IN',
            init: function () {
                IN.init({
                    api_key: 'tlideznaswj2',
                    authorize: true,
                    scope: "r_basicprofile r_network"
                });
            }
        },
        'twitter_bootstrap': ['jquery']
	}
};

//TODO: Remove for production
//Adds a unique id to the end of the included
//files to prevent hard caching
config.urlArgs = 'bust=' + (new Date()).getTime();