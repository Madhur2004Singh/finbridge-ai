import client from "./client";

export const list = (params) => client.get("/schemes", { params });
export const getBySlug = (slug) => client.get(`/schemes/${slug}`);
export const recommendations = () => client.get("/schemes/recommendations");
