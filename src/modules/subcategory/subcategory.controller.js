import slugify from "slugify";
import { Category } from "../../../DB/models/category.model.js";
import { Subcategory } from "../../../DB/models/subcategory.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import cloudinary from "../../utils/cloud.js"

export const createSubcategory = asyncHandler(async (req, res, next) => {

    const category = await Category.findById(req.params.category);
    if (!category) return next(new Error("Category not found!", { cause: 404 }));

    if (!req.file) return next(new Error("Subcategory image is required!", { cause: 400 }));

    console.log(req.file); 
    
    const{public_id, secure_url}= await cloudinary.uploader.upload(
          req.file.path,
          {folder:`${process.env.CLOUD_FOLDER_NAME}/subcategory`}
      )
    console.log(req.file.path)
    // sotre data in db
    await Subcategory.create({
        name:req.body.name,
        slug:slugify(req.body.name),
        createdBy:req.user._id,
        image:{id: public_id,url:secure_url},
        category:req.params.category
    })

    return res.status(201).json({success:true,message:"sub category created successfully"})
});


export const updateSubcategory = asyncHandler(async(req, res, next)=>{

    const category = await Category.findById(req.params.category);
    if (!category) return next(new Error("Category not found!", { cause: 404 }));
    
    const subcategory = await Subcategory.findOne({_id:req.params.id,category:req.params.category})
    if(!subcategory) return next((new Error("sub Category not found!",{cause:404})))

    if(req.user._id.toString() !== subcategory.createdBy.toString())
       return next((new Error("Not allowed to update the sub category ")))

    // Check if there is a file sent
    if(req.file){
        const{public_id, secure_url}= await cloudinary.uploader.upload(
            req.file.path,
            {public_id: subcategory.image.id }
        ) 
        subcategory.image = {public_id, secure_url}
    }
    subcategory.name = req.body.name ? req.body.name : subcategory.name;
    subcategory.slug = req.body.name ? slugify(req.body.name) : subcategory.slug;
    await subcategory.save();

    return res.status(201).json({success:true,message:"subcategory updated successfully!"})
})



export const deleteSubcategory = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.category);
    if (!category) return next(new Error("category not found!", { cause: 404 }));
    
    const subcategory = await Subcategory.findOne({_id:req.params.id,category:req.params.category})
    if(!subcategory) return next((new Error("sub Category not found!",{cause:404})))

    if (subcategory.createdBy.toString() !== req.user._id.toString())
        return next(new Error("Not allowed to delete!"));

    await subcategory.deleteOne();
    // delete image category from cloudinary
    await cloudinary.uploader.destroy(subcategory.image.id);

    return res.json({ success: true, message: "subcategory deleted successfully!" });
});

export const getAllSubcategories = asyncHandler(async(req, res, next)=>{
    if(req.params.category){
        const result = await Subcategory.find({category: req.params.category})
        return res.json({success:true ,result})
    }
    const result = await Subcategory.find().populate([
        {path:"category",populate:{path:"createdBy"}},
        {path:"createdBy"}
    ])
    return res.json({success:true ,result})
})