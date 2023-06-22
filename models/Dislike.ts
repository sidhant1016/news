import { Model, DataTypes } from 'sequelize';
import sequelize from '../db';

class Dislike extends Model {
  public id!: number;
  public commentId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Dislike.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    commentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'dislikes',
  }
);

export default Dislike;
