import { Request, Response } from 'express';
import Like from '../models/Like';
import News from '../models/News';

export const likenews = async (req: Request, res: Response) => {
  try {
    const { newsId } = req.params;
    const { id: userId } = req.user;

    // Check already liked 
    const existingLike = await Like.findOne({ where: { newsId, userId } });
    if (existingLike) {
      return res.status(400).json({ message: 'You have already liked this news item.' });
    }

    // Create a new like
    const like = await Like.create({ newsId, userId });
    return res.status(201).json({ message:"Like to news", like });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const disLike = async (req: Request, res: Response) => {
  try {
    const { likeId } = req.params;
    const userId = req.user.id; 

    const like = await Like.findByPk(likeId);
    if (!like) {
      return res.status(404).json({ message: 'Like not found' });
    }

    if (like.userId === userId || req.user.role === 'Admin') {
      // Only the liked author or admin can delete the like
      await like.destroy();
      return res.json({ message: 'Like deleted successfully' });
    }

    res.status(403).json({ message: 'Unauthorized ' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete the like' });
  }
};


export default {likenews,disLike } ;
