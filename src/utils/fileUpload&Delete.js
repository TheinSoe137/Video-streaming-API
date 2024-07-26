// import ImageKit from "imagekit-javascript";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({
  path: "./env",
});
// const imagekit = new ImageKit({
//   publicKey: process.env.CLOUD_PUBLIC_KEY,
//   privateKey: process.env.CLOUD_PRIVATE_KEY,
//   urlEndpoint: process.env.CLOUD_URL_ENDPOINT,
// });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const uploadOnCloud = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfull
    console.log("file is uploaded on cloudinary ", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    // console.log(error, "error in uploding file on cloud"); // remove the locally saved temporary file as the upload operation got failed
    return error;
  }
};

const deleteFromCloud = async (public_id, resource_type = "image") => {
  if (resource_type === "video") {
    try {
      const result = await cloudinary.uploader.destroy(public_id, {
        resource_type: "video",
      });
      console.log(" Video Deleted from cloud");
      return result;
    } catch (error) {
      return error;
    }
  } else {
    try {
      const result = await cloudinary.uploader.destroy(public_id, {
        resource_type: "image",
      });
      console.log("Image Deleted from cloud");
      return result;
    } catch (error) {
      return error;
    }
  }
};

export { uploadOnCloud, deleteFromCloud };
