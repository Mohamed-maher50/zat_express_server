import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import "colors";
import compression from "compression";
import cors from "cors";
import bodyParser from "body-parser";
import toobusy from "toobusy-js";

import ApiError from "./utils/apiError.js";
import globalError from "./middlewares/errorMiddleware.js";
import mountRoutes from "./routes/index.js";
import { webhookCheckout } from "./controllers/orderService.js";
import dbConnection from "./config/database.js";

dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
// DB Connection
dbConnection();

// Initialize Express app
const app = express();

// CORS Middleware
app.use(cors());
app.options("*", cors());
app.enable("trust proxy");
// toobusy.maxLag(70); // جرب تزوده شوية
// // Toobusy middleware for server load management
// app.use((req, res, next) => {
//   if (toobusy()) {
//     next(new ApiError("I'm busy right now, sorry.", 503));
//   } else {
//     next();
//   }
// });

// Webhook endpoint (must be before body parser JSON middleware)
app.post(
  "/webhook-checkout",
  bodyParser.raw({ type: "application/json" }),
  webhookCheckout
);

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Static files
app.use(express.static(path.join(__dirname, "uploads")));

// Morgan logging middleware (development only)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Compression middleware
app.use(compression());

// Mount all routes
mountRoutes(app);
const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  console.log("Lag:", toobusy.lag());
  res.json({ message: `server is running in PORT: ${PORT}` });
});
// 404 - Route not found
app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global error handler
app.use(globalError);

// Start server

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`.green);
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  server.close();
  toobusy.shutdown();
  process.exit();
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(() => {
    process.exit(1);
  });
});
