//globals
var data;
//var svgSize = {width:494, height:269, margin: 89};
var circleRad = 10;
var spacing = 3;

function loadPage(){
	loadData().then(
		function(onFuf, onRej){
			data = sortData(onFuf, 'alpha');
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
		d3.json('fbreal.json', function (err, res) {
			if (err) reject(err);
			else {
				d3.json('lireal.json', function (err2, res2) {
					if (err2) reject(err2);
					else {
						var masterList = mergeJson([res, res2]);
						resolve(masterList);
					}
				});
			}
		});
	});
	return promise;
}

function mergeJson(jsonData){
	var masterList = [];
	var data1 = jsonData[0];//facebook data stream
	var data2 = jsonData[1];//linkedin data stream


	data1.data.map(
	function(d){
		var obj = {};
		obj.firstName = d.first_name;
		obj.lastName = d.last_name;
		obj.location = d.current_location!==undefined? d.current_location.name : d.location !== undefined ? d.location.name : 'None';
		obj.network = 'facebook';

		if(d.work !== undefined && d.work.length > 0){
			obj.work = [];
			d.work.map(function(dw){
				obj.work.push(dw.employer.name);
			});
		}

		if(d.education!==undefined && d.education.length > 0){
			obj.school = [];
			d.education.map(function(dw){
				obj.school.push(dw.school.name);
			});
		}

		masterList.push(obj);
	});

	data2.people.values.map(
	function(d){
		var obj = {};
		obj.firstName = d.firstName;
		obj.lastName = d.lastName;
		obj.location = d.location !== undefined? d.location.name : 'None';
		obj.distance = d.distance;
		obj.network = 'linkedin';

		if(d.positions !== undefined && d.positions.values !== undefined && d.positions.values.length > 0){
			obj.work = [];
			d.positions.values.map(function(dw){
				obj.work.push(dw.company.name);
			});
		}

		masterList.push(obj);
	});

	return masterList;
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

		grpData[0].values = sortData(grpData[0].values, mode);
	}
	else { // non alpha, more than one category
		grpData = d3.nest()
		.key(function(d) { return d[mode]; })
		.entries(data);

		grpData = sortData(grpData, mode);

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
	svg.attr("height", maxHeight * grpRows);

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

	for (var i = 0; i < grpData.length; i++) {
		var width = svg.attr("width")/grpColumns;
		var numAcrossFit = Math.floor((width - spacing) / ((circleRad*2) + spacing));
		var sideMargin = grpData[i].values.length > numAcrossFit ?
			//this is not quite right
			((width-((numAcrossFit * ((circleRad*2) + spacing))))/2) + (spacing * 2 )
			: (width-((grpData[i].values.length * ((circleRad*2) + spacing))+spacing))/2;

		d3.selectAll("circle.info").filter(function(d, i2){
			return mode=='alpha'? true : d[mode] == grpData[i].key;
		}).attr("opacity", 1)
		.transition().duration(1000).attr({
			cx: function(d,i2){
				return ((i%grpColumns)* width) + sideMargin + (Math.floor(i2%numAcrossFit) * ((circleRad*2) + spacing)); },
			cy: function(d,i2){
				return (circleRad + spacing) + ((Math.floor(i/grpColumns)) * (maxHeight)) + ((Math.floor(i2/numAcrossFit)) * ((circleRad*2) + spacing));
			}
		});
	}
}

function sortData(dataIn, mode){
	var outData;
	if (mode == 'alpha'){
		outData =dataIn.sort(function(a,b){
			if (a.lastName < b.lastName) {return -1;}
			else if (a.lastName > b.lastName) {return 1;}
			else {
				if (a.firstName < b.firstName) {return -1;}
				else if (a.firstName > b.firstName) {return 1;}
				else { return 0;}
			}
		});
	}
	else if (mode == 'location' || mode == 'network'){
		outData = dataIn.sort(function(a,b){
			if (a.key < b.key) {return -1;}
			else if (a.key > b.key) {return 1;}
			else { return 0;}
		});
	}
	else if (mode == 'company'){

	}

	return outData;
}
