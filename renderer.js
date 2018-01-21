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

// 按钮与显示DOM
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

let link, node;

// 设置按钮行为
shortestRouteButton.on('click', () => {
  shortestRouteBlock.show();
  connectedComponentBlock.hide();
})
connectedComponentButton.on('click', () => {
  shortestRouteBlock.hide();
  connectedComponentBlock.show();
})
// 搜索最短路
searchButton.on('click', () => {
  let startNode = $('#startNode').val();
  let endNode = $('#endNode').val();
  console.log(startNode);
  console.log(endNode);
  if(!/^\d+$/.test(startNode) || !/^\d+$/.test(endNode)) {
    alert('请输入合法的数字!');
    return;
  }
  // 调用dijkstra算法
  dijkstra(data, parseInt(startNode), parseInt(endNode)).then((result) => {
    console.log(result);
    // 先还原图的原本着色
    link.attr("stroke", "#999")
    .attr("stroke-width", "0.5px")
    .attr("stroke-opacity", 0.3);
    
    // 记录路径顺序
    let pathString = data.edge[result.path[0]].startNode.toString();
    
    // 遍历路径上的边，修改颜色
    for(let j = 0; j < result.path.length; j++) {
      pathString += (' => ' + data.edge[result.path[j]].endNode.toString());
      link.filter(function (d, i) {
        return i === result.path[j];
      }).attr("stroke", "red")
      .attr("stroke-width", "2.0px")
      .attr("stroke-opacity", 1.0);
    }
    alert('最短路径: ' + pathString + '\n路径长度为: ' + result.distance);
  })
  .catch((reason) => {
    alert(reason);
  });
});

// 显示最短树
minTreeButton.on('click', () => {
  // 还原着色
  link.attr("stroke", "#999")
  .attr("stroke-width", "0.5px")
  .attr("stroke-opacity", 0.3);
  
  // 调用prim算法
  prim(data).then((result) => {
    console.log(result);
    // 着色
    for(let j = 0; j < result.length; j++) {
      for(let k = 0; k < result[j].edge.length; k++) {
        link.filter(function (d, i) {
          return i === result[j].edge[k];
        }).attr("stroke", "green")
        .attr("stroke-width", "2.0px")
        .attr("stroke-opacity", 1.0);
      } 
    }
  })
  .catch((reason) => {
    alert(reason);
  });
})

// 更新连通分量
updateButton.on('click', () => {
  let edgeWeight = $('#edgeWeight').val();
  if(!/^\d+$/.test(edgeWeight)){
    alert('请输入合法的数字!');
    return;
  }

  // 调用算法
  connectedComponent(data, parseInt(edgeWeight)).then((result) => {
    console.log(result);
    // 还原着色
    link.attr("stroke", "#999")
    .attr("stroke-width", "0.5px")
    .attr("stroke-opacity", 0.3);

    // 着色
    for(let j = 0; j < result.length; j++) {
      for(let k = 0; k < result[j].length; k++) {
        link.filter(function (d, i) {
          return i === result[j][k];
        }).attr("stroke", color(j+1))
        .attr("stroke-width", "2.0px")
        .attr("stroke-opacity", 1.0);
      } 
    }
    alert("连通支数量为: " + result.length);
  })
  .catch((reason) => {
    alert(reason);
  });
})

// 建图
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");
var color = d3.scaleOrdinal(d3.schemeCategory20);
var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("radial", d3.forceRadial(40, width / 2, height / 2))
    .force("center", d3.forceCenter(width / 2, height / 2));


let data = {node:[], edge:[]}; // 存放图的信息
let progressAmount = 0; // 加载数据集的条目数量
let nodeAmount = 0; // 节点(电影)数
let maxIntersection = 0; // 用户最大交集数，为了之后相减，交集数越大，关系越近，边长越短
csvtojson // 开始读取数据
.fromFile('./data/user.csv')
.on('json', (jsonObj) => {
  progress.text('已读取数据条数: ' + progressAmount);
  progressAmount += 1;

  // 添加新节点
  if(nodeAmount === 0 || jsonObj.movieName !== data.node[data.node.length - 1].id) {
    let j = nodeAmount - 1;
    // 添加在这之前的节点相互之间的边
    for(let i = 0; i < j; i++) {
      let len = intersect.big(data.node[j].users, data.node[i].users).length; // 用户交集数
      if(len > maxIntersection)
        maxIntersection = len;
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
    // 添加新节点
    nodeAmount = data.node.push({
      index: data.node.length,
      id: jsonObj.movieName,
      users: [jsonObj.userName]
    });
  }
  else // 此条数据并未出现新电影，故仅添加用户名单
    data.node[nodeAmount - 1].users.push(jsonObj.userName);
})
.on('error', (error) => {
  alert(error);
})
.on('end', () => { // 读取完毕，建正向表并画图
  progress.text('建图中...');
  data.edge.sort((a, b) => {
    return a.startNode - b.startNode;
  });

  // 修改边权，关系越近，距离越短
  data.edge.forEach((e) => {
    e.value = maxIntersection + 1 - e.value;
  });

  // 正向表的边索引
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

  // 画图
  link = svg.append("g")
    .selectAll("line")
    .data(data.edge)
    .enter().append("line")
      .attr("stroke", "#999")
      .attr("stroke-width", "0.5px")
      .attr("stroke-opacity", 0.3);

  node = svg.append("g")
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
