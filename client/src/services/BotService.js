import http from "../http-common";

const getAll = () => {
  return http.get("/bots");
};

const get = id => {
  return http.get(`/bots/${id}`);
};

const create = data => {
  return http.post("/bots", data);
};

const update = (id, data) => {
  return http.patch(`/bots/${id}`, data);
};

const remove = id => {
  return http.delete(`/bots/${id}`);
};

const removeAll = () => {
  return http.delete(`/bots`);
};

export default {
  getAll,
  get,
  create,
  update,
  remove,
  removeAll
};
