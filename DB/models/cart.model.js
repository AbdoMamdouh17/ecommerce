import {Types, Schema, model } from "mongoose"

const cartSchema = new Schema({
    products:[{
        productId:{type:Types.ObjectId, ref:"Product"},
        quantity:{type: Number, default: 1 }
    }],

    user:{type:Types.ObjectId, ref:"User", unique:true, require:true}
},{timestamps:true})

export const Cart = model('Cart',cartSchema)