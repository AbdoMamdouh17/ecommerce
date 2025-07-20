import { Cart } from "../../../DB/models/cart.model.js";
import { Coupon } from "../../../DB/models/coupon.model.js";
import { Order } from "../../../DB/models/order.model.js";
import { Product } from "../../../DB/models/product.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import createInvoice from "../../utils/pdfinvoice.js";
import cloudinary from "../../utils/cloud.js";
import path from "path"
import { fileURLToPath } from "url"
import Stripe from "stripe"

import { clearCart, updateStock } from "./order.service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const createOrder = asyncHandler(async(req, res, next)=>{
    const {address, phone, payment, coupon} = req.body
    //check coupon 
    let checkCoupon; 
    if(coupon){
        checkCoupon = await Coupon.findOne({
            name: coupon,
            expiredAt: {$gt: Date.now()}
        });
    if(!checkCoupon) return next(new Error("Invalid Token", {cause:400}))    
    }  
    // get products from cart 
    const cart = await Cart.findOne({user: req.user._id})
    const products = cart.products;
    if(products.length < 1) return next(new Error("Empty products")) 
     
    let orderProducts = [];
    let orderPrice = 0; 

    for (let i = 0; i < products.length; i++) {
        const product = await Product.findById(products[i].productId);
        if (!product) 
            return next(new Error(`${products[i].productId} product not found!`));

        if (!product.inStock(products[i].quantity)) 
                return next(
                    new Error(
                        `Product out stock, only ${product.availableItems} are available!`
                    )
                );
        orderProducts.push({
            name: product.name,
            quantity: products[i].quantity,
            itemPrice: product.finalPrice,
            totalPrice: product.finalPrice * products[i].quantity,
            productId: product._id,
        });
                
        orderPrice += product.finalPrice * products[i].quantity;           
        }
    // create order in db 
    const order = await Order.create({
        user: req.user._id,
        address,
        phone,
        payment,
        products: orderProducts,
        price: orderPrice,
        coupon: {
            id: checkCoupon?._id,
            name: checkCoupon?.name,
            discount: checkCoupon?.discount,
        },
    });

    // create invoice 
    const user = req.user
    const invoice = {
        shipping: {
          name: user.userName,
          address:order.address,
          country: "Egypt",
        },
        items: order.products,
        subtotal: order.price,
        paid: order.finalPrice,
        invoice_nr: order._id,
      };

    const pdfPath = path.join(__dirname,`./../../tempInvoicies/${order._id}.pdf`)
      
    createInvoice(invoice,pdfPath)

    // upload cloudinary 
    const {secure_url, public_id} = await cloudinary.uploader.upload(
        pdfPath,
        {folder:`${process.env.CLOUD_FOLDER_NAME}/order/invoices`}
    )
    order.invoice ={url: secure_url, id: public_id }
    await order.save();

    //update Stock 
    updateStock(order.products,true)
    //clear cart 
    clearCart(user._id)

    if(payment === "visa") {    

        // stripe getway
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        // coupon stripe
        let couponExisted ; 
        if(order.coupon.name){
            couponExisted = await stripe.coupons.create({
                percent_off: order.coupon.discount,
                duration: 'once',
            })
        }
        console.log(`${req.protocol}://${req.headers.host}/example.html`)
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode:'payment',
            metadata:{order_id:order._id.toString()},
            success_url:`${req.protocol}://${req.headers.host}/example.html`, 
            cancel_url:`${req.protocol}://${req.headers.host}/example2.html`,
            line_items: order.products.map((item)=>{
                return {
                    price_data:{
                        currency:'egp',
                        product_data:{
                            name:item.name,
                        },
                        unit_amount:item.totalPrice * 100
                    },
                    quantity:item.quantity
                }
            }),
            discounts: couponExisted ? [{coupon: couponExisted.id}] : [],
            
        })
        // send response
        return res.json({success:true, url:session.url})
    }
    //send response 
    return res.json({success:true, results:{ order } })
})

export const cancelsOrder = asyncHandler(async(req, res, next)=>{
    const order = await Order.findById(req.params.id);
    if (!order) return next(new Error("Invalid order id!", { cause: 400 }));
    
    // check status
    if (order.status === "delivered" || order.status === "shipped" || order.status === "cancelled")
        return next(new Error("Can not cancel the order!"));
    //cancel order
    order.status = "cancelled"; 
    await order.save()
    // update stock 
    updateStock(order.products,false)
    //send response
    return res.json({ success:true, message:" Order canceled !"})
})


export const webhookHandler = asyncHandler(async(req, res, next)=>{
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    console.log(sig)
    const endpointSecret = process.env.ENDPOINT_SECRET
    let event; 
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
        console.log(event)
    } catch (error) {
        return res.status(400).send(`Webhook Error: ${error.message}`)
    }
    if(event.type === 'checkout.session.completed') {
        // change order status   
        console.log("Checkout session completed event received");

       const orderId = event.data.object.metadata.order_id
       await Order.updateOne(
            {_id: orderId},
            {status: "visa paid"}
        )
        console.log("visa paid")
        return;
    }
    else {
       const orderId = event.data.object.metadata.order_id
       await Order.updateOne(
            {_id: orderId},
            {status: "failed to pay"}
        )
        return;
    }
})
