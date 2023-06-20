import { Request, Response } from 'express';
import News from '../models/News';
import Image from '../models/Image';
import Video from '../models/Video';
import Joi from 'joi'

const newsschema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  newsDate: Joi.date().required(),
});

export const createNews = async (req: Request, res: Response) => {
  const { error} = newsschema.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  try {
    const { title, description, newsDate } = req.body;

    if (!req.files) {
      return res.status(400).json({  message: 'Invalid file upload' });
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
      const imageUrl = `http://localhost:2222/uploads/images/${file.filename}`;
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
      const videoUrl = `http://localhost:2222/uploads/videos/${file.filename}`;
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

    res.status(201).json({ message: 'News created successfully', news, images,videos });
  } catch (error) {
    console.error(error);
    res.status(500).json({  message: 'Internal server error' });
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

    // Update  news 
    news.title = title;
    news.description = description;
    news.newsDate = newsDate;

    // Update image 
    if (req.files && 'images' in req.files) {
      const imageFiles = (req.files as { [fieldname: string]: Express.Multer.File[] })['images'];

      const updatedImages = await Promise.all(
        imageFiles.map(async (file) => {
          const imageUrl = `http://localhost:2222/uploads/images/${file.filename}`;
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
          const videoUrl = `http://localhost:2222/uploads/videos/${file.filename}`;
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
    const { limit = 50, page = 1 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: news } = await News.findAndCountAll({
      limit: Number(limit),
      offset,
      include: [
        {
          model: Image,
          required: false, 
        },
        {
          model: Video,
          required: false, 
        },
      ],
    });

    res.status(200).json({
      page,
      limit,
      totalCount: count,
      totalPages: Math.ceil(count),
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
    await Image.findAll({ where: { newsId: news.id } });
    await Video.findAll({ where: { newsId: news.id } });
    res.status(200).json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export default {createNews,updateNews,getNews,deleteNews}