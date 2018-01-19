
const csvtojson = require('csvtojson')({
  noheader: true,
  trim: false,
  flatKeys: true,
  quote: "off",
  headers: ['movieName', 'userName']
});

const intersect = require('intersect');

let data = {node:[], edge:[]};
let j = 0;
csvtojson
.fromFile('./data/user.csv')
.on('json', (jsonObj) => {
  console.log(j);
  j += 1;
  if(data.node.length === 0 || jsonObj.movieName !== data.node[data.node.length - 1].name)
    data.node.push({
      index: data.node.length,
      name: jsonObj.movieName,
      users: [jsonObj.userName]
    });
  else
    data.node[data.node.length - 1].users.push(jsonObj.userName);
  //console.log(JSON.stringify(jsonObj, null, '  '));
})
.on('error', (error) => {
  console.log(error);
})
.on('end', () => {
  let index = 0;
  for(let i = 0; i < data.node.length; i++) {
    console.log(i);
    data.node[i].firstEdgeIndex = index;
    for(let j = 0; j < data.node.length; j++) {
      if(i === j)
        continue;
      let len = intersect.big(data.node[i].users, data.node[j].users).length;
      if(len !== 0) {
        data.edge.push({
          startNode: i,
          endNode: j,
          value: intersect.big(data.node[i].users, data.node[j].users).length
        });
        index += 1;
      }
    }
  }
  data.node.push({firstEdgeIndex: index});
  console.log(JSON.stringify(data, null, '  '));
})

var j3 = $('#aaa');
j3.on('click', function () {
  j3.text('you click, I change');
  var a = 1;
  console.log(a);
});
var j1 = $('#test-ul li.js');
var j2 = $('#test-ul li[name=book]');
j1.html('<span style="color: red">JavaScript</span>');
j2.text('JavaScript & ECMAScript');


var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

d3.json("data/miserables.json", function(error, graph) {
  if (error) throw error;

  var link = svg.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
      .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

  var node = svg.append("g")
      .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
      .attr("r", 5)
      .attr("fill", function(d) { return color(d.group); })
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

  node.append("title")
      .text(function(d) { return d.id; });

  simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(graph.links);

  function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }
});

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}