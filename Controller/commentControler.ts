import { Request, Response } from 'express';
import Comment from '../models/Comment';
import News from '../models/News';
import User from '../models/User';


export const commentNews = async (req: Request, res: Response) => {
  try {
    const { newsId } = req.params; 
    const { id: userId } = req.user; 
    const { comment } = req.body; 

    // Create a  comment 
    const newComment = await Comment.create({ newsId, userId, comment });
    return res.status(201).json({ message:"comment to news", comment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const  getCommentsNews = async (req: Request, res: Response)=> {
  try {
    const { newsId } = req.params;
      const news = await News.findByPk(newsId);
      if (!news) {
        return res.status(404).json({ message: 'News item not found' });
      }
      const comments = await Comment.findAll({ where: { newsId } });

    return res.status(200).json({ comments });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
  }

  export const deleteComment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
  
      const comment = await Comment.findByPk(id);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
  
      if (comment.userId === userId || req.user.role === 'Admin') {
        // Only the comment author or admin can delete the comment
        await comment.destroy();
        return res.json({ message: 'Comment deleted successfully' });
      }
  
      res.status(403).json({ message: 'Unauthorized ' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to delete the comment' });
    }
  };
  
  

export default { commentNews, getCommentsNews,deleteComment };
