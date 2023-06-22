import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import Joi from "joi"

// Define Joi schemas for  validation
const createUserSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  role: Joi.string().valid('admin', 'editor', 'visitor').required(),
});

const editUserSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('admin', 'editor', 'visitor').required(),
});

const editUserProfileSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
});

  export const createUser = async (req: Request, res: Response)=> {
    try {
      const{error} = createUserSchema.validate(req.body)
      if(error){
        return res.status(400).json({ message: error.details[0].message });
      } 

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
      const { error } = editUserSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }
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

  export const editUserProfile = async (req: Request, res: Response) => {
    try {
      const userId = parseInt(String(req.params.userId), 10);
      const { error } = editUserProfileSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }
  
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid userId' });
      }
  
      const { name, email } = req.body; // Add variable declaration here
  
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      user.name = name;
      user.email = email;
      await user.save();
  
      return res.status(200).json({ message: "edit profile successful" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  
  export default { createUser, editUser, editUserProfile };
  
  
  
  
  


