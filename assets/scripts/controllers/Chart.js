define(
	[
		'd3'
	], function(
		d3
	) {
		"use strict";

		var Chart = function() {};

		Chart.prototype = {
			init: function(data) {
			    this.data = data;
			    this.visWidth = 960;
			    this.visHeight = 600;

			    // locations the nodes will move towards
			    // depending on which view is currently being
			    // used
			    this.center = {
			    	x: this.width / 2,
			    	y: this.height / 2
			    };

			    this.networkCenters = {
			      '2008': {x: this.width / 3, y: this.height / 2},
			      '2009': {x: this.width / 2, y: this.height / 2},
			      '2010': {x: 2 * this.width / 3, y: this.height / 2}
			    }

			    // used when setting up force and
			    // moving around nodes
			    this.layoutGravity = -0.01;
			    this.damper = 0.1;

			    // these will be set in create_nodes and create_vis
			    this.vis = null;
			    this.nodes = [];
			    this.force = null;
			    this.circles = null;

			    // nice looking colors - no reason to buck the trend
			    this.fillColor = d3.scale.ordinal()
			      .domain(['low', 'medium', 'high'])
			      .range(['#d84b2a', '#beccae', '#7aa25c'])
			      ;

			    // use the max total_amount in the data as the max in the scale's domain
			    var maxAmount = d3.max(this.data, function(d) {
			    	return parseInt(d.friends);
		    	});

			    // this.radiusScale = d3.scale
			    // 	.pow()
			    // 	.exponent(0.5)
			    // 	.domain([0, maxAmount])
			    // 	.range([2, 85])
			    // 	;

			    this.radiusScale = d3.scale
			    	.pow()
			    	.exponent(0.5)
			    	;

			    this.createNodes();
			    this.createVis();
			    this.start();
			    this.displayGroupAll();
			},

			createNodes: function() {
				var i = 0;
				var data = this.data;
				var l = data.length;
				for (; i < l; i++) {
					var node = {
						id: data[i].id,
						name: data[i].name,
						friends: data[i].friends,
						network: data[i].network,
						location: data[i].location,
						radius: this.radiusScale(data[i].friends),
						x: Math.random() * 900,
						y: Math.random() * 800
					}

					this.nodes.push(node);
				}

				// this.nodes.sort(function(a, b) {
				// 	return b.value - a.value;
				// });
			},

			createVis: function() {
				var self = this;

				this.vis = d3
					.select('.content-main')
					.append('svg')
					.attr({
						'width': this.visWidth,
						'height': this.visHeight,
						'class': 'chart-frame',
						'id': 'js-chart-frame'
					})
					;

				this.circles = this.vis
					.selectAll('circle')
					.data(this.nodes, function(d) {
						return d.id
					})
					;

				this.circles
					.enter()
					.append('circle')
					.attr({
						'r': '0',
						'stroke-width': '2'
					})
					.attr('fill', function(d) {
						return self.fillColor(d.network);
					})
					.attr('storke', function(d) {
						return d3.rgb(self.fillColor(d.network)).darker();
					})
					.attr('id', function(d) {
						return 'bubble-#' + d.id;
					})
					;

				// Fancy transition to make bubbles appear, ending with the
			 	// correct radius
			    this.circles
			    	.transition()
			    	.duration(2000)
			    	.attr('r', function(d) {
			    		return d.radius;
			    	})
			    	;

				window.asdf = self.circles;

			},

			// Charge function that is called for each node.
			// Charge is proportional to the diameter of the
			// circle (which is stored in the radius attribute
			// of the circle's associated data.
			// This is done to allow for accurate collision
			// detection with nodes of different sizes.
			// Charge is negative because we want nodes to
			// repel.
			// Dividing by 8 scales down the charge to be
			// appropriate for the visualization dimensions.
			charge: function(d) {

				console.log('charge called');

				return 1;
				return -Math.pow(d.radius, 2.0) / 8;
			},

			// Starts up the force layout with
			// the default values
			start: function() {
				console.log('chart start called');
				this.force = d3.layout
					.force()
					.nodes(this.nodes)
					.size(this.visWidth, this.visHeight)
					;
			},

			// Sets up force layout to display
			// all nodes in one circle.
			displayGroupAll: function() {				
				var self = this;

				// this.force
					// .gravity(this.layoutGravity)
					// .charge(this.charge)
					// .friction(0.9)


				console.log('1 - ' + self.circles[0][0].__data__.x);



				// this.force
				// 	.on('tick', function(evt) {

				// 		console.log('4 - ' + self.circles[0][0].__data__.x);


				// 		self.circles
				// 			.each(function(d) {
				// 				self.moveTowardCenter(evt.alpha);
				// 			})
				// 			;

				// 		self.circles
				// 			.attr('cx', function(d) {
				// 				return d.coordx;
				// 			})
				// 			.attr('cy', function(d) {
				// 				return d.coordy;
				// 			})
				// 			;
				// 	})
				// 	;

				console.log('2 - ' + self.circles[0][0].__data__.x);

				console.log('force start called');
				this.force.start();				

				console.log('3 - ' + self.circles[0][0].__data__.x);

			},

			// Moves all circles towards the @center
			// of the visualization
			moveTowardCenter: function(alpha) {
				var self = this;

				return function(d) {
					d.x = d.x + (self.center.x - d.x) * (self.damper + 0.02) * alpha;
					d.y = d.y + (self.center.y - d.y) * (self.damper + 0.02) * alpha;
				};
			},

			// sets the display of bubbles to be separated
			// into each year. Does this by calling move_towards_year
			displayByNetwork: function() {
				var self = this;

				this.force
					.gravity(this.layoutGravity)
					.charge(this.charge)
					.friction(0.9)
					.on('tick', function(evt) {
						self.circles.each(self.moveTowardsNetwork(e.alpha))
						.attr('cx', function(d) {
							return d.x;
						})
						.attr('cy', function(d) {
							return d.y;
						})
					})
					;

				this.force.start();
			},

			// move all circles to their associated @year_centers
			moveTowardsNetwork: function(alpha) {
				var self = this;

				return function(d) {
					var target = self.networkCenters[d.network];
					d.x = d.x + (target.x - d.x) * (self.damper + 0.02) * alpha * 1.1;
					d.y = d.y + (target.y - d.y) * (self.damper + 0.02) * alpha * 1.1;
				}
			}
		};

		return Chart;
	}
);