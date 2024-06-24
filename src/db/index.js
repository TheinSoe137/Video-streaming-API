import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import express from "express";
const app = express();
export const connectDB = async () => {
  try {
    const connectInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(`DB is connected `, connectInstance.connection.host);
    app.on("error", (error) => {
      console.log("Cant connect to DB", error);
    });
    app.listen(process.env.PORT, () => {
      `App is listening on ${process.env.PORT}`;
    });
  } catch (error) {
    console.log("Error in Running connection", error);
    throw error;
  }
};
