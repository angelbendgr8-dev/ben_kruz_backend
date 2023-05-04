const cloudinary = require("cloudinary").v2;
const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } =
  process.env;

const cloud = cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const uploadVideo = async (file, public_id) => {
  try {
    const video = await cloudinary.uploader.upload(file.path, {
      resource_type: "video",
      chunk_size: 6000000,
      upload_preset: "kruzvideos",
      public_id: public_id,
      eager_async: true,
      use_filename: true,
      unique_filename: false,
      notification_url: "https://kruz-back.onrender.com/api/videos/upload"
    });
    console.log(video);
    return { video };
  } catch (error) {
    console.log(error);
    return error;
  }
};
const uploadThumbnail = async (thumbNail,public_id) => {
  try {
    const thumb = await cloudinary.uploader.upload(thumbNail.path, {
      folder: "thumbnails",
      resource_type: "image",
      public_id: public_id,
      use_filename: true,
      unique_filename: false,
    });
    
    return { thumb };
  } catch (error) {
    return error;
  }
};
const uploadShort = async (file,public_id) => {
  try {
    const video = await cloudinary.uploader.upload(file.path, {
      resource_type: "video",
      chunk_size: 6000000,
      upload_preset: "kruzshorts",
      public_id: public_id,
      use_filename: true,
      unique_filename: false,
      notification_url: "https://kruz-back.onrender.com/api/videos/upload"
    });

    return { video };
  } catch (error) {
    console.log(error);
    return error;
  }
};
const deleteVideo = async (public_id) => {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    return error;
  }
};

// upload only image
const uploadImage = async (image_file, folder) => {
  const image = await cloudinary.uploader.upload(image_file.path, {
    folder: folder,
    use_filename: true,
    unique_filename: false,
    
  });
  return image;
};

module.exports = {
  uploadVideo,
  deleteVideo,
  uploadImage,
  uploadShort,
  uploadThumbnail,
};
