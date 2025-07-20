import { nanoid } from "nanoid";
import { Brand } from "../../../DB/models/brand.model.js";
import { Category } from "../../../DB/models/category.model.js";
import { Subcategory } from "../../../DB/models/subcategory.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import cloudinary from "../../utils/cloud.js"
import { Product } from "../../../DB/models/product.model.js";

export const createProduct = asyncHandler(async(req, res, next)=>{

    const category = Category.findById(req.body.category)
    if(!category) return next(new Error("category not found",{cause:404}))

    const subcategory = Subcategory.findById(req.body.subcategory)
    if(!subcategory) return next(new Error("category not found",{cause:404}))

    const brand = Brand.findById(req.body.brand)
    if(!brand) return next(new Error("category not found",{cause:404}))

    if(!req.files) return next(new Error("product images are required",{cause:400}))
    // create folder name 
    const  cloudFolder = nanoid() ;

    let images = [];
   // upload sub images
   for (const file of req.files.subImages) {
     const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path, //يُستخدم هذا المسار المؤقت لتمرير الملف إلى Cloudinary
        { folder: `${process.env.CLOUD_FOLDER_NAME}/products/${cloudFolder}` } 
        //folder: 'my_project_images': هذا يحدد المجلد داخل حساب Cloudinary حيث سيتم تخزين الصورة.
    );
     images.push({ id: public_id, url: secure_url });
   }
   // upload default images
   
   const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.defaultImage[0].path,
    { folder: `${process.env.CLOUD_FOLDER_NAME}/products/${cloudFolder}` 
})

  //public_id = ID لإدارة الصورة (حذف، تحديث).
  // secure_url = رابط مباشر لعرض الصورة في الموقع.
  // create product 
  const product = await Product.create({
    ...req.body, 
    cloudFolder, 
    createdBy: req.user._id,
    defaultImages:{url:secure_url, id:public_id},
    images
  })
  // send response 
  res.json({success: true, message:"product created successfuly"})     
})

export const deleteProduct = asyncHandler(async(req, res, next)=>{

  const product = await Product.findById(req.params.id);
  if (!product) return next(new Error("Product not found!", { cause: 404 }));

  if (req.user._id.toString() != product.createdBy.toString())
      return next(new Error("Not Authorized", { cause: 401 }));
  await product.deleteOne();
  // delete images from cloudinary 
  const ids = product.images.map((image) => image.id);
  ids.push(product.defaultImage.id);
  await cloudinary.api.delete_resources(ids);
  // delete folder 
  await cloudinary.api.delete_folder(
    `${process.env.CLOUD_FOLDER_NAME}/products/${product.cloudFolder}`);
  //send response
  return res.json({success:true, message:"Product deleted Successfuly"})
})

export const allProducts = asyncHandler(async(req, res, next)=>{

  const {sort, page, keyword, category, brand, subcategory} = req.query ;

  if (category && !(await Category.findById(category)))
    return next(new Error("Category not found!", { cause: 404 }));

 if (subcategory && !(await Subcategory.findById(subcategory)))
    return next(new Error("Subcategory not found!", { cause: 404 }));

 if (brand && !(await Brand.findById(brand)))
    return next(new Error("Brand not found!", { cause: 404 }));

  const results = await Product.find({...req.query })
        .sort(sort) 
        .paginate(page)
        .search(keyword);

  console.log(results)
  
  return res.json({success:true, results })
})