export function findShortestRoute (routeData) {
  return new Promise ((resolve, reject) => { 
    try {
      result = routeData.x + routeData.y;
      resolve(result);
    } catch (e) {
      errorMessage = 'sth happened!'
      reject(errorMessage);
    }
}) 
}
