import dotenv from "dotenv";
import { connectDB } from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
  path: "./env",
});
connectDB()
  .then(() => {
    app.on("error", (err) => {
      console.log("Error in connectDB", err);
      throw err;
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(`server is runing at port :${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection fail", err);
  });
