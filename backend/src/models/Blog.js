import mongoose from "mongoose";
import { toSlug } from "../utils/slug.js";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 160,
    },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      maxlength: 50000,
    },
    // Uploaded via Cloudinary (file picker or whiteboard canvas export)
    image: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

blogSchema.index({ published: 1, createdAt: -1 });

blogSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const Blog = mongoose.model("Blog", blogSchema);

const commentSchema = new mongoose.Schema(
  {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      minlength: 1,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

commentSchema.index({ blogId: 1, createdAt: 1 });

export const Comment = mongoose.model("Comment", commentSchema);
