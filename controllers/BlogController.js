import { CatchAsyncErrors } from "../middlewares/CatchAsyncErrors.js";
import ErrorHandler from "../middlewares/Error.js";
import { Blog } from "../models/BlogSchema.js";
import cloudinary from "cloudinary";

export const BlogPost = CatchAsyncErrors(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Blog Main Image is Mandatory!", 400));
    }
    const { mainImage, paraOneImage, paraTwoImage, paraThreeImage } = req.files;
    if(!mainImage) {
        return next(new ErrorHandler("Blog Main Image is Mandatory!", 400));
    }
    const allowedFormats = [ "image/png", "image/jpeg", "image/webp" ];
    if(
        !allowedFormats.includes(mainImage.mimetype) ||
        (paraOneImage && !allowedFormats.includes(paraOneImage.mimetype)) ||
        (paraTwoImage && !allowedFormats.includes(paraTwoImage.mimetype)) ||
        (paraThreeImage && !allowedFormats.includes(paraThreeImage.mimetype))
    )   {
        return next(
            new ErrorHandler(
                "Invalid File Type. Only JPG, PNG and WEBP Formats are allowed", 400)
            );
    }
    const { 
        title, 
        intro, 
        paraOneDescription, 
        paraOneTitle, 
        paraTwoDescription, 
        paraTwoTitle, 
        paraThreeDescription, 
        paraThreeTitle,
        category,
        Published,
        } = req.body;

    const createdBy = req.user._id;
    const authorName = req.user.Name;
    const authorAvatar = req.user.Avatar.url;

    if(!title || !category || !intro) {
        return next(
            new ErrorHandler("Title, Intro and Category are required fields!", 400)
        );
    }

    const uploadPromises = [
        cloudinary.uploader.upload(mainImage.tempFilePath),
        paraOneImage
        ? cloudinary.uploader.upload(paraOneImage.tempFilePath)
        : Promise.resolve(null),
        paraTwoImage
        ? cloudinary.uploader.upload(paraTwoImage.tempFilePath)
        : Promise.resolve(null),
        paraThreeImage
        ? cloudinary.uploader.upload(paraThreeImage.tempFilePath)
        : Promise.resolve(null),
    ];

    const [mainImageRes, paraOneImageRes, paraTwoImageRes, paraThreeImageRes] = 
    await Promise.all(uploadPromises);

    if(
        !mainImageRes || mainImageRes.error || 
        (paraOneImage && (!paraOneImageRes || paraOneImageRes.error)) ||
        (paraTwoImage && (!paraTwoImageRes || paraTwoImageRes.error)) ||
        (paraThreeImage && (!paraThreeImageRes || paraThreeImageRes.error))
    )   {
        return next(
            new ErrorHandler("Error occured while uploading one or more images!", 500)
        );
    }
    
    const BlogData = {
        title,
        intro, 
        paraOneDescription, 
        paraOneTitle, 
        paraTwoDescription, 
        paraTwoTitle, 
        paraThreeDescription, 
        paraThreeTitle,
        category,
        createdBy,
        authorAvatar,
        authorName,
        Published,
        mainImage: {
            public_id: mainImageRes.public_id,
            url: mainImageRes.secure_url,
        },
    };
    if(paraOneImageRes) {
        BlogData.paraOneImage = {
            public_id: paraOneImageRes.public_id,
            url: paraOneImageRes.secure_url,
        };
    }
    if(paraTwoImageRes) {
        BlogData.paraTwoImage = {
            public_id: paraTwoImageRes.public_id,
            url: paraTwoImageRes.secure_url,
        };
    }
    if(paraThreeImageRes) {
        BlogData.paraThreeImage = {
            public_id: paraThreeImageRes.public_id,
            url: paraThreeImageRes.secure_url,
        };
    }
    const BlogEntry = await Blog.create(BlogData);
    res.status(200).json({
        success: true,
        message: "Blog Uploaded Successfully!",
        BlogEntry,
    });
});

export const DeleteBlog = CatchAsyncErrors( async (req, res, next) => {
    const { id } = req.params;
    const Blogd = await Blog.findById(id);
    if(!Blogd) {
        return next(new ErrorHandler("Blog not found!", 404));
    }
    await Blogd.deleteOne();
    res.status(200).json({
        success: true,
        message: "Blog Deleted Successfully!",
    });
});

export const GetAllBlogs = CatchAsyncErrors(async (req, res, next) => {
    const AllBlogs = await Blog.find({ Published: true });
    res.status(200).json({
        success: true,
        AllBlogs,
    });
});

export const GetSingleBlog = CatchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const Blogg = await Blog.findById(id);
    if(!Blogg) {
        return next(new ErrorHandler("Blog not found", 404));
    }
    res.status(200).json({
        success: true,
        Blogg,
    });
});

export const GetMyBlogs = CatchAsyncErrors(async (req, res, next) => {
    const createdBy = req.user._id;
    const Blogs = await Blog.find({ createdBy });
    res.status(200).json({
        success: true,
        Blogs,
    });
});

export const UpdateBlog = CatchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    let blog = await Blog.findById(id);
    if(!blog) {
        return next(new ErrorHandler("Blog not found!", 404));
    }
    const NewBlogData = {
        title: req.body.title,
        intro: req.body.intro,
        paraOneDescription: req.body.paraOneDescription,
        paraOneTitle: req.body.paraOneTitle, 
        paraTwoDescription: req.body.paraTwoDescription, 
        paraTwoTitle: req.body.paraTwoTitle, 
        paraThreeDescription: req.body.paraThreeDescription, 
        paraThreeTitle: req.body.paraThreeTitle,
        category: req.body.category,
        Published: req.body.Published,
    };
    if(req.files) {
        const {mainImage, paraOneImage, paraTwoImage, paraThreeImage} = req.files;
        const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
        if((mainImage && !allowedFormats.includes(mainImage.mimetype)) ||
            (paraOneImage && !allowedFormats.includes(paraOneImage.mimetype)) ||
            (paraTwoImage && !allowedFormats.includes(paraTwoImage.mimetype)) ||
            (paraThreeImage && !allowedFormats.includes(paraThreeImage.mimetype))
        ) {
            return next(
                new ErrorHandler("Invalid File Format. Only JPG, PNG and WEBP Formats are allowed", 400)
            );
        }
        if(req.files && mainImage) {
            const BlogMainImageId = blog.mainImage.public_id;
            await cloudinary.uploader.destroy(BlogMainImageId);
            const NewBlogMainImage = await cloudinary.uploader.upload(mainImage.tempFilePath);
            
            NewBlogData.mainImage = {
                public_id: NewBlogMainImage.public_id,
                url: NewBlogMainImage.secure_url,
            };
        }
        
        if(req.files && paraOneImage) {
            if(blog.paraOneImage) {
                const BlogParaOneImageId = blog.paraOneImage.public_id;
                await cloudinary.uploader.destroy(BlogParaOneImageId);
            }
            const NewBlogParaOneImage = await cloudinary.uploader.upload(
                paraOneImage.tempFilePath
            );
            NewBlogData.paraOneImage = {
                public_id: NewBlogParaOneImage.public_id,
                url: NewBlogParaOneImage.secure_url,
            };
        }
        if(req.files && paraTwoImage) {
            if(blog.paraTwoImage) {
                const BlogParaTwoImageId = blog.paraTwoImage.public_id;
                await cloudinary.uploader.destroy(BlogParaTwoImageId);
            }
            const NewBlogParaTwoImage = await cloudinary.uploader.upload(
                paraTwoImage.tempFilePath
            );
            NewBlogData.paraTwoImage = {
                public_id: NewBlogParaTwoImage.public_id,
                url: NewBlogParaTwoImage.secure_url,
            };
        }
        if(req.files && paraThreeImage) {
            if(blog.paraThreeImage) {
                const BlogParaThreeImageId = blog.paraThreeImage.public_id;
                await cloudinary.uploader.destroy(BlogParaThreeImageId);
            }
            const NewBlogParaThreeImage = await cloudinary.uploader.upload(
                paraThreeImage.tempFilePath
            );
            NewBlogData.paraThreeImage = {
                public_id: NewBlogParaThreeImage.public_id,
                url: NewBlogParaThreeImage.secure_url,
            };
        }
    }
    blog = await Blog.findByIdAndUpdate(id, NewBlogData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    res.status(200).json({
        success: true,
        message: "Blog Updated Successfully!",
        blog,
    });
});

















