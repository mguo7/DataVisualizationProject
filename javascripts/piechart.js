/**
 * Created by Peter on 14-3-17.
 */

var svg;

var data;

var margin = {top: 20, right: 20, bottom: 30, left: 90},
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var radius = Math.min(width, height) / 3;

var color = d3.scale.category20();

var pie = d3.layout.pie()
    .value(function (d) {
        return d.revenue;
    })
    .sort(null);

var arc = d3.svg.arc()
    .innerRadius(radius - 100)
    .outerRadius(radius - 20);

//0:revenue
//1:tuition
//2:total enrollment
//3:all employees

var opt = 0;

//add the tooltip area to the webpage
var tooltip = d3.select("#main").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);



function pieform(){
    var text = '<form>' +
        '<label><input id="pieselection" type="radio" name="dataset" value="revenue" checked> Revenue</label>' +
        '<label><input id="pieselection" type="radio" name="dataset" value="tuition"> Tuition</label>' +
        '<label><input id="pieselection" type="radio" name="dataset" value="total_enrollment"> Total Enrollment</label>' +
        '<label><input id="pieselection" type="radio" name="dataset" value="all_employees"> All Employees</label>' +
        '</form>'
    document.getElementById("selection").innerHTML=text;
}



function createPieSvg() {
    svg = d3.select("#main").append("svg")
        .attr("id", "mainsvg")
        .attr("width", 800)
        .attr("height", 500)
        .append("g")
        .attr("transform", "translate(" + 800 / 2 + "," + 500 / 2 + ")");
}

function piechart(){


    pieform();
    createPieSvg();

    d3.csv("data/pie.csv", type, function(error, data) {


        var group1 = svg.append("g").classed("group1", true)

        var blocks = group1.selectAll("g").data(data)
            .enter()
            .append("g")
            .attr("transform", function(d,i){ return get_location(d,i)})

        var rects = blocks.append("rect")
            .attr({
                "x": 80,
                "y": 0,
                "width": 30,
                "height": 30,
                "rx": 5,
                "ry": 5
            })
            .style("fill", function(d,i){return  color(i)})

        var text_content = blocks.append("text")
            .attr({x:113, y:14})
            .style({
                "fill": "#232323",
                "stroke-width": 0 + "px",
                "font-size": 0.8 + "em",
                "text-anchor": "right",
                "alignment-baseline": "middle",
                "font-family": "sans-serif"
            })
            .text(function(d,i){return d.instname})

        var path = svg.datum(data).selectAll("path")
            .data(pie)
            .enter().append("path")
            .attr("fill", function(d, i) { return color(i); })
            .attr("d", arc)
            .each(function(d) { this._current = d; }) // store the initial angles
            .on("mouseenter", function(d){

                text = svg.append("text")
                    .attr("class","name")
                    .attr("transform", arc.centroid(d))
                    .attr("dy", ".5em")
                    .style("text-anchor", "middle")
                    .text(d.data.instname)
                    .style("font-size","15px")
                    .attr("font-family","serif")
                    .attr("text-anchor","middle")
                    .attr("font-weight","bold");

                if(opt==0){
                    value = svg.append("text")
                        .attr("class","name")
                        .attr("transform", arc.centroid(d))
                        .attr("dy", ".5em")
                        .style("text-anchor", "middle")
                        .attr("y",height/2-400)
                        .text("$ "+d.data.revenue)
                        .style("font-size","15px")
                        .attr("font-family","serif")
                        .attr("text-anchor","middle")
                        .attr("font-weight","bold");
                }
                if(opt==1){
                    value = svg.append("text")
                        .attr("class","name")
                        .attr("transform", arc.centroid(d))
                        .attr("dy", ".5em")
                        .style("text-anchor", "middle")
                        .attr("y",height/2-400)
                        .text("$ "+d.data.tuition)
                        .style("font-size","15px")
                        .attr("font-family","serif")
                        .attr("text-anchor","middle")
                        .attr("font-weight","bold");

                }
                if(opt==2){

                    value = svg.append("text")
                        .attr("class","name")
                        .attr("transform", arc.centroid(d))
                        .attr("dy", ".5em")
                        .style("text-anchor", "middle")
                        .attr("y",height/2-400)
                        .text(d.data.total_enrollment)
                        .style("font-size","15px")
                        .attr("font-family","serif")
                        .attr("text-anchor","middle")
                        .attr("font-weight","bold");
                }
                if(opt==3){

                    value = svg.append("text")
                        .attr("class","name")
                        .attr("transform", arc.centroid(d))
                        .attr("dy", ".5em")
                        .style("text-anchor", "middle")
                        .attr("y",height/2-400)
                        .text(d.data.all_employees)
                        .style("font-size","15px")
                        .attr("font-family","serif")
                        .attr("text-anchor","middle")
                        .attr("font-weight","bold");
                }


            })
            .on("mouseout",function(d){
                text.remove();
                value.remove();
            });


        path.append("text")
            .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .text(function(d) { return d.data.instname; });



        d3.selectAll("#pieselection")
            .on("change", change);

        function change() {
            var value = this.value;
            if(value == "revenue"){ opt = 0}
            if(value == "tuition"){ opt = 1}
            if(value == "total_enrollment"){ opt = 2}
            if(value == "all_employees"){ opt = 3}

            pie.value(function(d) { return d[value]; }); // change the value function
            path = path.data(pie); // compute the new angles
            path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
        }
    });
}



function type(d) {
    d.revenue = +d.revenue;
    d.tuition = +d.tuition;
    d.total_enrollment = +d.total_enrollment
    d.all_employees = +d.all_employees
    return d;
}

// Store the displayed angles in _current.
// Then, interpolate from _current to the new angles.
// During the transition, _current is updated in-place by d3.interpolate.
function arcTween(a) {
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function(t) {
        return arc(i(t));
    };
}


function get_location(d,i){
    var x = -500;
    var y = -300 + (48 * i);
    return "translate(" + [x, y] + ")";
}