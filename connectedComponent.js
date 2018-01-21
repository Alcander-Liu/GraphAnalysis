module.exports =  function connectedComponent (graph,weight) {
    //返回每一个元素为一个连通支的边的集合的一个数组;连通分量可由result.length得到;
    return new Promise ((resolve, reject) => { 
      try {
        var result;
        var component;
        var ifNodeAdded = Array(graph.node.length);
        for(let i in ifNodeAdded){
            ifNodeAdded[i] = false;
        }
        var account = 0;
        var currentnode;
        var nodequeue;
        while(1){
            component = Array(0);
            currentnode = -1;
            for(let i in ifNodeAdded){
                if(ifNodeAdded[i] === false){
                    currentnode = i;
                }
            }
            if(currentnode < 0){
                break;
            }
            nodequeue = [currentnode];
            //求一个连通支;
            while(nodequeue.length > 0){
                //将当前节点的后继加入队列;
                for(let i = graph.node[currentnode].firstEdgeIndex;
                    i < graph.node[currentnode+1].firstEdgeIndex && i < graph.edge.length;
                    ++i)  {
                    if(ifNodeAdded[graph.edge[i].endNode] === true) {
                      continue;
                    }
                    if(graph.edge[i].value <= weight){
                        nodequeue.push(graph.edge[i].endNode);
                        component.push(i);
                        ifNodeAdded[i] = true;
                    }
                }
                nodequeue.shift();
                if(nodequeue.length > 0){
                    currentnode = nodequeue[0];
                }
            }
            result.push(component);
        }
        resolve(result);
      } catch (e) {
        errorMessage = 'sth happened!'
        reject(errorMessage);
      }
  }) 
  }
  