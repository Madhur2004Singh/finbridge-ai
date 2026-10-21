import {
  listBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  uploadBlogImage,
  addComment,
  deleteComment,
} from "../services/blog.service.js";
import { HTTP_STATUS } from "../utils/constants.js";

export const getBlogs = async (req, res) => {
  const blogs = await listBlogs(req.user?.role === "admin");
  res.status(HTTP_STATUS.OK).json({ success: true, blogs });
};

export const getBlog = async (req, res) => {
  const data = await getBlogBySlug(req.params.slug, req.user?.role === "admin");
  res.status(HTTP_STATUS.OK).json({ success: true, ...data });
};

export const postBlog = async (req, res) => {
  const blog = await createBlog(req.user.id, req.body);
  res.status(HTTP_STATUS.CREATED).json({ success: true, message: "Blog created", blog });
};

export const putBlog = async (req, res) => {
  const blog = await updateBlog(req.params.id, req.body);
  res.status(HTTP_STATUS.OK).json({ success: true, message: "Blog updated", blog });
};

export const removeBlog = async (req, res) => {
  await deleteBlog(req.params.id);
  res.status(HTTP_STATUS.OK).json({ success: true, message: "Blog deleted" });
};

export const postUploadImage = async (req, res) => {
  const image = await uploadBlogImage(req.body?.image);
  res.status(HTTP_STATUS.CREATED).json({ success: true, image });
};

export const postComment = async (req, res) => {
  const comment = await addComment(req.params.id, req.user.id, req.body.text);
  res.status(HTTP_STATUS.CREATED).json({ success: true, message: "Comment added", comment });
};

export const removeComment = async (req, res) => {
  await deleteComment(req.params.id, req.params.commentId, req.user);
  res.status(HTTP_STATUS.OK).json({ success: true, message: "Comment deleted" });
};
