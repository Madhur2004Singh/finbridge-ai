import client from "./client";

export const list = (month) =>
  client.get("/expenses", { params: month ? { month } : {} });
export const create = (payload) => client.post("/expenses", payload);
export const remove = (id) => client.delete(`/expenses/${id}`);
