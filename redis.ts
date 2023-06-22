import Redis, { RedisOptions } from 'ioredis'
import dotenv from 'dotenv';
dotenv.config();


const redisOptions: RedisOptions = {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379', 10), // Parse the value as an integer
  };

const redisClient = new Redis(redisOptions);

redisClient.on("connect", () => {
    console.log("Redis Connected");
});

redisClient.on('error', (error) => {
    console.error('Redis connection error:', error);
  });
export default redisClient;