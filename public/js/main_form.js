
$(document).ready(function () {
  $('div.bhoechie-tab-menu>div.list-group>a').click(function (e) {
    e.preventDefault()
    $(this).siblings('a.active').removeClass('active')
    $(this).addClass('active')
    var index = $(this).index()
    $('div.bhoechie-tab>div.bhoechie-tab-content').removeClass('active')
    $('div.bhoechie-tab>div.bhoechie-tab-content').eq(index).addClass('active')
  })

  $('.datatable').dataTable({
    'sPaginationType': 'bs_four_button'
  })
  $('.datatable').each(function () {
    var datatable = $(this)
    // SEARCH - Add the placeholder for Search and Turn this into in-line form control
    var search_input = datatable.closest('.dataTables_wrapper').find('div[id$=_filter] input')
    search_input.attr('placeholder', 'Search')
    search_input.addClass('form-control input-sm')
    // LENGTH - Inline-Form control
    var length_sel = datatable.closest('.dataTables_wrapper').find('div[id$=_length] select')
    length_sel.addClass('form-control input-sm')
  })

  var data = [4, 8, 15, 16, 23, 42];
  d3.select(".chart")
  .selectAll("div")
    .data(data)
  .enter().append("div")
    .style("width", function(d) { return d * 10 + "px"; })
    .text(function(d) { return d; });


  var i = 1
  var truckOptions = []
  var srcOptions = []
  var destOptions = []

  var foo = $(this).on('focus', '[name="location"]', function () {
    var options = {
      types: ['(cities)'],
      componentRestrictions: { country: 'in' }
    }
    var id = document.activeElement.id
    var input = document.getElementById(id)
    var autocomplete = new google.maps.places.Autocomplete(input, options)
  })
  google.maps.event.addDomListener(window, 'click', foo)

  $('.addBtn').on('click', function () {
    $table = $(this).closest('.table')
    $table.find('tr:last').clone().find('input').each(function () {
      $(this).val('').attr('id', function (_, id) { return id + i })
    }).end().appendTo($table)
    i++
  })

  $(document.body).on('click', '.addBtnRemove', function () {
    var rows = $(this).closest('tbody').find('tr').length
    if (rows < 2) return
    $(this).closest('tr').remove()
  })

  $('#submit').click(post_submit)

  $('#next_page_0').click(function () {
    truckOptions = []
    $(this).closest('div').find('[id^=truckType]').each(function () {
      if ($(this).val()) truckOptions.push($(this).val())
    })
    $(this).closest('div').next().find('ul').html(getHTMLFromOptions(getUniqueOptions(truckOptions)))
  })

  $('#next_page_1').click(function () {
    srcOptions = []
    $(this).closest('div').find('[id^=sourceCity]').each(function () {
      if ($(this).val()) srcOptions.push($(this).val())
    })
    $(this).closest('div').next().find('ul').html(getHTMLFromOptions(getUniqueOptions(srcOptions)))
  })

  $('#next_page_3').click(function () {
    destOptions = []
    $(this).closest('div').find('[id^=destinationCity]').each(function () {
      if ($(this).val()) destOptions.push($(this).val())
    })
    var uList = $(this).closest('div').next().find('ul')
    $(uList).eq(0).html(getHTMLFromOptions(getUniqueOptions(srcOptions)))
    $(uList).eq(1).html(getHTMLFromOptions(getUniqueOptions(destOptions)))
    $(uList).eq(2).html(getHTMLFromOptions(getUniqueOptions(truckOptions)))

    var $row = $(this).closest('div').next().find('tbody tr')
    $(document.body).find('#depotInfo tbody tr').each(function () {
      var that = this
      destOptions.forEach(function (dest) {
        var $clone = $row.clone(true)
        $clone.find('.btn-select-input').eq(0).val($(that).find('td input').eq(0).val())
        $clone.find('.btn-select-value').eq(0).html($(that).find('td input').eq(0).val())
        $clone.find('.btn-select-input').eq(1).val(dest)
        $clone.find('.btn-select-value').eq(1).html(dest)
        $clone.find('.btn-select-input').eq(2).val($(that).find('td input').eq(1).val())
        $clone.find('.btn-select-value').eq(2).html($(that).find('td input').eq(1).val())
        $row.before($clone)
      })
    })
  })

  function getHTMLFromOptions (options) {
    var html = ''
    options.sort()
    options.forEach(function (option) {
      html += '<li value="' + option + '">' + option + '</li>'
    })
    return html
  }

  function getUniqueOptions (options) {
    var opts = options.filter(function (item, i, options) {
      return options.indexOf(item) === i
    })
    return opts
  }

  $('.pull-right').click(function () {
    $(document.body).find('.timeline__step').not('.done').first().addClass('done')
    $(this).closest('div').toggle()
    $(this).closest('div').next().toggle()
  })

  $('.pull-left').click(function () {
    $(document.body).find('.timeline__step.done').last().removeClass('done')
    $(this).closest('div').toggle()
    $(this).closest('div').prev().toggle()
  })
})

function prepareDistanceMatrix (origins, destinations, callback) {
  var service = new google.maps.DistanceMatrixService
  var options = {
    origins: origins,
    destinations: destinations,
    travelMode: 'DRIVING',
    unitSystem: google.maps.UnitSystem.METRIC,
    avoidHighways: false,
    avoidTolls: false
  }
  service.getDistanceMatrix(options, function (response, status) {
    if (status !== 'OK') {
      return callback(new Error('Error was: ' + status))
    } else {
      var originList = response.originAddresses
      var destinationList = response.destinationAddresses
      var distanceMatrix = []

      for (var i = 0; i < originList.length; i++) {
        var results = response.rows[i].elements
        for (var j = 0; j < results.length; j++) {
          distanceMatrix.push({source: originList[i], destination: destinationList[j], distance: results[j].distance.text})
        }
      }
      return callback(null, distanceMatrix)
    }
  })
}

var resultarray = [];
var qdata =[];
resultarray.push({source:"Delhi",
  destination : "Jaipur",
  distance:250,
  channeltype:"A",
  channelname:"B",
  trucktype:"C",
  truckid:1234,
  truckcapacity:1236,
  totalfreight:18000,
  pertonfreight:2.6});
function getSourceAndDestinationList () {
  var obj = {
    srcCityInfo: [],
    destCityInfo: []
  }

  
  getTableValues(obj.srcCityInfo, 'srcCityInfo', ['city', 'volume'])
  getTableValues(obj.destCityInfo, 'destCityInfo', ['city', 'volume'])
  var source = obj.srcCityInfo.map(function (cityInfo) {
    return cityInfo.city
  })
  var destination = obj.destCityInfo.map(function (cityInfo) {
    return cityInfo.city
  })
  prepareDistanceMatrix(source, destination, function (err, result) {
    if (err) {
      alert(JSON.stringify(err))
      return
    }
    var $table = $(document.body).find('.datatable tbody')
    var html = ''

  var trucktype = ['22ft', '32ft', '19ft','14ft','17ft'];
  var channeltype = ['Marketplace','Reverse Auction','Manual'];
  var channels = [
    ['Marketplace','M1','M2','M3','M4','M5'],
  ['Transporter','T1','T2','T3','T4','T5'],
['TruckOwner','O1','O2','O3','O4','O5']];

var truckid = [2744,8295,2790,4062,1095,9549,8813,0464,5499,4386,4757,6711,5155,6000,6397,9264,
  3907,5611,8081,1531,9413,3626,0662,2475,6649,8685,1340,9575,7293,1554,3314,9397,6910,6841,9101,458,
  5583,3037,2387,2195,6129,6818,0362,9290,5349,479,9194,2893,0250,8543,8975,0763,3113,5570,9915,2193,
  1694,9991,8322,0944,6040,0827,1921,2112,8077,6533,6430,8608,3944,6687,8241,6536,5513,4008,1313,9953,
  5756,2379,5724,2092,3778,4036,8978,5571,3537,1488,2572,4421,1734,0801,3144,7992,8988,6067,0919,6807,4637,
  7031,2569,7217,0726,5939,2464,4689,0826,3651,6278,5461
];
var trucktypeandcapacity = [
    ['22ft', 15000],
    ['32ft', 15000],
    ['19ft', 7500],
    ['14ft',3000],
    ['17ft',4500]
  ];
  var truckcapacity = { '22ft' : {capacity: 15000 }, '32ft' : { capacity: 15000 },'19ft' : { capacity: 7500 },'14ft' : { capacity: 3000 },'17ft' : { capacity: 4500 } };
  var ctr = 0;
  for (i=0;i<10;i++){
  result.forEach(function (distanceInfo) {
    var chtype = getRandomInt(0,2)
    var chname = getRandomInt(1,5)
    var ttype = getRandomInt(0,4)
    var tid = getRandomInt(0,107)
    /**http://sblf.sustainabilityoutlook.in/file_space/SBLF%20Summit%20Presentations%202014/Sustainable%20freight%20transport_Sustainability%20Outlook.pdf */
    var frtx = (Math.random() * (2.967 - 2.193) + 2.193).toFixed(3)
    resultarray.push({
      source:distanceInfo.source,
      destination:distanceInfo.destination,
      distance:distanceInfo.distance,
      channeltype:channels[chtype][0],
      channelname:channels[chtype][chname],
      trucktype:trucktypeandcapacity[ttype][0],
      truckid:truckid[tid],
      truckcapacity:trucktypeandcapacity[ttype][1],
      totalfreight:Math.floor(distanceInfo.distance.replace("km","").replace(",","")*frtx*trucktypeandcapacity[ttype][1]/1000),
      pertonfreight:frtx,
      key1:distanceInfo.source + "-" + distanceInfo.destination
    });
    qdata.push(distanceInfo.source + "-" + distanceInfo.destination
    )
      html += '<tr><td>' + distanceInfo.source  + '</td><td>' + distanceInfo.destination + '</td><td class="center">' 
      + distanceInfo.distance + '</td><td>' + channels[chtype][0] + '</td><td>'+channels[chtype][chname] + '</td><td>' 
      +trucktypeandcapacity[ttype][0] + '</td><td>' +truckid[tid] + '</td><td>' +
      trucktypeandcapacity[ttype][1] + '</td><td>' + Math.floor(distanceInfo.distance.replace("km","").replace(",","")*frtx*trucktypeandcapacity[ttype][1]/1000) + '</td></tr>'
    })}
    $table.html(html)
  })
}


/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function post_submit () {
  var obj = {
    truckInfo: [],
    depotInfo: [],
    srcCityInfo: [],
    destCityInfo: [],
    fareInfo: []
  }

  getTableValues(obj.truckInfo, 'truckInfo', ['truckType', 'capacity'])
  getTableValues(obj.depotInfo, 'depotInfo', ['city', 'truckType', 'trucks'])
  getTableValues(obj.srcCityInfo, 'srcCityInfo', ['city', 'volume'])
  getTableValues(obj.destCityInfo, 'destCityInfo', ['city', 'volume'])
  getTableValues(obj.fareInfo, 'fareInfo', ['source', 'destination', 'truckType', 'fare'])
  $.ajax({
    url: 'http://localhost:3000/process',
    data: JSON.stringify(obj),
    type: 'POST',
    success: dataHandler,
    error: errorHandler
  })
}

function getTableValues (array, tableName, columns) {
  $('#' + tableName + ' tbody tr').each(function (i) {
    var obj = {}
    $(this).find('td input').each(function (j) {
      obj[columns[j]] = $(this).val()
    })
    array.push(obj)
  })
}

function dataHandler (data, status) {
  data = JSON.parse(data)
  console.log(data)
}

function errorHandler (xhr, status, error) {
  console.log('Error: ' + error.message)
}

function populatechart (){

var margin = {top: 30, right: 50, bottom: 70, left: 50},
width = 800 - margin.left - margin.right,
height = 400 - margin.top - margin.bottom;
//console.log(resultarray["channeltype"])
//var arr = Object.values(resultarray.channeltype)

var chcounts=[];

for (var i = 0; i < resultarray.length; i++) {
  var chfind=chcounts.find(o => o.name === resultarray[i].channeltype);
  //console.log(chfind)
  if(typeof(chfind)=="undefined"){
  chcounts.push({name:resultarray[i].channeltype,value:1})
  }else{
  chfind.value=chfind.value+1
  }
  }

var x = d3.scale.ordinal()
  .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
  .range([height, 0]);

var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom");

var yAxis = d3.svg.axis()
  .scale(y)
  .orient("left");

d3.select("#chart2").select("svg").remove();

var svg = d3.select("#chart2").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// The following code was contained in the callback function.
x.domain(chcounts.map(function(d) { return d.name; }));
y.domain([0, d3.max(chcounts, function(d) { return d.value; })]);

svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis);

svg.append("g")
  .attr("class", "y axis")
  .call(yAxis)
.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", ".71em")
  .style("text-anchor", "end")
  .text("Frequency");

svg.selectAll(".bar")
  .data(chcounts)
.enter().append("rect")
  .attr("class", "bar")
  .attr("x", function(d) { return x(d.name); })
  .attr("width", x.rangeBand())
  .attr("y", function(d) { return y(d.value); })
  .attr("height", function(d) { return height - y(d.value); })

  function type(d) {
    d.value = +d.value;
    return d;
  }
}

function populatechart3 (){
  
  var margin = {top: 30, right: 50, bottom: 70, left: 50},
  width = 800 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;
  //console.log(resultarray["channeltype"])
  //var arr = Object.values(resultarray.channeltype)
  
  var chcounts=[];
  
  for (var i = 0; i < resultarray.length; i++) {
    var chfind=chcounts.find(o => o.name === resultarray[i].trucktype);
    //console.log(chfind)
    if(typeof(chfind)=="undefined"){
    chcounts.push({name:resultarray[i].trucktype,value:1})
    }else{
    chfind.value=chfind.value+1
    }
    }
  
  var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);
  
  var y = d3.scale.linear()
    .range([height, 0]);
  
  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");
  
  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");
  
  d3.select("#chart3").select("svg").remove();
  
  var svg = d3.select("#chart3").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  
  // The following code was contained in the callback function.
  x.domain(chcounts.map(function(d) { return d.name; }));
  y.domain([0, d3.max(chcounts, function(d) { return d.value; })]);
  
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
  
  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
  .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Frequency");
  
  svg.selectAll(".bar")
    .data(chcounts)
  .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return x(d.name); })
    .attr("width", x.rangeBand())
    .attr("y", function(d) { return y(d.value); })
    .attr("height", function(d) { return height - y(d.value); })
  
    function type(d) {
      d.value = +d.value;
      return d;
    }
  }
  
function populateBoxplot (){
var labels = true; // show the text labels beside individual boxplots?

var margin = {top: 30, right: 50, bottom: 70, left: 50};
var  width = 800 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;


var min = Infinity,
    max = -Infinity;
	
// parse in the data	
//d3.csv("data.csv", function(error, csv) {
	// using an array of arrays with
	// data[n][2] 
	// where n = number of columns in the csv file 
	// data[i][0] = name of the ith column
	// data[i][1] = array of values of ith column
 qfdata= findunique(qdata)
  console.log(qfdata)
  var data = [];
  for (i=0;i<qfdata.length;i++) {
    var tkey=qfdata[i];
    console.log(tkey)
    data [i]=[];
    data[i][0]=tkey.substring(0,tkey.indexOf(",")) + tkey.substring(tkey.indexOf("-"),tkey.indexOf(",",tkey.indexOf("-")));
    data[i][1]=[];
    for(k=0;k<resultarray.length;k++){
      if(resultarray[k].key1==tkey){
        data[i][1].push(resultarray[k].pertonfreight);
        if (resultarray[k].pertonfreight>max){
          max=resultarray[k].pertonfreight
        }
        if(resultarray[k].pertonfreight<min){
          min=resultarray[k].pertonfreight
        }
      }
    }
    }

//var data = [];
  

//	data[0] = [];
//	data[1] = [];
//	data[2] = [];
//	data[3] = [];
	// add more rows if your csv file has more columns

	// add here the header of the csv file
//	data[0][0] = "Q1";
//	data[1][0] = "Q2";
//	data[2][0] = "Q3";
//	data[3][0] = "Q4";
	// add more rows if your csv file has more columns

//	data[0][1] = [];
//	data[1][1] = [];
//	data[2][1] = [];
//	data[3][1] = [];
  
	//csv.forEach(function(x) {
		//var v1 = Math.floor(x.Q1),
			//v2 = Math.floor(x.Q2),
			//v3 = Math.floor(x.Q3),
			//v4 = Math.floor(x.Q4);
			// add more variables if your csv file has more columns
			
		//var rowMax = Math.max(v1, Math.max(v2, Math.max(v3,v4)));
		//var rowMin = Math.min(v1, Math.min(v2, Math.min(v3,v4)));

		//data[0][1].push(v1);
		//data[1][1].push(v2);
		//data[2][1].push(v3);
		//data[3][1].push(v4);
		 // add more rows if your csv file has more columns
		 
		//if (rowMax > max) max = rowMax;
		//if (rowMin < min) min = rowMin;	
	//});
	var chart = d3.box()
		.whiskers(iqr(1.5))
		.height(height)	
		.domain([min, max])
		.showLabels(labels);
  
    d3.select("#chart1").select("svg").remove();
  
  var svg = d3.select("#chart1").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.attr("class", "box")    
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    
    
	// the x-axis
	var x = d3.scale.ordinal()	   
		.domain( data.map(function(d) { 
      return d[0] } ) )	    
		.rangeRoundBands([0 , width], 0.7, 0.3); 		

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

	// the y-axis
	var y = d3.scale.linear()
		.domain([min, max])
		.range([height + margin.top, 0 + margin.top]);
	
	var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

	// draw the boxplots	
	svg.selectAll(".box")	   
      .data(data)
	  .enter().append("g")
		.attr("transform", function(d) { return "translate(" +  x(d[0])  + "," + margin.top + ")"; } )
      .call(chart.width(x.rangeBand())); 
	
	      
	// add a title
	svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 + (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "18px") 
        //.style("text-decoration", "underline")  
        .text("Route wise freight");
 
	 // draw y axis
	svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
		.append("text") // and text1
		  .attr("transform", "rotate(-90)")
		  .attr("y", 6)
		  .attr("dy", ".71em")
		  .style("text-anchor", "end")
		  .style("font-size", "16px") 
		  .text("Per Ton-Km freight in INR");		
	
	// draw x axis	
	svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (height  + margin.top + 10) + ")")
      .call(xAxis)
	  .append("text")             // text label for the x axis
        .attr("x", (width / 2) )
        .attr("y",  20 )
		.attr("dy", ".71em")
        .style("text-anchor", "middle")
		.style("font-size", "16px") 
        .text("Route"); 

        populatechart ();
        populatechart3();

}

// Returns a function to compute the interquartile range.
function iqr(k) {
  return function(d, i) {
    var q1 = d.quartiles[0],
        q3 = d.quartiles[2],
        iqr = (q3 - q1) * k,
        i = -1,
        j = d.length;
    while (d[++i] < q1 - iqr);
    while (d[--j] > q3 + iqr);
    return [i, j];
  };
}

function findunique(xs) {
  var seen = {}
  return xs.filter(function(x) {
    if (seen[x])
      return
    seen[x] = true
    return x
  })
}



function populateBoxplot2 (){
  var labels = true; // show the text labels beside individual boxplots?
  
  var margin = {top: 30, right: 50, bottom: 70, left: 50};
  var  width = 800 - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;
    
  var min = Infinity,
      max = -Infinity;
    
  // parse in the data	
  //d3.csv("data.csv", function(error, csv) {
    // using an array of arrays with
    // data[n][2] 
    // where n = number of columns in the csv file 
    // data[i][0] = name of the ith column
    // data[i][1] = array of values of ith column
   qfdata= findunique(qdata)
    console.log(qfdata)
    var data = [];
    for (i=0;i<qfdata.length;i++) {
      var tkey=qfdata[i];
      console.log(tkey)
      data [i]=[];
      data[i][0]=tkey.substring(0,tkey.indexOf(",")) + tkey.substring(tkey.indexOf("-"),tkey.indexOf(",",tkey.indexOf("-")));
      data[i][1]=[];
      for(k=0;k<resultarray.length;k++){
        if(resultarray[k].key1==tkey){
          data[i][1].push(resultarray[k].pertonfreight);
          if (resultarray[k].pertonfreight>max){
            max=resultarray[k].pertonfreight
          }
          if(resultarray[k].pertonfreight<min){
            min=resultarray[k].pertonfreight
          }
        }
      }
      }
  
  //var data = [];
    
  
  //	data[0] = [];
  //	data[1] = [];
  //	data[2] = [];
  //	data[3] = [];
    // add more rows if your csv file has more columns
  
    // add here the header of the csv file
  //	data[0][0] = "Q1";
  //	data[1][0] = "Q2";
  //	data[2][0] = "Q3";
  //	data[3][0] = "Q4";
    // add more rows if your csv file has more columns
  
  //	data[0][1] = [];
  //	data[1][1] = [];
  //	data[2][1] = [];
  //	data[3][1] = [];
    
    //csv.forEach(function(x) {
      //var v1 = Math.floor(x.Q1),
        //v2 = Math.floor(x.Q2),
        //v3 = Math.floor(x.Q3),
        //v4 = Math.floor(x.Q4);
        // add more variables if your csv file has more columns
        
      //var rowMax = Math.max(v1, Math.max(v2, Math.max(v3,v4)));
      //var rowMin = Math.min(v1, Math.min(v2, Math.min(v3,v4)));
  
      //data[0][1].push(v1);
      //data[1][1].push(v2);
      //data[2][1].push(v3);
      //data[3][1].push(v4);
       // add more rows if your csv file has more columns
       
      //if (rowMax > max) max = rowMax;
      //if (rowMin < min) min = rowMin;	
    //});
    var chart = d3.box()
      .whiskers(iqr(1.5))
      .height(height)	
      .domain([min, max])
      .showLabels(labels);
  
    var svg = d3.select("#chart2").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("class", "box")    
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
      
      
    // the x-axis
    var x = d3.scale.ordinal()	   
      .domain( data.map(function(d) { 
        return d[0] } ) )	    
      .rangeRoundBands([0 , width], 0.7, 0.3); 		
  
    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");
  
    // the y-axis
    var y = d3.scale.linear()
      .domain([min, max])
      .range([height + margin.top, 0 + margin.top]);
    
    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");
  
    // draw the boxplots	
    svg.selectAll(".box")	   
        .data(data)
      .enter().append("g")
      .attr("transform", function(d) { return "translate(" +  x(d[0])  + "," + margin.top + ")"; } )
        .call(chart.width(x.rangeBand())); 
    
          
    // add a title
    /*svg.append("text")
          .attr("x", (width / 2))             
          .attr("y", 0 + (margin.top / 2))
          .attr("text-anchor", "middle")  
          .style("font-size", "18px") 
          //.style("text-decoration", "underline")  
          .text("Route wise freight");
   */
     // draw y axis
    svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
      .append("text") // and text1
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("font-size", "16px") 
        .text("Per Ton-Km freight in INR");		
    
    // draw x axis	
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height  + margin.top + 10) + ")")
        .call(xAxis)
      .append("text")             // text label for the x axis
          .attr("x", (width / 2) )
          .attr("y",  20 )
      .attr("dy", ".71em")
          .style("text-anchor", "middle")
      .style("font-size", "16px") 
          .text("Route"); 
  
  }