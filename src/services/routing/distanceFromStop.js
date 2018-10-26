import routeStopData from '../../data/route-stop-map.json';

const { routeToStops, stopToRoutes } = routeStopData;

export default function distanceFromStop(stopId) {
  const visited = new Set();

  const toStop = {}, toRoute = {};
  toStop[stopId] = 0;

  // BFS from `stopId`
  const queue = [stopId];
  while (queue.length > 0) {
    const s = queue.shift();
    if (visited[s]) continue;
    visited[s] = true;

    const routes = stopToRoutes[s];
    routes.forEach((routeId) => {
      if (toRoute[routeId] == null) {
        toRoute[routeId] = toStop[s];
      }
      routeToStops[routeId].forEach(({ stopId: n }) => {
        if (toStop[n] == null) {
          toStop[n] = toStop[s] + 1;
          queue.push(n);
        }
      });
    });
  }

  return { toStop, toRoute };
}
