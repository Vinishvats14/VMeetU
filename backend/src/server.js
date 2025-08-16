import express from 'express';
import dotenv from 'dotenv';
import {connectDB} from './lib/db.js';
import authRoutes from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';

import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 1410;

const __dirname = path.resolve();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // allow frontend to send cookies
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json());
app.use(cookieParser()); // Ensure cookie parser is used to read cookies that comes from frontend

app.get('/', (req, res) => {
  res.json({ message: "Backend server is running 🚀" });
});


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);

app.listen(PORT ,()=>{
    console.log(`Server is running on port ${PORT}`) ;   // backtick is used for dynamicstring and $karke humne javascript vali cheez li h isliye backtick use kiya
    connectDB();
})