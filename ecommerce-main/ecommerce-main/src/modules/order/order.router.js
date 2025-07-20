import { Router } from "express";
import { isAuthenticated } from "../../middlwares/authentication.middleWare.js";
import { isAuthorized } from "../../middlwares/authorization.middleWare.js";
import { validation } from "../../middlwares/validation.middlware.js";
import * as orderSchema from "../../modules/order/order.schema.js"
import * as orderController from "../../modules/order/order.controller.js" 
import express from "express"
const router = Router()

// create order 
router.post("/",isAuthenticated, 
    isAuthorized("user"), 
    validation(orderSchema.createOrder),
    orderController.createOrder
);
// cancel order 
router.patch("/:id",isAuthenticated, 
    isAuthorized("user"), 
    validation(orderSchema.cancelOrder),
    orderController.cancelsOrder
);

router.post('/webhook', express.raw({type: 'application/json'}), orderController.webhookHandler)

export default router