module.exports = function dijkstra(graph,head,tail)   {
    //正确返回值:最短路径对应边的下标的倒序数组(从尾到头),距离;
    return new Promise((resolve,reject) => {
        try {
            if(head >= graph.node.length-1 || tail >= graph.node.length-1){
                throw "arrayBoundsOverflow";
            }
            if(head === tail){
                resolve({
                    path: Array(0),
                    distance: 0
                });
            }
            var Path = Array();//倒序记录最短路径对应的边的下标;
            var length = graph.node.length - 1;
            var ifNodeAdded = new Array(length);
            var nearestnode = new Array(length);
            var currentnode,nextnode,nextweight;
            currentnode = head;
            for(let i = 0;i < length;++i){
                ifNodeAdded[i] = false;
                nearestnode[i] = {
                    index : -1,//对应的前驱;
                    edgeindex : -1,//对应加入的边;
                    distance : Infinity//离起点的距离;
                };
            }
            ifNodeAdded[head] = true;
            nearestnode[head] = {
                index: head,
                edgeindex: -1,
                distance: 0
            };
            while(1){
                //刷新新加入的节点后继的距离;
                for(let i = graph.node[currentnode].firstEdgeIndex;
                    i < graph.edge.length && i < graph.node[currentnode+1].firstEdgeIndex;++i)  {
                    if(ifNodeAdded[graph.edge[i].endNode] === true) {
                      continue;
                    }
                    if(nearestnode[graph.edge[i].endNode].distance > graph.edge[i].value
                        +nearestnode[currentnode].distance)  {
                      nearestnode[graph.edge[i].endNode].index = currentnode;
                      nearestnode[graph.edge[i].endNode].edgeindex = i;
                      nearestnode[graph.edge[i].endNode].distance = graph.edge[i].value+nearestnode[currentnode].distance;
                    }
                }
                //寻找下一个节点;
                nextnode = currentnode;
                nextweight = Infinity;
                for(let i = 0;i < length;++i){
                    if(ifNodeAdded[i] === true || nearestnode[i].distance === Infinity){
                        continue;
                    }
                    if(nearestnode[i].distance < nextweight){
                        nextnode = i;
                        nextweight = nearestnode[i].distance;
                    }
                }
                if(nextnode === currentnode){
                    throw "cannotReach";
                }
                else if(nextnode === tail){
                    break;
                }
                currentnode = nextnode;
                ifNodeAdded[currentnode] = true;
            }
            //求路径;
            currentnode = tail;
            while(nearestnode[currentnode].distance > 0){
                Path.push(nearestnode[currentnode].edgeindex);
                currentnode = nearestnode[currentnode].index;
            }
            resolve({
                path: Path,
                distance: nearestnode[tail].distance
            });
        }catch(e){
            if(e === "arrayBoundsOverflow"){
                errorMessage = "越界访问、节点不存在!";
                reject(errorMessage);
            }else if(e === "cannotReach"){
                errorMessage = "两节点间不存在通路!"
                reject(errorMessage);
            }else{
                errorMessage = '出现未知错误!';
                reject(errorMessage);
            }
        }
    })
}