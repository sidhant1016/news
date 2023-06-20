import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import '../db';
import User from '../models/User';
import dotenv from 'dotenv'

dotenv.config({ path: './config.env' });



export const register = async (req: Request, res: Response) => {
    try {
      const { name, email, password, role } = req.body;
    
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

      return res.status(201).json({ message:"Register successful"});
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  export const login = async (req: Request, res: Response) =>{
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = jwt.sign({ id: user.id, role: user.role }, process.env.ACCESS_TOKEN!, {
        expiresIn: '10h',
      });

      return res.status(200).json({ token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }


export default { register,login};