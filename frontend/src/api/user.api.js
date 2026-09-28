import client from "./client";

export const patchProfile = (payload) => client.patch("/users/profile", payload);
