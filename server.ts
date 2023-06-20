import express, { Request, Response } from "express";
import sequelize from "./db";
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
const port = 2222;

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
  authenticateUser,
  checkAdminRole,
  checkEditorRole,
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

// like and dislike apis hai ye

app.post("/news/like/:newsId", authenticateUser, checkVisitorRole, likenews);
app.delete("/like/:likeId", authenticateUser, disLike);

// comments api hai
app.post(
  "/news/:newsId/comment",
  authenticateUser,
  checkVisitorRole,
  commentNews
);
app.get("/news/:newsId/comments", authenticateUser, getCommentsNews);
app.delete("/news/:id", authenticateUser, deleteComment);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
