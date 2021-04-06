import http from "../http-common";

class BotDataService {
  getAll = () => {
    return http.get("/bots");
  };

  get = id => {
    return http.get(`/bots/${id}`);
  };

  create = data => {
    return http.post("/bots", data);
  };

  update = (id, data) => {
    return http.patch(`/bots/${id}`, data);
  };

  remove = id => {
    return http.delete(`/bots/${id}`);
  };

  removeAll = () => {
    return http.delete(`/bots`);
  };

  getAssetsList = () => {
    return http.get('/system/assets');
  }

  playFile = (id, data) => {
    return http.post(`/bots/${id}/play`, data);
  }

  getWaypointsList = (id) => {
    return http.get(`/bots/${id}/waypoints`);
  }

  jumpTo = (id, data) => {
    return http.post(`/bots/${id}/jumpto`, data);
  }
}

export default new BotDataService();