import client from "./client";

export const list = () => client.get("/blogs");
export const getBySlug = (slug) => client.get(`/blogs/${slug}`);
export const create = (payload) => client.post("/blogs", payload);
export const update = (id, payload) => client.put(`/blogs/${id}`, payload);
export const remove = (id) => client.delete(`/blogs/${id}`);
export const uploadImage = (image) => client.post("/blogs/upload-image", { image });
export const addComment = (id, text) => client.post(`/blogs/${id}/comments`, { text });
export const removeComment = (id, commentId) =>
  client.delete(`/blogs/${id}/comments/${commentId}`);
