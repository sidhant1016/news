import { Model, DataTypes } from 'sequelize';
import sequelize from '../db';
import User from './User';
import Image from './Image';
import Video from './Video';
import Like from './Like';
import Comment from './Comment';

class News extends Model {
  Image: number[] | undefined;
  Video: number[] | undefined;
  static findById(news_id: string) {
    throw new Error('Method not implemented.');
  }
  public id!: number;
  public title!: string;
  public description!: string;
  public newsDate!: Date;

  static associate(models: any) {
    News.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    News.hasMany(models.Image, { foreignKey: 'newsId', as: 'images' });
    News.hasMany(models.Video, { foreignKey: 'newsId', as: 'videos' });
    News.hasMany(models.Like, { foreignKey: 'newsId', as: 'likes' });
    News.hasMany(models.Comment, { foreignKey: 'newsId', as: 'comments' });
  }
}

News.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    newsDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'news',
  }
);
News.hasMany(Image, { foreignKey: 'newsId' });
News.hasMany(Video, { foreignKey: 'newsId' });

export default News;
