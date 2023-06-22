import { Request, Response } from 'express';
import News from '../models/News';
import Image from '../models/Image';
import Video from '../models/Video';
import Comment from '../models/Comment';
import Like from '../models/Like';
import Dislike from '../models/Dislike';
import Joi from 'joi';

const newsschema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  newsDate: Joi.date().required(),
});


export const createNews = async (req: Request, res: Response) => {
  const { error } = newsschema.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  try {
    const { title, description, newsDate } = req.body;

    if (!req.files) {
      return res.status(400).json({ message: 'Invalid file upload' });
    }

    let imageFiles: Express.Multer.File[];
    let videoFiles: Express.Multer.File[];

    if (Array.isArray(req.files)) {
      // one image and video upload
      imageFiles = req.files as Express.Multer.File[];
      videoFiles = req.files as Express.Multer.File[];
    } else {
      // Multiple image and video upload
      imageFiles = (req.files as { [fieldname: string]: Express.Multer.File[] }).images || [];
      videoFiles = (req.files as { [fieldname: string]: Express.Multer.File[] }).videos || [];
    }

    // Create news
    const news = await News.create({
      title,
      description,
      newsDate,
    });

    const imageUrls = imageFiles.map((file) => {
      const imageUrl = `http://localhost:7878/uploads/images/${file.filename}`;
      return imageUrl;
    });

    // Create image
    const images = await Promise.all(
      imageUrls.map((url) =>
        Image.create({
          url,
          newsId: news.id,
        })
      )
    );

    const videoUrls = videoFiles.map((file) => {
      const videoUrl = `http://localhost:7878/uploads/videos/${file.filename}`;
      return videoUrl;
    });

    // Create video
    const videos = await Promise.all(
      videoUrls.map((url) =>
        Video.create({
          url,
          newsId: news.id,
        })
      )
    );

    res.status(201).json({ message: 'News created successfully', news, images, videos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateNews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, newsDate } = req.body;
    const { error } = newsschema.validate({ title, description, newsDate }, { abortEarly: false });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const news = await News.findByPk(id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    // Update news
    news.title = title;
    news.description = description;
    news.newsDate = newsDate;

    // Update image
    if (req.files && 'images' in req.files) {
      const imageFiles = (req.files as { [fieldname: string]: Express.Multer.File[] })['images'];

      const updatedImages = await Promise.all(
        imageFiles.map(async (file) => {
          const imageUrl = `http://localhost:7878/uploads/images/${file.filename}`;
          const image = await Image.create({
            url: imageUrl,
            newsId: news.id,
          });
          return image;
        })
      );
      news.Image = updatedImages.map((image) => image.id);
    }

    // Update video
    if (req.files && 'videos' in req.files) {
      const videoFiles = (req.files as { [fieldname: string]: Express.Multer.File[] })['videos'];

      const updatedVideos = await Promise.all(
        videoFiles.map(async (file) => {
          const videoUrl = `http://localhost:7878/uploads/videos/${file.filename}`;
          const video = await Video.create({
            url: videoUrl,
            newsId: news.id,
          });
          return video;
        })
      );
      news.Video = updatedVideos.map((video) => video.id);
    }

    await news.save();
    res.status(200).json({ message: 'News updated successfully', news });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getNews = async (req: Request, res: Response) => {
  try {
    const { limit = '50', page = '1', category, author, keywords, sortField, sortOrder }: { limit?: string, page?: string, category?: string, author?: string, keywords?: string, sortField?: string, sortOrder?: 'asc' | 'desc' } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const filterOptions: { [key: string]: any } = {};
    if (category) {
      filterOptions.category = category;
    }
    if (author) {
      filterOptions.author = author;
    }
    if (keywords) {
      filterOptions.keywords = { $like: `%${keywords}%` };
    }

    const sortingOptions: { [key: string]: string } = {};
    if (sortField && sortOrder) {
      sortingOptions[sortField] = sortOrder;
    }

    const { count, rows: news } = await News.findAndCountAll({
      limit: parseInt(limit, 10),
      offset,
      where: filterOptions,
      order: Object.entries(sortingOptions),
      include: [
        {
          model: Image,
          required: false,
        },
        {
          model: Video,
          required: false,
        },
        {
          model: Comment,
          required: false,
          include: [
            {
              model: Like,
              required: false,
            },
            {
              model: Dislike,
              required: false,
            },
          ],
        },
      ],
    });

    res.status(200).json({
      page,
      limit,
      totalCount: count,
      totalPages: Math.ceil(count / parseInt(limit, 10)),
      newsData: news,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const deleteNews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const news = await News.findByPk(id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    await Image.destroy({ where: { newsId: news.id } });
    await Video.destroy({ where: { newsId: news.id } });
    await Comment.destroy({ where: { newsId: news.id } });
    await Like.destroy({ where: { newsId: news.id } });
    await Dislike.destroy({ where: { newsId: news.id } });

    await news.destroy();

    res.status(200).json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const news = await News.findByPk(id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    const createdComment = await Comment.create({
      comment,
      newsId: news.id,
    });

    res.status(201).json({ message: 'Comment created successfully', comment: createdComment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const likeComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const like = await Like.create({
      commentId: comment.id,
    });

    res.status(200).json({ message: 'Comment liked successfully', like });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const dislikeComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const dislike = await Dislike.create({
      commentId: comment.id,
    });

    res.status(200).json({ message: 'Comment disliked successfully', dislike });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



export default {
  createNews,
  updateNews,
  getNews,
  deleteNews,
  createComment,
  likeComment,
  dislikeComment,
};
