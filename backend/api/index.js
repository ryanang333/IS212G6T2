import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import staffRoutes from './routes/staffRoutes.js';
import arrangementRequestsRoutes from './routes/arrangementRequestsRoutes.js';
import connectDB from '../config/db.config.js'; 
import setupAutoRejectCronJob from './utils/cronJob.js';
// import session from 'express-session';
// import RedisStore from 'connect-redis';
// import { createClient } from 'redis';

dotenv.config();

connectDB();

const app = express();

const corsOptions = {
  origin: process.env.ORIGIN,
};


// const redisClient = createClient({
//     url: process.env.REDIS_URL
// });

// redisClient.on('error', (err) => console.error('Redis Client Error', err));

// async function initializeRedis() {
//     await redisClient.connect();
// }
// initializeRedis();

// app.use(session({
//     store: new RedisStore({ client: redisClient }),
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         secure: false,       
//         httpOnly: true,
//         maxAge: 1000 * 60 * 30
//     }
// }));

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.post('/login', (req, res) => {
//   const { staffid } = req.body;


//   if (staffid === "staffid") {
//       req.session.user = { username };
//       res.send("Logged in successfully!");
//   } else {
//       res.status(401).send("Invalid credentials");
//   }
// });

// app.get('/home', (req, res) => {
//   if (!req.session.user) {
//       return res.status(401).send("Unauthorized: Please log in");
//   }
//   res.send(`Welcome ${req.session.user.username}, to your dashboard!`);
// });

// app.post('/logout', (req, res) => {
//   req.session.destroy((err) => {
//       if (err) {
//           return res.status(500).send("Failed to log out");
//       }
//       res.clearCookie("connect.sid");
//       res.send("Logged out successfully");
//   });
// });


app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "hello!" });
});

app.use('/staff', staffRoutes);
app.use('/arrangementRequests', arrangementRequestsRoutes);

setupAutoRejectCronJob();

app.listen(process.env.PORT, () => {
  console.log(`Server ready on port ${process.env.PORT}`);
});

export default app;
