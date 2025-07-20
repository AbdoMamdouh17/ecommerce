import { Category } from "../../../DB/models/category.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import cloudinary from "../../utils/cloud.js";
import {Brand} from "../../../DB/models/brand.model.js"
import slugify from "slugify";

export const createBrand = asyncHandler(async (req, res, next) => {
    const { categories,name } = req.body; 
    categories.forEach(async (categoryId) => {
        const category = await Category.findById(categoryId);
        if (!category) {
            return next(
                new Error(`Category ${categoryId} not found!`, { cause: 404 })
            );
        }
    });

    if(!req.file)
        return next(new Error("Brand image is required",{cause:400}));
    const { secure_url, public_id} = await cloudinary.uploader.upload(
        req.file.path,
        {folder:`${process.env.CLOUD_FOLDER_NAME}/brands`}
    )

    const brand = await Brand.create({
        name, 
        slug:slugify(req.body.name),
        createdBy:req.user._id,
        image:{id:public_id,url: secure_url},
    });
    // save brand in each category 
    categories.forEach(async(categoryId)=>{
       await Category.findByIdAndUpdate(categoryId,{$push:{brands:brand._id}})
        console.log(brand._id)
    })
    return res.json({success:true,message:"brand created successfully!"})
})

export const updateBrand = asyncHandler(async(req, res, next)=>{
    const brand = await Brand.findById(req.params.id)
    if(!brand) return next(new Error("Brand not found!",{cause:404}))

     if(req.file){
        const{public_id, secure_url}= await cloudinary.uploader.upload(
            req.file.path,
            {public_id: brand.image.id }
         ) 
          brand.image = {public_id, secure_url}
         }
         
    brand.name = req.body.name ? req.body.name : subcategory.name;
    brand.slug = req.body.name ? slugify(req.body.name) : subcategory.slug;
    await brand.save();
        
    return res.status(201).json({success:true,message:"brand updated successfully!"})

})

export const deleteBrand = asyncHandler(async(req, res, next)=>{
    const brand = await Brand.findByIdAndDelete(req.params.id)
    if(!brand) return next(new Error("Brand not found!",{cause:404}))

    await cloudinary.uploader.destroy(brand.image.id);

    await Category.updateMany({},{$pull:{brands: brand._id} });

    return res.json({ success: true, message: "brand deleted successfully!" });

})

export const aLLBrands = asyncHandler(async(req, res, next)=>{
    const result = await Brand.find(); 
   return res.json({success:true ,result})
})