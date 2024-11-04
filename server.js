import web from "./web.js";
import cloudinary from 'cloudinary';

cloudinary.v2.config({
    cloud_name: process.env.Cloudinary_KEY_Name,
    api_key: process.env.Cloudinary_API_Key,
    api_secret: process.env.Cloudinary_API_Secret,
})
web.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
