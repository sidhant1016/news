import { Model, DataTypes } from 'sequelize';
import sequelize from '../db';
import News from './News';

class Video extends Model {
  static find(arg0: { newsId: any; }) {
    throw new Error('Method not implemented.');
  }
  public id!: number;
  public url!: string;
  public newsId!: number;

  static associate(models: any) {
    Video.belongsTo(models.News, { foreignKey: 'newsId', as: 'news' });
  }
}

Video.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    newsId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'videos',
  }
);


export default Video;
