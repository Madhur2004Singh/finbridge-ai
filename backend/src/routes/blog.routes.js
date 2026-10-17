import { Router } from "express";
import { body, param } from "express-validator";
import {
  getBlogs,
  getBlog,
  postBlog,
  putBlog,
  removeBlog,
  postUploadImage,
  postComment,
  removeComment,
} from "../controllers/blog.controller.js";
import { auth, adminOnly, optionalAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const blogValidators = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 160 }),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ max: 50000 }),
  body("image")
    .optional({ values: "null" })
    .isString()
    .withMessage("Image must be a base64 data URI or empty string"),
  body("published").optional().isBoolean().withMessage("published must be a boolean"),
  validate,
];

// Public reads (admins additionally see unpublished drafts)
router.get("/", optionalAuth, asyncHandler(getBlogs));
router.get("/:slug", optionalAuth, asyncHandler(getBlog));

// Admin-only writes
router.post("/upload-image", auth, adminOnly, asyncHandler(postUploadImage));
router.post("/", auth, adminOnly, blogValidators, asyncHandler(postBlog));
router.put("/:id", auth, adminOnly, blogValidators, asyncHandler(putBlog));
router.delete("/:id", auth, adminOnly, asyncHandler(removeBlog));

// Comments — any authenticated user
router.post(
  "/:id/comments",
  auth,
  [
    body("text")
      .trim()
      .notEmpty()
      .withMessage("Comment cannot be empty")
      .isLength({ max: 1000 })
      .withMessage("Comment is too long (max 1000 characters)"),
    param("id").isMongoId().withMessage("Invalid blog id"),
    validate,
  ],
  asyncHandler(postComment)
);
router.delete(
  "/:id/comments/:commentId",
  auth,
  [
    param("id").isMongoId().withMessage("Invalid blog id"),
    param("commentId").isMongoId().withMessage("Invalid comment id"),
    validate,
  ],
  asyncHandler(removeComment)
);

export default router;
