
const csvtojson = require('csvtojson')({
  noheader: true,
  trim: false,
  flatKeys: true,
  quote: "off",
  headers: ['movieName', 'userName']
});

const intersect = require('intersect');

const shortestRouteBlock = $('#shortestRouteBlock');
const shortestRouteButton = $('#shortestRoute');
const minTreeButton = $('#minTree');
const connectedComponentButton = $('#connectedComponent');
const searchButton = $('#searchButton');
const updateButton = $('#updateButton');
const connectedComponentBlock = $('#connectedComponentBlock');

shortestRouteBlock.hide();
connectedComponentBlock.hide();

shortestRouteButton.on('click', () => {
  shortestRouteBlock.show();
  connectedComponentBlock.hide();
})

connectedComponentButton.on('click', () => {
  shortestRouteBlock.hide();
  connectedComponentBlock.show();
})

searchButton.on('click', () => {
  let startNode = $('#startNode').val();
  let endNode = $('#endNode').val();
  console.log(startNode);
  console.log(endNode);
  if(!/^\d+$/.test(startNode) || !/^\d+$/.test(endNode)) {
    alert('请输入合法的数字!');
    return;
  }
  
})

updateButton.on('click', () => {
  let edgeWeight = $('#edgeWeight').val();
  if(!/^\d+$/.test(edgeWeight)){
    alert('请输入合法的数字!');
    return;
  }
  
})

let data = {node:[], edge:[]};
let j = 0;
let nodeAmount = 0;
csvtojson
.fromFile('./data/user.csv')
.on('json', (jsonObj) => {
  console.log(j);
  j += 1;
  if(nodeAmount === 0 || jsonObj.movieName !== data.node[data.node.length - 1].name) {
    let j = nodeAmount - 1;
    for(let i = 0; i < j; i++) {
      //console.log(i);
      let len = intersect.big(data.node[j].users, data.node[i].users).length;
      if(len !== 0) {
        data.edge.push(
          {
            startNode: j,
            endNode: i,
            value: len
          },
          {
            startNode: i,
            endNode: j,
            value: len
          }
        );
      }
    }
    nodeAmount = data.node.push({
      index: data.node.length,
      name: jsonObj.movieName,
      users: [jsonObj.userName]
    });
  }
  else
    data.node[nodeAmount - 1].users.push(jsonObj.userName);
  
  //console.log(JSON.stringify(jsonObj, null, '  '));
})
.on('error', (error) => {
  console.log(error);
})
.on('end', () => {
  /*let index = 0;
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
          value: len
        });
        index += 1;
      }
    }
  }*/
  //data.node.push({firstEdgeIndex: index});
  data.edge.sort((a, b) => {
    return a.startNode - b.startNode;
  })
  let index = 0;
  for(let i = 0; i < data.node.length; i++) {
    data.node[i].firstEdgeIndex = index;
    while(index < data.edge.length && data.edge[index].startNode === i)
      index += 1;
  }
  data.node.push({
    firstEdgeIndex: data.edge.length
  })
  console.log(JSON.stringify(data, null, '  '));
});

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