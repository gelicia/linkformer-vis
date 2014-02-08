//globals
var data;
var svgSize = {width:494, height:269, margin: 89};
var circleRad = 10;

function loadPage(){
	loadData().then(
		function(onFuf, onRej){
			data = onFuf;
			//initial graphic draw
			var colorScale = d3.scale.linear().range(['#8FD68C', '#DDBE6F']).domain([0,data.length]);

			var svg = d3.select("svg#chart");
			var columns = Math.ceil(Math.sqrt(data.length));
			var rows = Math.ceil(data.length / columns);

			svg.selectAll('circle.info').data(data).enter()
			.append('circle')
			.attr({
				cx: function(d,i){return circleRad + ((i % columns) * ((svgSize.width-svgSize.margin)/columns));},
				cy: function(d,i){return circleRad + (Math.floor(i/columns) * ((svgSize.height-svgSize.margin)/columns));},
				r: circleRad,
				"title": function(d,i){return d.firstName + " " + d.lastName;},
				fill: function(d,i){return colorScale(i);},
				'stroke':'#000'
			})
			.classed("info", true);

			drawChart('alpha');
		});//.then(function(){console.log("done!");});
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

function drawChart(mode){

}