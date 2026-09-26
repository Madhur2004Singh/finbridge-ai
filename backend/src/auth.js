import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "./models.js";

export const sign = (id) =>
  jwt.sign({ userId: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export async function auth(req, res, next) {
  try {
    const h = req.headers.authorization;
    if (!h?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const p = jwt.verify(h.slice(7), process.env.JWT_SECRET);
    req.user = await User.findById(p.userId).select("-passwordHash");
    if (!req.user) throw Error();
    next();
  } catch (e) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

export async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 8) {
    return res.status(400).json({
      message: "Name, email and 8+ character password are required",
    });
  }
  if (await User.findOne({ email: email.toLowerCase() })) {
    return res.status(409).json({ message: "Email already registered" });
  }
  const u = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash: await bcrypt.hash(password, 12),
  });
  const safe = u.toObject();
  delete safe.passwordHash;
  res.status(201).json({ token: sign(u.id), user: safe });
}

export async function login(req, res) {
  const u = await User.findOne({ email: req.body.email?.toLowerCase() });
  if (
    !u ||
    !(await bcrypt.compare(req.body.password || "", u.passwordHash))
  ) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  const safe = u.toObject();
  delete safe.passwordHash;
  res.json({ token: sign(u.id), user: safe });
}