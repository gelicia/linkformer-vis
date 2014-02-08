/**
 * initialize the require.js configuration options
 */
require.config(config);

require(
	[
		'jquery',
		'controllers/Chart',
		'../data/data'
	], function(
		$,
		Chart,
		data
	) {
		"use strict";

		$(document).ready(function() {
			var networkChart = new Chart();
			networkChart.init(friendData);			
		});
	}
);