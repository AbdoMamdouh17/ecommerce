import { Schema , Types, model  } from "mongoose";

const productSchema = new Schema({
    name: {type:String, required:true, min:2, max:20 },
    description:{type:String, required:true } , 
    images: [
        {id: { type: String },
         url: { type: String }
        }],
    defaultImage:  { id: { type: String },
    url: { type: String } },
    availableItems: { type: Number, min: 1, required: true },
    soldItems: { type: Number, default: 0 },
    price: { type: Number, min: 1, required: true },
    discount: { type: Number, min: 1, max: 100 },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    category: { type: Types.ObjectId, ref: "Category", required: true },
    subcategory: { type: Types.ObjectId, ref: "Subcategory", required: true },
    brand: { type: Types.ObjectId, ref: "Brand", required: true }, 
    cloudFolder:{type:String, unique:true, required:true },
    averageRate:{type: Number, min: 1, max: 5 },
},{timestamps:true,
    strictQuery:true,
    toJson:{virtuals:true},
    toObject:{virtuals:true}}) 

productSchema.virtual('review', {
    ref:"Review", 
    localField:"_id",
    foreignField:"productId",
})


productSchema.virtual('finalPrice').get(function() {
    return Number.parseFloat(
        this.price - (this.price * (this.discount || 0)) / 100
    ).toFixed(2);
});

// query helper

productSchema.query.paginate = function(page){
   page = page <1 || isNaN(page) || !page?1 : page ;
   const limit = 1
   const skip = limit * (page-1)

   return this.skip(skip).limit(limit)
}

productSchema.query.search = function(keyword){
    if(keyword){
        return this.find({name:{$regex: keyword, $options: "i"}})
    }
    return this; 
}

productSchema.methods.inStock = function(requiredQuantity){
    return this.availableItems >= requiredQuantity ? true : false
}

export const Product = model('Product',productSchema)