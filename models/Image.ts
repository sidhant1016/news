import { Model, DataTypes } from 'sequelize';
import sequelize from '../db';
import News from './News';
import { BelongsTo } from 'sequelize-typescript';

class Image extends Model {
  public id!: number;
  public url!: string;
  public newsId!: number;

  static associate(models: any) {
    Image.belongsTo(models.News, { foreignKey: 'newsId', as: 'news' });
  }
}

Image.init(
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
    tableName: 'images',
  }
);
export default Image;
