import { Model, DataTypes } from 'sequelize';
import sequelize from '../db';
import News from './News';
import Like from './Like';
import Comment from './Comment';

class User extends Model {
  static findById(id: any) {
    throw new Error('Method not implemented.');
  }
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: 'Admin' | 'Editor' | 'Visitor';

  static associate(models: any) {
    User.hasMany(models.News, { foreignKey: 'userId', as: 'news' });
  }
}


User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('Admin', 'Editor', 'Visitor'),
      allowNull: false,
      defaultValue: 'Visitor',
    },
  },
  {
    sequelize,
    modelName: 'User',
  },
);
User.hasMany(News, { foreignKey: 'userId', as: 'news' });

export default User;
