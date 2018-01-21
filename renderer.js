
const csvtojson = require('csvtojson')({
  noheader: true,
  trim: false,
  flatKeys: true,
  quote: "off",
  headers: ['movieName', 'userName']
});

const intersect = require('intersect');
const prim = require('./prim.js');
const dijkstra = require('./dijkstra.js');
const connectedComponent = require('./connectedComponent.js');
const shortestRouteBlock = $('#shortestRouteBlock');
const shortestRouteButton = $('#shortestRoute');
const minTreeButton = $('#minTree');
const connectedComponentButton = $('#connectedComponent');
const searchButton = $('#searchButton');
const updateButton = $('#updateButton');
const connectedComponentBlock = $('#connectedComponentBlock');
const progress = $('#progress');

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

let link;

searchButton.on('click', () => {
  let startNode = $('#startNode').val();
  let endNode = $('#endNode').val();
  console.log(startNode);
  console.log(endNode);
  if(!/^\d+$/.test(startNode) || !/^\d+$/.test(endNode)) {
    alert('请输入合法的数字!');
    return;
  }
  dijkstra(data, parseInt(startNode), parseInt(endNode)).then((result) => {
    console.log(result);
    link.attr("stroke", "#999")
    .attr("stroke-width", "0.5px")
    .attr("stroke-opacity", 0.3);

    for(let j = 0; j < result.path.length; j++) {
      link.filter(function (d, i) {
        return i === result.path[j];
      }).attr("stroke", "red")
      .attr("stroke-width", "2.0px")
      .attr("stroke-opacity", 1.0);
    }
  });
});

minTreeButton.on('click', () => {
  prim(data).then((result) => {
    for(let i = 0; i < result.length; i++) {
      for(let j = 0; j < result[i].edge.length; i++) {
        while(index !== result.path[i])
          index += 1;
        edges[index].attr("color", '#000000');
      }
    }
  });
})

updateButton.on('click', () => {
  let edgeWeight = $('#edgeWeight').val();
  if(!/^\d+$/.test(edgeWeight)){
    alert('请输入合法的数字!');
    return;
  }
  connectedComponent(data, parseInt(edgeWeight)).then((result) => {
    console.log(result);
  })
})

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("radial", d3.forceRadial(40, width / 2, height / 2))
    .force("center", d3.forceCenter(width / 2, height / 2));

let data = {node:[], edge:[]};
let j = 0;
let nodeAmount = 0;
csvtojson
.fromFile('./data/user.csv')
.on('json', (jsonObj) => {
  progress.text('已读取数据条数: ' + j);
  console.log(j);
  j += 1;
  if(nodeAmount === 0 || jsonObj.movieName !== data.node[data.node.length - 1].id) {
    let j = nodeAmount - 1;
    for(let i = 0; i < j; i++) {
      //console.log(i);
      let len = intersect.big(data.node[j].users, data.node[i].users).length;
      if(len !== 0) {
        data.edge.push(
          {
            startNode: j,
            endNode: i,
            source: data.node[j].id,
            target: data.node[i].id,
            value: len
          },
          {
            startNode: i,
            endNode: j,
            source: data.node[i].id,
            target: data.node[j].id,
            value: len
          }
        );
      }
    }
    nodeAmount = data.node.push({
      index: data.node.length,
      id: jsonObj.movieName,
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
  progress.text('建图中...');
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

  link = svg.append("g")
    .selectAll("line")
    .data(data.edge)
    .enter().append("line")
      .attr("stroke", "#999")
      .attr("stroke-width", "0.5px")
      .attr("stroke-opacity", 0.3);

  var node = svg.append("g")
      .attr("class", "nodes")
    .selectAll("circle")
    .data(data.node)
    .enter().append("circle")
      .attr("r", 3)
      .attr("fill", function(d) { return color(d.group); });

  node.append("title")
      .text(function(d) { return d.id; });

  simulation
      .nodes(data.node)
      .on("tick", ticked);

  simulation.force("link")
      .links(data.edge);

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
  progress.text('建图完成');
});
