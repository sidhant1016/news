import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv'
import User from '../models/User';
import redisClient from "../redis"

dotenv.config({ path: './config.env' });

declare global {
    namespace Express {
      interface Request {
        user?: any;
        
        
      }
    }
  }



  
  // Middleware to authenticate  user
  export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Authorization header missing' });
      }
  
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN!) as jwt.JwtPayload;
      req.user = decodedToken;
  
      // Check if userId is present in Redis
      const userId = decodedToken.userId;
      const isUserIdPresent = await redisClient.exists(userId);
      if (!isUserIdPresent) {
        return res.status(401).json({ message: 'User not found' });
      }
  
      // Check if token is present in Redis
      const redisToken = await redisClient.get(userId);
      if (redisToken !== token) {
        return res.status(401).json({ message: 'Invalid token' });
      }
  
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
  
  
  
  // check if the user is an admin
  export const checkAdminRole = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. You are not an Admin ' });
    }
    next();
  };
  
    
  //check if the user is an editor 
  export const checkEditorRole = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'Editor') {
      return res.status(403).json({ message: 'Access denied. You are not an Editor ' });
    }
    next();
  };

  //check if the user is an visitor
  export const checkVisitorRole = (Req:Request,res:Response,next:NextFunction)=>{
    if (Req.user?.role !== 'Visitor') {
      return res.status(403).json({ message: 'Access denied. You are not an Visitor ' });
    }
    next();
  };

export default { authenticateUser, checkAdminRole,checkEditorRole,checkVisitorRole}

