//globals
var data;
//var svgSize = {width:494, height:269, margin: 89};
var circleRad = 10;
var spacing = 3;

function loadPage(){
	loadData().then(
		function(onFuf, onRej){
			data = onFuf;
			//initial graphic draw
			var colorScale = d3.scale.linear().range(['#8FD68C', '#DDBE6F']).domain([0,data.length]);

			var svg = d3.select("svg#chart");

			svg.attr('width', window.innerWidth * 0.7);

			//create the circles
			svg.selectAll('circle.info').data(data).enter()
			.append('circle')
			.attr({
				r: circleRad,
				"title": function(d,i){return d.firstName + " " + d.lastName;},
				fill: function(d,i){return colorScale(i);},
				opacity: 0,
				'stroke':'#000'
			})
			.classed("info", true);

			drawChart('alpha');
		});
}

function loadData(){
	//we're going to need to handle the several-step process to get data in from the two
	//apis, then merge it together (See listMerge.js, and then go onto displaying it)
	var promise = new Promise(function (resolve, reject) {
		d3.json('all.json', function (err, res) {
			if (err) reject(err);
			else {resolve(res); } 
		});
	}); 
	return promise;
}

function toggleMode(mode){
	drawChart(mode);
}

//alpha, location, network, company
//location and network are used directly with the nest, wont work if changed
function drawChart(mode){
	var grpColumns; 
	var grpRows; 
	var grpData = [];

	var svg = d3.select("svg#chart");

	if (mode == 'alpha'){
		grpData[0] = {};
		grpData[0].key = 'all';
		grpData[0].values = data;
		grpColumns = 1;
		grpRows = 1;
	}
	else { // non alpha, more than one category
		grpData = d3.nest()
		.key(function(d) { return d[mode]; })
		.entries(data);

		grpData.sort(function(a,b){
			if (a.key < b.key) {return -1;}
			else if (a.key > b.key) {return 1;}
			else { return 0;}
		});

		grpColumns = grpData.length < 3 ? grpData.length : 3;
		grpRows = Math.ceil(grpData.length / grpColumns);		
	}

	svg.selectAll("rect.category").remove();
   
   //set category boxes first, then put them in the right place;
	var categories = svg.selectAll("rect.category").data(d3.range(grpData.length))
	.enter().append('rect').attr({
		width: (svg.attr("width")/grpColumns) - 2 ,
		height: function(d,i){
			var dataOfInterest = grpData[i].values;
			var width = svg.attr("width")/grpColumns;
			//mathmagical!
			var numAcrossFit = Math.floor((width - spacing) / ((circleRad*2) + spacing));
			var numHigh = Math.ceil(dataOfInterest.length / numAcrossFit);
			return Math.floor((spacing * 2) + (numHigh * ((circleRad * 2) + spacing)) - spacing);
		},
		"fill": "none",
		"stroke":"blue",
		"opacity":0,
		id: function(d,i){return "cat_id"+i;}
	}).classed("category",true);

	/*
		This is a best fix for a pretty tricky problem as far as I can figure.
		I don't want to put them under previous boxes because I don't want to mess up
		alphabetization, I did want to put them all at the max height of the row, but 
		that requires knowing the height of the previous rows, so I just put them all at
		whatever the tallest box was. This will look weird and should be fixed to something
		else in the long run
	*/
	var maxHeight = d3.max(categories[0], function(d){return d.height.baseVal.value;});

	categories.attr({
		x: function(d,i){return ((i % grpColumns) * (this.width.baseVal.value));},
		y: function(d,i){ return Math.floor(i/grpColumns) * maxHeight;},
		opacity: 1
	});

	svg.selectAll("text.categoryLbl").remove();

	if (mode !== 'alpha'){
		svg.selectAll("text.categoryLbl").data(grpData).enter()
		.append('text')
		.attr({
			x: function(d,i){return ((i % grpColumns) * (svg.attr("width")/grpColumns));},
			y: function(d,i){ return Math.floor(i/grpColumns) * maxHeight;},
			id: function(d,i){return "gID_" + i;}
		})
		.classed('categoryLbl', true)
		.text(function(d){return d.key;});
	}



	/*d3.selectAll("circle.info").attr({
		cx: function(d,i){return circleRad + ((i % columns) * ((svgSize.width-svgSize.margin)/columns));},
		cy: function(d,i){return circleRad + (Math.floor(i/columns) * ((svgSize.height-svgSize.margin)/columns));}		
	}).transition(500).attr("opacity", 1);*/


}