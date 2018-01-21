module.exports = function Prim(graph) {
    return new Promise ((resolve,reject) => {
    //返回最小支撑林forest:为一个tree的数组;
    //每一个tree中,node数组存放tree中的点在graph中的下标,edge存边的下标;
    try{
    var ifNodeAdded = Array(0); 
    var length = graph.node.length-1;
    for(let i = 0;i < length;++i)  {
      ifNodeAdded.push(false);
    }
    var nearestnode = new Array(length);
    var nearestweight = new Array(length);
    var currentnode,accountnode,nextnode;
    var forest = Array();
    var tree = {node:[],edge:[]};
    var newweight;
    //v0加入树中;
    accountnode = 0;
    while(accountnode < length)  {
      for(let i in ifNodeAdded) {
        //找到一个未标记的节点;
        if(ifNodeAdded[i] === false)  {
          currentnode = i;
          break;
        }
      }
      tree.node = Array(0);
      tree.node.push(currentnode);
      tree.edge = Array();
      ifNodeAdded[currentnode] = true;
      for(let i in nearestnode) {
        nearestnode[i] = -1;
        nearestweight = Infinity;
      }
      //对currentnode所在连通支求最小生成树;
      while(1)  {
        //更新新加入点的相邻点的到Tree的距离;
        for(let i = graph.node[currentnode].firstEdgeIndex;
          i < graph.edge.length && i < graph.node[currentnode+1].firstEdgeIndex;++i)  {
          if(ifNodeAdded[graph.edge[i].endNode] === true) {
            continue;
          }
          if(nearestweight[graph.edge[i].endNode] > graph.edge[i].value){
            nearestnode[graph.edge[i].endNode] = currentnode;
            nearestweight[graph.edge[i].endNode] = graph.edge[i].value;
          }
        }
        //选出下一个节点;
        nextnode = currentnode;
        newweight = Infinity;
        for(let i = 0;i < ifNodeAdded.length;++i) {
         if(ifNodeAdded[i] === true || nearestnode[i] < 0)  {
            continue;
          }
          if(nearestweight[i] < newweight)  {
            newweight = nearestweight[i];
            nextnode = i;
          }
        }
        if(nextnode === currentnode)  {
          //没有找到下一个节点,该连通支生成树已找到;
          break;
        }
        tree.node.push(nextnode);
        //找出新加入的边;
        for(let j = graph.node[nextnode].firstEdgeIndex;
            j < graph.edge.length && j < graph.node[nextnode+1].firstEdgeIndex;++j)  {
            if(graph.edge[j].endNode === nearestnode[nextnode]) {
              tree.edge.push(j);
              break;
            }
        }
        accountnode++;
        if(accountnode === length) {
          break;
        }
        currentnode = nextnode;
        ifNodeAdded[currentnode] = true;
      }
      forest.push(tree);
    }
    resolve(forest);
    }catch(e)   { 
        errorMessage = 'sth happened!';
        reject(errorMessage);
    }
  })
}