import { asyncHandler } from "../../utils/asyncHandler.js";
import cloudinary from "../../utils/cloud.js"
import slugify from "slugify";
import{Category} from"../../../DB/models/category.model.js"

export const createCategory = asyncHandler(async(req, res, next)=>{
// check file 
if(!req.file) return next(new Error("Category image is required",{cause:400}))

    const{public_id, secure_url}= await cloudinary.uploader.upload(
        req.file.path,
        {folder:`${process.env.CLOUD_FOLDER_NAME}`}
    )
    console.log(req.file.path)
    // sotre data in db
    await Category.create({
        name:req.body.name,
        slug:slugify(req.body.name),
        createdBy:req.user._id,
        image:{id: public_id,url:secure_url},
    })

    return res.status(201).json({success:true,message:"every thing is okay"})
});

export const updateCategory = asyncHandler(async(req, res, next)=>{
    
    const category = await Category.findById(req.params.id)
    if(!category) return next((new Error("Category not found!",{cause:404})))

    if(req.user._id.toString() !== category.createdBy._id.toString())
       return next((new Error("Not allowed to update the category ")))

    // Check if there is a file sent
    if(req.file){
        const{public_id, secure_url}= await cloudinary.uploader.upload(
            req.file.path,
            {public_id: category.image.id }
        ) 
        category.image = {public_id, secure_url}
    }

    category.name = req.body.name ? req.body.name : category.name;
    category.slug = req.body.name ? slugify(req.body.name) : category.slug;
    await category.save();

    return res.status(201).json({success:true,message:"category updated successfully!"})
})

export const deleteCategory = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new Error("category not found!", { cause: 404 }));

    if (category.createdBy.toString() !== req.user._id.toString())
        return next(new Error("Not allowed to delete!"));

    await Category.findOneAndDelete(req.params.id);
    // delete image category from cloudinary
    await cloudinary.uploader.destroy(category.image.id);

    return res.json({ success: true, message: "category deleted successfully!" });
});

export const allCategory = asyncHandler(async (req, res, next) => {
    const results = await Category.find().populate("subcategory");
    console.log(results); 
    return res.json({ success: true, results }); 
});




