import ImageKit from "imagekit-javascript";
import fs from "fs";

var imagekit = new ImageKit({
  publicKey: process.env.CLOUD_PUBLIC_KEY,
  urlEndpoint: process.env.CLOUD_URL_ENDPOINT,
});

const uploadOnCloud = async (localFilePath) => {
  try {
    if (!localFilePath) return console.log("Local File path not given");
    const response = await imagekit.upload(
      {
        file: localFilePath,
      },
      function (err, result) {
        console.log(arguments);

        console.log(
          imagekit.url({
            src: result.url,
          })
        );
      }
    );
    console.log("File is uploaded on cloud", response.result);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadOnCloud };
