import { Model, DataTypes } from 'sequelize';
import sequelize from '../db';


class Comment extends Model {
  public id!: number;
  public newsId!: number;
  public userId!: number;
  public comment!: string;
 

  static associate(models: any) {
    Comment.belongsTo(models.News, { foreignKey: 'newsId', as: 'news' });
    Comment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }
}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    newsId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Comment',
  }
);

export default Comment;
