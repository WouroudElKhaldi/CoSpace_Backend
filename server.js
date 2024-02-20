import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connect from "./config/config.js";
import cookieParser from "cookie-parser";
import amenitiesRouter from "./routes/amenitiesRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";
import ratingRouter from "./routes/ratingRoutes.js";
import reservationRouter from "./routes/reservationRoutes.js";
import rulesRouter from "./routes/rulesRoutes.js";
import spaceImagesRouter from "./routes/spaceImagesRoutes.js";
import spaceRouter from "./routes/spaceRoutes.js";
import userRouter from "./routes/userRoutes.js";
import cityRouter from "./routes/cityRoutes.js";
import eventRouter from "./routes/eventsRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import offerRouter from "./routes/offerRoutes.js";
import subscribedUserRouter from "./routes/subscribedUserRoutes.js";
import serviceRouter from "./routes/serviceRoutes.js";
import contactRouter from "./routes/conatctRoutes.js";

dotenv.config();

const PORT = process.env.PORT || 2024;
const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use("/images", express.static("images"));

const corsOption = {
  origin: process.env.FRONT_END_PATH,
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cookieParser());
app.use(cors(corsOption));
app.use("/amenities", amenitiesRouter);
app.use("/category", categoryRouter);
app.use("/city", cityRouter);
app.use("/event", eventRouter);
app.use("/notification", notificationRouter);
app.use("/offer", offerRouter);
app.use("/rating", ratingRouter);
app.use("/reservation", reservationRouter);
app.use("/service", serviceRouter);
app.use("/rules", rulesRouter);
app.use("/space/image", spaceImagesRouter);
app.use("/space", spaceRouter);
app.use("/subUser", subscribedUserRouter);
app.use("/user", userRouter);
app.use("/contact", contactRouter);

app.listen(PORT, () => {
  connect();
  console.log(`running on port: ${PORT}`);
  if (PORT === 2024) {
    console.log(
      "ERROR: issue reading port from process.env. Continue with caution! ..."
    );
  }
});
