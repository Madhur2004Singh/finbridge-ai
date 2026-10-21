import { Blog, Comment } from "../models/Blog.js";
import { toSlug } from "../utils/slug.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadDataImage, deleteImage } from "./cloudinary.service.js";

const uniqueSlug = async (title, excludeId = null) => {
  const base = toSlug(title) || "blog";
  let slug = base;
  let i = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Blog.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    slug = `${base}-${i++}`;
  }
  return slug;
};

export const listBlogs = async (includeDrafts = false) => {
  const blogs = await Blog.find(includeDrafts ? {} : { published: true })
    .sort({ createdAt: -1 })
    .populate("author", "name role")
    .lean();

  const counts = await Comment.aggregate([
    { $group: { _id: "$blogId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

  return blogs.map((b) => ({
    ...b,
    authorName: b.author?.name || "FinBridge",
    commentCount: countMap.get(String(b._id)) || 0,
  }));
};

export const getBlogBySlug = async (slug, includeDrafts = false) => {
  const blog = await Blog.findOne({
    slug,
    ...(includeDrafts ? {} : { published: true }),
  })
    .populate("author", "name role")
    .lean();
  if (!blog) throw new ApiError(404, "Blog not found");

  const comments = await Comment.find({ blogId: blog._id })
    .sort({ createdAt: 1 })
    .populate("userId", "name role")
    .lean();

  return {
    blog: { ...blog, authorName: blog.author?.name || "FinBridge" },
    comments: comments.map((c) => ({
      ...c,
      authorName: c.userId?.name || "User",
    })),
  };
};

const resolveImage = async (image, existing = {}) => {
  // image may be: undefined (keep existing), "" (remove), or a data URI (new upload)
  if (image === undefined) return existing;
  if (image === "" || image === null) {
    if (existing.publicId) await deleteImage(existing.publicId);
    return { url: "", publicId: "" };
  }
  const uploaded = await uploadDataImage(image);
  if (existing.publicId) await deleteImage(existing.publicId);
  return uploaded;
};

export const createBlog = async (authorId, { title, content, image, published }) => {
  const imageObj = await resolveImage(image);
  const blog = await Blog.create({
    title,
    slug: await uniqueSlug(title),
    content,
    image: imageObj,
    author: authorId,
    published: published !== false,
  });
  return blog.toSafeObject();
};

export const updateBlog = async (id, { title, content, image, published }) => {
  const blog = await Blog.findById(id);
  if (!blog) throw new ApiError(404, "Blog not found");

  if (title && title !== blog.title) {
    blog.title = title;
    blog.slug = await uniqueSlug(title, blog._id);
  }
  if (content !== undefined) blog.content = content;
  if (published !== undefined) blog.published = published !== false;
  blog.image = await resolveImage(image, blog.image);

  await blog.save();
  return blog.toSafeObject();
};

export const deleteBlog = async (id) => {
  const blog = await Blog.findByIdAndDelete(id);
  if (!blog) throw new ApiError(404, "Blog not found");
  if (blog.image?.publicId) await deleteImage(blog.image.publicId);
  await Comment.deleteMany({ blogId: blog._id });
};

export const uploadBlogImage = async (dataUri) => uploadDataImage(dataUri);

export const addComment = async (blogId, userId, text) => {
  const blog = await Blog.findById(blogId).select("_id");
  if (!blog) throw new ApiError(404, "Blog not found");

  const comment = await Comment.create({ blogId, userId, text });
  return {
    ...comment.toObject(),
    authorName: "You",
  };
};

export const deleteComment = async (blogId, commentId, user) => {
  const comment = await Comment.findOne({ _id: commentId, blogId });
  if (!comment) throw new ApiError(404, "Comment not found");
  const isOwner = String(comment.userId) === String(user.id);
  if (!isOwner && user.role !== "admin") {
    throw new ApiError(403, "You can only delete your own comments");
  }
  await comment.deleteOne();
};
