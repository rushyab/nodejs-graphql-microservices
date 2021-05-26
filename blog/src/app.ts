import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { GATEWAY_ORIGIN } from './constants/common';
import getClientURLs from './utils/getClientURLs';
import LoggerService from './utils/logger';

const app = express();

const logger = new LoggerService('BlogApp');

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    const allowedOrigins = getClientURLs();
    if (!origin || origin === GATEWAY_ORIGIN || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: [
    'Access-Control-Allow-Headers',
    'Content-Type',
    'Origin',
    'X-Requested-With',
    'Accept',
    'Authorization',
  ],
};

app.use(express.json());

app.use(cookieParser());

app.use(cors(corsOptions));

// This error handling middleware function must be at very bottom of the stack.
app.use((err: any, req: Request, _res: Response, next: NextFunction) => {
  logger.error('error', {
    method: req.method,
    message: err.message,
    originalUrl: req.originalUrl,
    ip: req.ip,
    useragent: req.headers['user-agent'],
  });
  next(err);
});

export default app;
