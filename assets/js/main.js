/**
 * initialize the require.js configuration options
 */
require.config(config);

define(
	[
		'jquery',
        'lodash',
        'facebook',
        'linkedin',
        'text!src/templates/linkedInResultsTemplate.html',
        'text!src/templates/facebookResultsTemplate.html',
        'twitter_bootstrap'
	],
    function (
		$,
        _,
        FB,
        IN,
        LinkedInTemplate,
        FacebookTemplate
	) {
		"use strict";

        //jquery elements
        var $facebookLoginButton = $('.js-fb-login'),
            $linkedInLoginButton = $('.js-li-login');


        var facebookData = {},
            accessToken = null,

            //setup deffered login objects
            facebookLoggedIn = $.Deferred(),
            linkedInLoggedIn = $.Deferred();

        //get the facebook login status, if logged in, show login button
        FB.getLoginStatus(function (response) {
            if (response.status !== 'connected') {
                $facebookLoginButton.css({display: 'inline-block'});

                //add click handler
                $facebookLoginButton.click(function () {
                    FB.login(function () {
                        location.reload();
                    }, {scope: 'friends_location,friends_education_history,friends_work_history'});
                });
            } else {
                //resolve deferred
                facebookLoggedIn.resolve();

                //set access token
                accessToken = response.authResponse.accessToken;

                //start loading facebook friends
                FB.api('/me/?fields=friends.fields(first_name,last_name,location,work,education)', function (response) {
                    facebookData = response.friends.data;
                }.bind(this));
            }
        });

        //do the same for the linkedin button
        if (!IN.User.isAuthorized()) {
            $linkedInLoginButton.css({display: 'inline-block'});

            //add click handler
            $linkedInLoginButton.click(function () {
                IN.User.authorize(function () {
                    location.reload();
                });
            });
        } else {
            //resolve deffered
            linkedInLoggedIn.resolve();
        }

        //when both things are logged into
        $.when(facebookLoggedIn, linkedInLoggedIn).done(function () {
            $('#search').show();
        });

        //search click handler
        $('#search').submit(function (e) {
            e.preventDefault();

            //if there's a search term
            if ($('.form-search').val().length > 0) {
                var facebookSubquery = "(SELECT+uid2+FROM+friend+WHERE+uid1=me())+",
                    searchTerm = $('.form-search').val(),
                    facebookQuery = "https://graph.facebook.com/" +
                            "fql?q=SELECT+uid,name,first_name,last_name,work,education,current_location+" +
                            "FROM+user+" +
                            "WHERE+uid+IN+" + facebookSubquery + "and+first_name='" + searchTerm + "'+" +
                            "OR+uid+IN+" + facebookSubquery + "and+last_name='" + searchTerm + "'+" +
                            "OR+uid+IN+" + facebookSubquery + "and+current_location.city='" + searchTerm + "'+" +
                            "OR+uid+IN+" + facebookSubquery + "and+current_location.state='" + searchTerm + "'" +
                            "&access_token=" + accessToken;

                //get the facebook query results
                $.get(facebookQuery, function (response) {
                    var queryResponse = response.data,
                        ids = [];

                    //set ids we're using
                    _.each(queryResponse, function (data) {
                        ids.push(data.uid);
                    });

                    //check stored data for work matches
                    var facebookWorkMatches = _.filter(facebookData, function (data) {
                        return _.some(data.work, function (work) {
                            return work.employer.name === searchTerm;
                        });
                    });

                    //and for school matches
                    var facebookSchoolMatches = _.filter(facebookData, function (data) {
                        return _.some(data.education, function (education) {
                            return education.school.name === searchTerm;
                        });
                    });

                    //add work matches not already fetched
                    _.each(facebookWorkMatches, function (data) {
                        var id = parseInt(data.id, 10),
                            index = _.indexOf(ids, id);
                        if (index === -1) {
                            queryResponse.push(data);
                            ids.push(id);
                        }
                    });

                    //add school matches not already fetched
                    _.each(facebookSchoolMatches, function (data) {
                        var id = parseInt(data.id, 10),
                            index = _.indexOf(ids, id);
                        if (index === -1) {
                            queryResponse.push(data);
                            ids.push(id);
                        }
                    });

                    var template = _.template(FacebookTemplate);
                    var html = template({result: queryResponse});
                    $('.facebook-results').html(html);
                }, 'json');

                //get linkedin query results
                var selectValue = $('#search select').val(),
                    params = {count: 25};
                params[selectValue] = searchTerm;

                IN.API.PeopleSearch()
                    .fields("firstName", "lastName", "positions", "educations", "location", "distance")
                    .params(params)
                    .result(function(result) {
                        var template = _.template(LinkedInTemplate);
                        var html = template({result: result.people.values});
                        $('.linkedin-results').html(html);
                    });
            }
        });
    }
);
