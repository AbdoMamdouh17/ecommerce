import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./DB/connection.js";
import authRouter from "./src/modules/auth/auth.router.js";
import categoryRouter from "./src/modules/category/category.router.js";
import subcategoryRouter from "./src/modules/subcategory/subcategory.router.js";
import brandRouter from "./src/modules/brand/brand.router.js";
import couponRouter from "./src/modules/coupon/coupon.router.js";
import productRouter from "./src/modules/products/products.router.js";
import cartRouter from "./src/modules/cart/cart.router.js";
import orderRouter from "./src/modules/order/order.router.js";
import morgan from "morgan";

import path from "path"; // استيراد مكتبة path

dotenv.config();

import cors from "cors";
import { CompressionStream } from "stream/web";
const app = express();
const port = process.env.PORT;

// CORS

// const whitelist = ["http://127.0.0.1:5500"]
// app.use((req, res, next) => {
//     console.log(req.headers.origin)
//     if(req.originalUrl.includes('/auth/activate_account')){
//         res.setHeader("Access-Control-Allow-Origin", "*")
//         res.setHeader("Access-Control-Allow-method", "GET")
//         return next()
//     }

//     if(!whitelist.includes(req.headers.origin)){
//         return next(new Error(" Blocked by Cors"))
//     }
//     res.setHeader("Access-Control-Allow-Origin", "*")
//     res.setHeader("Access-Control-Allow-Headers", "*")
//     res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
//     res.setHeader("Access-Control-Private-Network",true)

//     next()
// })

await connectDB();

app.use(cors()); // all access from every where

app.use(morgan("combined")); // for logging requests
app.use((req, res, next) => {
  if (req.originalUrl === "/order/webhook") {
    return next();
  }
  express.json()(req, res, next);
});

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "public")));

app.use("/auth", authRouter);
app.use("/category", categoryRouter);
app.use("/subcategory", subcategoryRouter);
app.use("/brand", brandRouter);
app.use("/coupon", couponRouter);
app.use("/product", productRouter);
app.use("/cart", cartRouter);
app.use("/order", orderRouter);

//page not found handler

app.all("*", (req, res, next) => {
  return next(new Error("page not found", { cause: 404 }));
});
//global error handler
app.use((error, req, res, next) => {
  const statusCode = error.cause || 500;

  return res.status(statusCode).json({
    success: false,
    message: error.message,
    stack: error.stack,
  });
});

app.listen(port, () => {
  console.log("App is running at port :", port);
});
