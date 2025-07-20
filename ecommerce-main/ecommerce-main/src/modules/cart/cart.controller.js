import { asyncHandler } from "../../utils/asyncHandler.js";
import { Cart } from "../../../DB/models/cart.model.js"
import { Product } from "../../../DB/models/product.model.js"

export const addToCart = asyncHandler(async(req, res, next)=>{

    const {productId, quantity} = req.body
    
    const product = await Product.findById(productId);
    if (!product) return next(new Error("product not found!"));

    if (!product.inStock(quantity))
        return next(
        new Error(`Sorry, only ${product.availableItems} items are available!`));
        
        // check the product existence 
    const isProductInCart = await Cart.findOne({
        user: req.user._id,
        "products.productId": productId,
        });
    if (isProductInCart) {
       const theProduct = isProductInCart.products.find(
       (prd) => prd.productId.toString() === productId.toString() );
        if (product.inStock(theProduct.quantity + quantity)) {
        theProduct.quantity = theProduct.quantity + quantity;
        await isProductInCart.save();

        return res.json({ success: true, results: { cart: isProductInCart } });
        } else {
            return next(new Error(`sorry, only ${product.availableItems} items are available!`));
        }
     }
    const cart = await Cart.findOneAndUpdate({
        user:req.user._id
    }, 
    {$push:{products:{ productId , quantity } } } ,
    {new : true}
)
return res.json({seccess:true ,results:{ cart }})
});

export const userCart = asyncHandler(async (req, res, next) => {
    if (req.user.role == "user") {
        const cart = await Cart.findOne({ user: req.user._id });
        console.log(cart)
        return res.json({ success: true, results: { cart } });
    }
    if (req.user.role == "admin" && !req.body.cartId) {
        return next(new Error("cart id is required!"));
    }
    const cart = await Cart.findById(req.body.cartId);
    return res.json({ success: true, results: { cart } });
});

export const updateCart = asyncHandler(async(req, res, next)=>{
    const {productId, quantity } = req.body

    const product = await Product.findById(productId);
    if (!product) return next(new Error("product not found!"));

    if (!product.inStock(quantity))
        return next(
        new Error(`Sorry, only ${product.availableItems} items are available!`));
    
    const cart = await Cart.findOneAndUpdate({
        user: req.user._id,
        "products.productId": productId
    },
    {"products.$.quantity": quantity},
    {new: true}
    )
    return res.json({ success:true, results:{ cart }})
});

export const removeFromCart = asyncHandler(async(req, res, next)=>{
    const {productId } = req.params
    
    const product = await Product.findById(productId);
    if (!product) return next(new Error("product not found!"));

    const cart = await Cart.findOneAndUpdate(
        {user:req.user._id},
        {$pull:{products:{ productId }}},
        { new: true}
    )
    return res.json({success: true,results: { cart }})
});


export const clearCart = asyncHandler(async(req, res, next)=>{
    const cart = await Cart.findOneAndUpdate(
        {user:req.user._id},
        {products:[]},
        { new: true}
    )
    return res.json({success: true, results:{ cart }})
})
