import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';

  export const createUser = async (req: Request, res: Response)=> {
    try {

      const { name, email, password, role } = req.body;

      // user email check
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists with the given email.' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
      });

      return res.status(201).json({ message:"created" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  export const editUser= async(req: Request, res: Response)=> {
    try {
  
      const { userId } = req.params;
      const { name, email, role } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      user.name = name;
      user.email = email;
      user.role = role;
      await user.save();

      return res.status(200).json({ message:"edit successful "});
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  export const editUserProfile = async(req: Request, res: Response)=> {
    try {
      const userId = parseInt(String(req.params.userId), 10);
      const { name, email } = req.body;

      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid userId' });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      user.name = name;
      user.email = email;
      await user.save();

      return res.status(200).json({ message:"edit profile successful"});
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }


export default { createUser, editUser, editUserProfile };