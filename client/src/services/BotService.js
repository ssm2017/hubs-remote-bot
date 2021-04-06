import http from "../http-common";

class BotDataService {
  getAll = () => {
    return http.get("/bots");
  };

  get = uuid => {
    return http.get(`/bots/${uuid}`);
  };

  create = data => {
    return http.post("/bots", data);
  };

  update = (uuid, data) => {
    return http.patch(`/bots/${uuid}`, data);
  };

  remove = uuid => {
    return http.delete(`/bots/${uuid}`);
  };

  removeAll = () => {
    return http.delete(`/bots`);
  };

  getAssetsList = () => {
    return http.get('/system/assets');
  }

  playFile = (uuid, data) => {
    return http.post(`/bots/${uuid}/play`, data);
  }

  getWaypointsList = (uuid) => {
    return http.get(`/bots/${uuid}/waypoints`);
  }

  jumpTo = (uuid, data) => {
    return http.post(`/bots/${uuid}/jumpto`, data);
  }

  goTo = (uuid, data) => {
    return http.post(`/bots/${uuid}/goto`, data);
  }
}

export default new BotDataService();