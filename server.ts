import express, { Request, Response } from "express";
import "./db";
import "./redis";
import { register, login } from "./Controller/auth";
import {
  createNews,
  updateNews,
  getNews,
  deleteNews,
} from "./Controller/newsController";
import {
  createUser,
  editUser,
  editUserProfile,
} from "./Controller/userControl";
import { likenews, disLike } from "./Controller/likeControler";
import {
  authenticateUser,
  checkAdminRole,
  checkEditorRole,
  checkVisitorRole,
} from "./middleware/midd";
import {
  commentNews,
  getCommentsNews,
  deleteComment,
} from "./Controller/commentControler";
import upload from "./multer";

const app = express();
const port = 7878;

// Middleware
app.use(express.json());

// normal auth routes Routes
app.post("/register", register);
app.post("/login", login);
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the server!");
});
// user ki apis
app.post("/users", authenticateUser, checkAdminRole, createUser);
app.put("/users/:userId", authenticateUser, checkAdminRole, editUser);
app.put(
  "/users/profile",
  authenticateUser,
  checkAdminRole,
  checkEditorRole,
  checkVisitorRole,
  editUserProfile
);

// news apis
app.post(
  "/news",
  upload.fields([{ name: "images" }, { name: "videos" }]),
  createNews
);
app.get("/news", authenticateUser, getNews);
app.put(
  "/news/:id",
  authenticateUser,
  checkAdminRole,
  checkEditorRole,
  upload.fields([{ name: "images" }, { name: "videos" }]),
  updateNews
);
app.delete(
  "/news/:id",
  authenticateUser,
  checkAdminRole,
  checkEditorRole,
  deleteNews
);



// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
