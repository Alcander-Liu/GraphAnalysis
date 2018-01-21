module.exports =  function connectedComponent (graph,weight) {
    //返回每一个元素为一个连通支的边的集合的一个数组;连通分量可由result.length得到;
    return new Promise ((resolve, reject) => { 
      try {
        var result = Array();
        var component;
        var ifNodeAdded = Array(graph.node.length - 1);
        for(let i = 0;i < ifNodeAdded.length;++i){
            ifNodeAdded[i] = false;
        }
        var currentnode;
        var nodequeue = Array();
        while(1){
            component = Array(0);
            currentnode = -1;
            for(let i = 0; i < ifNodeAdded.length;++i){
                if(ifNodeAdded[i] === false){
                    currentnode = i;
                    break;
                }
            }
            if(currentnode < 0){
                break;
            }
            nodequeue = [currentnode];
            ifNodeAdded[currentnode] = true;
            //求一个连通支;
            while(nodequeue.length > 0){
                for(let i = graph.node[currentnode].firstEdgeIndex;
                    i < graph.edge.length && i < graph.node[currentnode+1].firstEdgeIndex;++i)  {
                    if(graph.edge[i].value <= weight){
                            component.push(i);
                            //如果当前节点后继未加入队列;
                            if(ifNodeAdded[graph.edge[i].endNode] === false){
                                nodequeue.push(graph.edge[i].endNode);
                                ifNodeAdded[graph.edge[i].endNode] = true;
                            }
                    }

                }
                nodequeue.shift();
                if(nodequeue.length > 0){
                    currentnode = nodequeue[0];
                }
            }
            let newcomponent = Array(component.length);
            for(let i = 0;i < component.length;++i){
                newcomponent[i] = component[i];
            }
            result.push(newcomponent);
        }
        resolve(result);
      } catch (e) {
        errorMessage = 'sth happened!'
        reject(errorMessage);
      }
  }) 
  }
  