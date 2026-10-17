import client from "./client";

export const get = () => client.get("/survey");
export const getStatus = () => client.get("/survey/status");
export const submit = (payload) => client.put("/survey", payload);
export const regenerateProfile = () => client.post("/survey/profile");
