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
    app.listen(3000, () => {
      console.log(`server is runing at port : 3000`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection fail", err);
  });
