$(document).ready(
	function() {
		// Gets marks
		var marks = getMarks();

		// Gets course
		var course = getCourse();
		// If is one of the supported courses it calculates final grade
		if (course == "INGEGNERIA INFORMATICA") {
			// Add custom HTML
			var riepilogo = $(".riepilogo.asinistra");
			riepilogo.attr('colspan', 8);
			// Appends the new one
			riepilogo.parent().append('<td id="td-libretto" class="riepilogo asinistra" colspan="7"><strong>VOTO DI LAUREA</strong><div class="form-group"><label for="input-extra"><b>Punto extra:</b></label><label class="checkbox-inline"><input type="checkbox" id="isStage"> Stage</label><label class="checkbox-inline"><input type="checkbox" id="isErasmus"> Erasmus</label><br><label for="input-extra"><b>Prova finale:</b></label><label class="radio-inline"><input type="radio" name="final_test" id="prova_curricolare" checked> Prova curricolare</label><label class="radio-inline"><input type="radio" name="final_test" id="elaborato_individuale_aggiuntivo"> Elaborato individuale aggiuntivo</label></div><br><b>Media sui migliori 130 CFU: </b><p class="inline" id="best_average_mark"></p><br><b>Base: </b><p class="inline" id="base"></p><br><b>Punti extra curriculm: </b><p class="inline" id="extra_point_curriculum"></p><br><b>Punto lode/erasmus/stage: </b><p class="inline" id="point_honors_erasmus_stage"></p><br><b>Media ING-INF/04-05: </b><p class="inline" id="average_mark_ing_inf"></p><br><br><b>Punti prova finale: </b><p class="inline" id="point_final_test"></p><br><br><b>Voto finale: </b><p class="inline" id="final_grade"></p></td>');

			// Declare the final grade
			var finalGrade = 0;

			// Checks if he applied Erasmus
			var isErasmus = false;
			$("#isErasmus").change(function() {
				isErasmus = $(this).is(":checked");
				
				// Calculates final grade
				finalGrade = calculateFinalGradeIngInf(marks, isErasmus, isStage);
				updateFinalGrade(finalGrade, 7, isThesis);
			});

			// Cheks if he made a stage
			var isStage = false;
			$("#isStage").change(function() {
				isStage = $(this).is(":checked");

				// Calculates final grade
				finalGrade = calculateFinalGradeIngInf(marks, isErasmus, isStage);
				updateFinalGrade(finalGrade, 7, isThesis);
			});

			// Checks if he wants to make a thesis or not
			var isThesis = false;
			$("#prova_curricolare, #elaborato_individuale_aggiuntivo").change(function () {
				if ($("#prova_curricolare").is(":checked")) {
					isThesis = false;
				} else if ($("#elaborato_individuale_aggiuntivo").is(":checked")) {
					isThesis = true;
				}

				// Calculates final grade
				finalGrade = calculateFinalGradeIngInf(marks, isErasmus, isStage, isThesis);
				updateFinalGrade(finalGrade, 7, isThesis);
			});

			// Calculates final grade
			finalGrade = calculateFinalGradeIngInf(marks, isErasmus, isStage, isThesis);
			updateFinalGrade(finalGrade, 7, isThesis);
		} else if (course == "BENI CULTURALI" || course == "FILOSOFIA" || course == "LETTERE" || course == "LINGUE E LETTERATURE MODERNE" || course == "LINGUE NELLA SOCIETA' DELL'INFORMAZIONE" || course == "SCIENZE DELLA COMUNICAZIONE" || course == "SCIENZE DELL'EDUCAZIONE E DELLA FORMAZIONE" || course == "SCIENZE DEL TURISMO") { 
			// Add custom HTML
			var riepilogo = $(".riepilogo.asinistra");
			riepilogo.attr('colspan', 8);
			// Appends the new one
			riepilogo.parent().append('<td id="td-libretto" class="riepilogo asinistra" colspan="7"><strong>VOTO DI LAUREA</strong><br><b>Base: </b><p class="inline" id="base"></p><br><br><b>Punti prova finale: </b><p class="inline" id="point_final_test"></p><br><br><b>Voto finale: </b><p class="inline" id="final_grade"></p></td>');

			// Calculates base
			var base = calculateWeightedAverageMark(marks) * 110 / 30;
			
			// Updates view
			$("#base").text(Math.round(base));
			$("#point_final_test").text("?/5");
			
			// Calculates final grade
			updateFinalGrade(base, 5, true);
		} else {
			// Add custom HTML
			var riepilogo = $(".riepilogo.asinistra");
			riepilogo.attr('colspan', 8);
			// Appends the new one
			riepilogo.parent().append('<td id="td-libretto" class="riepilogo asinistra" colspan="7"><strong>VOTO DI LAUREA</strong><p>Mi dispiace ma il tuo corso ancora non è ancora disponibile, <br>inviami una <b><a id="email" class="link" href="mailto:pastorini.claudio@gmail.com">email</a></b> con le istruzioni oppure aiutami su <b><a id="github" class="link" href="https://github.com/pincopallino93/Libretto-Delphi">GitHub</a></b>.</p><br><p>Non esitare a contattarmi!</p></td>');	
			$(".link").attr('style','color:black !important');
		}

		// Adds graphs
		addGraphs(marks);

		// Center title..
		$("#titolo-area").css({ width: "100%" });

		// Sets LibrettoDelphi version
		var manifest = chrome.runtime.getManifest();
		var version = '<p>Versione LibrettoDelphi: ' + manifest.version + '</p>';
		$(version).appendTo(".versione");

	}
);

/**
 * Retrieves the name of the course that the user attends.
 * @return {string} the course's name
 */
function getCourse() {
	var summary = $(".riepilogo")[0].innerHTML;
	var string = "<b>Corso di Laurea</b>: ";
	return summary.substr(summary.search(string) + string.length, summary.length - 1).replace(/\s{2,}/g, '');
}

/**
 * Retrieves marks from the page.
 * @return {Mark[]} Array of marks.
 */
function getMarks() {
	var marks = [];

	// Gets the table of marks
	var table = $("#corpoPrincipale_contenuti_contenuto_corpo_001 table:nth-of-type(2) tbody");
	// For all rows (without headers and footer)
	table.find("tr").slice(2, -1).each(function () {
		// Gets all cols
		var cols = $(this).find("td");

		// If the number of the colomns is 11 we know what is to do
		if (cols.length == 11) {
			// Sets honors to false
			var honors = false;

			// Gets exam's name
			var rawName = ((cols[1]).innerHTML);
			var name = rawName.toString().substr(8, rawName.length);
			// Gets exam's values
			var value = (cols[6]).innerHTML;
			// Gets exam's ssd
			var ssd = (cols[2]).innerHTML;
			// Gets exam's credits
			var credits = parseInt((cols[5]).innerHTML);
			// Gets exam's date
			var rawDate = (cols[4]).innerHTML;
			var parts = rawDate.split("/");
			var date = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));

			if (value == "IDONEO" || value == "&nbsp;" || ssd == "---") {	// Not a valid exam
				return true;
			} else {
				value = value.split("/");
				if (value.length == 1) {	// 30 with honors
					value = 30;
					honors = true;
				} else {
					value = parseInt(value[0]);
				}
			}
			
			// Creates new Mark and pushs it into array			
			var mark = new Mark(name, value, credits, ssd, honors, date);
			marks.push(mark);
		}
	});

	return marks;
}

/**
 * Adds graphs to the page using marks.
 * @param  {Mark[]} marks Array of marks to graph.
 */
function addGraphs(marks) {
	var message = $("#msggenerico");
	message.after('<div id="graphs"><canvas id="radar_chart" class="chart" width="400" height="400"></canvas><canvas id="bar_chart" class="chart" width="400" height="400"></canvas><canvas id="line_chart" class="chart" width="400" height="400"></canvas></div>');

	var radarContext = $("#radar_chart")[0].getContext('2d');
	var barChartContext = $("#bar_chart")[0].getContext('2d');
	var lineChartContext = $("#line_chart")[0].getContext('2d');

	// Generates graphs
	generateRadarChart(radarContext, marks);
	generateBarChart(barChartContext, marks);
	generateLineChart(lineChartContext, marks);
}

/**
 * Generates radar chart that show averages of marks by SSD.
 * @param  {Context} context   Context of the canvas.
 * @param  {Mark[]} marks Array of marks to graph.
 */
function generateRadarChart(context, marks) {
	var labels = [];
	var data1 = [];
	var data2 = [];
	var counter = [];
	var credits = [];

	marks.forEach(function (mark) {
		var ssd = mark.ssd;
		var position = $.inArray(ssd, labels);
		if (position == -1) {
			position = labels.push(ssd) - 1;
		};

		var value1 = data1[position];
		var value2 = data2[position];
		var value3 = credits[position];
		var value4 = counter[position];

		data1[position] = (typeof value1 === 'undefined' ? 0 : value1) + mark.value;
		data2[position] = (typeof value2 === 'undefined' ? 0 : value2) + (mark.value * mark.credits);
		counter[position] = (typeof value4 === 'undefined' ? 0 : value4) + 1;
		credits[position] = (typeof value3 === 'undefined' ? 0 : value3) + mark.credits;
	});	

	for (var i = 0; i < labels.length; i++) {
		data1[i] = Math.round((data1[i] / counter[i]) * 100) / 100;
		data2[i] = Math.round((data2[i] / credits[i]) * 100) / 100;
	}
	
	var data = {
		labels: null,
		datasets: [
			{
				label: "Media aritmetica",
				fillColor: "rgba(45,124,95,0.2)",
				strokeColor: "rgba(45,124,95,1)",
				pointColor: "rgba(45,124,95,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(45,124,95,1)",
				data: null
			},
			{
				label: "Media ponderata",
				fillColor: "rgba(74,131,124,0.2)",
				strokeColor: "rgba(74,131,124,1)",
				pointColor: "rgba(74,131,124,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(74,131,124,1)",
				data: null
			}
		]
	};	

	data.labels = labels;
	data.datasets[0].data = data1;
	data.datasets[1].data = data2;

	var options = {
		//Boolean - Whether to show lines for each scale point
		scaleShowLine : true,

		//Boolean - Whether we show the angle lines out of the radar
		angleShowLineOut : true,

		//Boolean - Whether to show labels on the scale
		scaleShowLabels : false,

		// Boolean - Whether the scale should begin at zero
		scaleBeginAtZero : true,

		//String - Colour of the angle line
		angleLineColor : "rgba(0,0,0,.1)",

		//Number - Pixel width of the angle line
		angleLineWidth : 1,

		//String - Point label font declaration
		pointLabelFontFamily : "'Arial'",

		//String - Point label font weight
		pointLabelFontStyle : "normal",

		//Number - Point label font size in pixels
		pointLabelFontSize : 10,

		//String - Point label font colour
		//pointLabelFontColor : "#F9B22F",

		//Boolean - Whether to show a dot for each point
		pointDot : true,

		//Number - Radius of each point dot in pixels
		pointDotRadius : 3,

		//Number - Pixel width of point dot stroke
		pointDotStrokeWidth : 1,

		//Number - amount extra to add to the radius to cater for hit detection outside the drawn point
		pointHitDetectionRadius : 20,

		//Boolean - Whether to show a stroke for datasets
		datasetStroke : true,

		//Number - Pixel width of dataset stroke
		datasetStrokeWidth : 2,

		//Boolean - Whether to fill the dataset with a colour
		datasetFill : true,

		//String - A legend template
		legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
	}		

	var radarChart = new Chart(context).Radar(data, options);
}

/**
 * Generates bar chart that show number of marks by value.
 * @param  {Context} context   Context of the canvas.
 * @param  {Mark[]} marks Array of marks to graph.
 */
function generateBarChart(context, marks) {
	var data = {
		labels: [],
		datasets: [
			{
				label: "Voti",
				fillColor: "rgba(45,124,95,0.5)",
				strokeColor: "rgba(45,124,95,0.8)",
				highlightFill: "rgba(45,124,95,0.75)",
				highlightStroke: "rgba(45,124,95,1)",
				data: null
			}
		]
	};

	var n = 30;
	for (var i = 18; i <= n; i++) {
		data.labels.push(i);
	}

	var value = [];

	marks.forEach(function (mark) {
		value[mark.value - 18] = (typeof value[mark.value - 18] === 'undefined' ? 1 : value[mark.value - 18] + 1);
	});

	data.datasets[0].data = value;

	var options = {
		//Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
		scaleBeginAtZero : true,

		//Boolean - Whether grid lines are shown across the chart
		scaleShowGridLines : true,

		//String - Colour of the grid lines
		scaleGridLineColor : "rgba(0,0,0,0.05)",

		//Number - Width of the grid lines
		scaleGridLineWidth : 1,

		//Boolean - Whether to show horizontal lines (except X axis)
		scaleShowHorizontalLines: true,

		//Boolean - Whether to show vertical lines (except Y axis)
		scaleShowVerticalLines: true,

		//Boolean - If there is a stroke on each bar
		barShowStroke : true,

		//Number - Pixel width of the bar stroke
		barStrokeWidth : 2,

		// String - Scale label font colour
		//scaleFontColor: "#F9B22F",

		//Number - Spacing between each of the X value sets
		barValueSpacing : 5,

		//Number - Spacing between data sets within X values
		barDatasetSpacing : 1,

		//String - A legend template
		legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
	}

	var varChart = new Chart(context).Bar(data, options);
}

/**
 * Generates line chart that shows marks during history.
 * @param  {Context} context   Context of the canvas.
 * @param  {Mark[]} marks Array of marks to graph.
 */
function generateLineChart(context, marks) {
	var data = {
		labels: [],
		datasets: [
			{
				label: "Votazione",
				fillColor: "rgba(249,178,47,0.2)",
				strokeColor: "rgba(249,178,47,1)",
				pointColor: "rgba(249,178,47,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(249,178,47,1)",
				data: []
			},
			{
				label: "Media aritmetica",
				fillColor: "rgba(45,124,95,0.2)",
				strokeColor: "rgba(45,124,95,1)",
				pointColor: "rgba(45,124,95,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(45,124,95,1)",
				data: []
			}, 
			{
				label: "Media ponderata",
				fillColor: "rgba(74,131,124,0.2)",
				strokeColor: "rgba(74,131,124,1)",
				pointColor: "rgba(74,131,124,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(74,131,124,1)",
				data: []
			}
		]
	};

	var credits = 0;
	var weightedAverageSum = 0;
	var averageSum = 0;
	for (var i = 0; i < marks.length; i++) {
		var value = marks[i].value;
		var credit = marks[i].credits;

		data.labels.push(marks[i].name);
		
		weightedAverageSum =  weightedAverageSum + (value * credit);
		averageSum = averageSum + value;
		credits = credits + credit;

		data.datasets[0].data.push(value);
		data.datasets[1].data.push(Math.round((averageSum / (i + 1)) * 100) / 100);
		data.datasets[2].data.push(Math.round((weightedAverageSum / credits) * 100) / 100);
	}

	var options = {
		///Boolean - Whether grid lines are shown across the chart
		scaleShowGridLines : true,

		//String - Colour of the grid lines
		scaleGridLineColor : "rgba(0,0,0,.05)",

		//Number - Width of the grid lines
		scaleGridLineWidth : 1,

		//Boolean - Whether to show horizontal lines (except X axis)
		scaleShowHorizontalLines: true,

		//Boolean - Whether to show vertical lines (except Y axis)
		scaleShowVerticalLines: true,

		//Boolean - Whether the line is curved between points
		bezierCurve : false,

		//Number - Tension of the bezier curve between points
		bezierCurveTension : 0.4,

		//Boolean - Whether to show a dot for each point
		pointDot : true,

		//Number - Radius of each point dot in pixels
		pointDotRadius : 4,

		//Number - Pixel width of point dot stroke
		pointDotStrokeWidth : 1,

		//Number - amount extra to add to the radius to cater for hit detection outside the drawn point
		pointHitDetectionRadius : 20,

		//Boolean - Whether to show a stroke for datasets
		datasetStroke : true,

		//Number - Pixel width of dataset stroke
		datasetStrokeWidth : 2,

		//Boolean - Whether to fill the dataset with a colour
		datasetFill : true,

		//String - A legend template
		legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
	};

	var varChart = new Chart(context).Line(data, options);
}

/**
 * Updates weighted average mark into the page.
 * @param  {int} a the value to round and set into the page
 */
function updateWeightedAverageMark(a) {
	//console.log("a = " + a);
	$("#best_average_mark").text(Math.round(a * 100) / 100);
}

/**
 * Updates base final grade into the page.
 * @param  {int} m the value to round and set into the page
 */
function updateBase(m) {
	//console.log("m = " + m);
	$("#base").text(Math.round(m));
}

/**
 * Updates extra point average mark into the page.
 * @param  {int} c the value to round and set into the page
 */
function updateExtraPointAverageMark(c) {
	//console.log("c = " + c);
	$("#extra_point_curriculum").text(c + "/3");
}

/**
 * Updates weighted average mark into the page.
 * @param  {int} a the value to round and set into the page
 */
function updateExtraPointCurriculum(l) {
	//console.log("l = " + l);
	$("#point_honors_erasmus_stage").text(l + "/1");
}

/**
 * Updates final test mark into the page.
 * @param  {int} f the value of final test (if it will not do thesis, so when the isThesis is false), otherwhise nothing
 * @param {boolean} isThesis if it is true the points for final try it is not predictable and so it sets nothing, otherwise it sets f.
 */
function updateFinalTest(f, isThesis) {
	//console.log("f = " + f);
	if (isThesis) {
		$("#point_final_test").text("?/7");
	} else {
		$("#point_final_test").text(f + "/7");
	}
}

/**
 * Updates weighted average mark of exam with ssd equal to ING-INF/04 or ING-INF/05 into the page.
 * @param  {int} i the value to round and set into the page
 */
function updateWeightedAverageMarkIngInf(i) {
	//console.log("i = " + i);
	$("#average_mark_ing_inf").text(Math.round(i * 100) / 100);
}

/**
 * Updates final grade into the page.
 * @param {int} finalGrade the final grade
 * @param {int} maxPoints the max points to add 
 * @param {boolean} isThesis if it is true the final grade is not predictable and so it prints a range of grades, otherwise it sets the exact grade.
 */
function updateFinalGrade(finalGrade, maxPoints, isThesis) {
	//console.log("UPDATE: " + finalGrade);
	if (isThesis) {
		$("#final_grade").text("Da " + Math.round(finalGrade) + " a " + (Math.round(finalGrade) + maxPoints));
	} else {
		$("#final_grade").text(Math.round(finalGrade));
	}
}

/**
 * Mark class that rapresents a mark.
 * @param {string} name name
 * @param {integer} value vote
 * @param {integer} credits number of credits
 * @param {string} ssd kind of exam
 * @param {boolean} honors is with honors or not
 * @param {long} date exam verbalization's date
 */
function Mark(name, value, credits, ssd, honors, date) {
	this.name = name;
	this.value = value;
	this.credits = credits;
	this.honors = (value == 30 && honors);
	this.ssd = ssd;
	this.date = date;

	this.isInfOrAut = function () {
		return this.ssd == "ING-INF/04" || this.ssd == "ING-INF/05";
	}
}

/**
 * Calculates the final grade for the course of Engineering in Computer Science.
 * @param  {Mark[]}  marks     array of marks
 * @param  {boolean} isErasmus true if he did one or more semesters with Erasmus program, false otherwise
 * @param  {boolean} isStage   true if he did a stage, false otherwise
 * @return {int} final grade
 */
function calculateFinalGradeIngInf(marks, isErasmus, isStage, isThesis) {
	var newMarks = marks.slice(0);
	newMarks.sort(function(a, b) { return b.value - a.value });

	var averageSum = 0;
	var credits = 0;
	var i = 0;
	while (i < newMarks.length && credits < 130) {
		var mark = newMarks[i];
		var credit = mark.credits;
		
		//console.log(mark);

		if (credit <= 130 - credits) {
			averageSum = averageSum + (mark.value * credit);
			credits = credits + credit;
		} else {
			averageSum = averageSum + (mark.value * (130 - credits));
			credits = credits + 130 - credits;
		}
		
		i = i + 1;
		//console.log("credits=" + credits + " i=" + i);
	};

	// Average mark on best 130 CFU
	var a = averageSum / credits;
	updateWeightedAverageMark(a);
	
	// Base
	var m = a / 30 * 110;
	updateBase(m);
	
	// Extra point
	var c = Math.floor(calculateExtraPointAverageMark(m));
	updateExtraPointAverageMark(c);
	
	// Points from average mark
	var l = calculateExtraPointCurriculum(marks, isErasmus, isStage);
	updateExtraPointCurriculum(l);
	
	var f = 0;
	if (!isThesis) {
		// Average mark of ING-INF/04 ING-INF/05 marks (until April 2018 remove from that worst 9 CFU)
		var date = new Date();
		var month = date.getMonth();
		var year = date.getFullYear();
		
		var credits = 0;
		if (year <= 2018) {
			if (month <= 3) {
				credits = 9;
			}
		} 
		//console.log("credits to remove: " + credits); 

		var i = calculateWeightedAverageMark(removeWorstMarks(marks.filter(function(mark) { if (mark.isInfOrAut()) return mark;}), credits));
		updateWeightedAverageMarkIngInf(i);

		f = Math.floor(calculateFinalTest(i));
	}
	updateFinalTest(f, isThesis);

	return m + c + l + f;
}

/**
 * Removes worst marks.
 * @param  {Mark[]} marks array of marks
 * @param  {int} credits credits to remove
 * @return {Mark[]} array of marks without worst ones
 */
function removeWorstMarks(marks, credits) {

	var newMarks = marks.slice(0);
	newMarks.sort(function(a, b) { return a.value - b.value});
	//console.log(newMarks);

	for (var i = 0; i < newMarks.length; i++) {
		if (newMarks[i].credits == 9) {
			//console.log(newMarks[i]);
			newMarks.splice(i, 1);
			break;
		}
	}
	//console.log(newMarks);

	return newMarks;
}

/**
 * Calculates the extra points from the weighted average mark from the best 130 CFU.
 * @param  {float} m weighted average mark of best 130 CFU
 * @return {float} points
 */
function calculateExtraPointAverageMark(m) {
	return (3 * m) / 99;
}

/**
 * Return one point if he had almost one honors, if he did one or more semesters with Erasmus program or if he did a stage.
 * @param  {Mark[]}  marks     [description]
 * @param  {boolean} isErasmus [description]
 * @param  {boolean} isStage   [description]
 * @return {int} the extra point 
 */
function calculateExtraPointCurriculum(marks, isErasmus, isStage) {
	extra_point = 0;

	if (isErasmus) {
		extra_point = 1;
	} else if (isStage) {
		extra_point = 1;
	} else {
		for (var i = marks.length - 1; i >= 0; i--) {
			if (marks[i].honors) {
				extra_point = 1;
				break;
			}	
		}
	}

	return extra_point;
}

/**
 * Calculates the weighted average mark from an array of marks.
 * @param  {Mark[]} marks the array of marks
 * @return {float} the weighted average mark
 */
function calculateWeightedAverageMark(marks) {
	var numerator = 0;
	var denominator = 0;

	$.each(marks, function(index, value) {
		numerator += value.value * value.credits;
		denominator += value.credits;
	});

	return numerator / denominator;
}

/**
 * Calculates final test points from the average mark of ING-INF/04 and ING-INF/05.
 * @param  {float} i the average mark of ING-INF/04 and ING-INF/05
 * @return {int}   points 
 */
function calculateFinalTest(i) {
	return (7 * i) / 27;
}