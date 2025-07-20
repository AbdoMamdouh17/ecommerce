import { Router} from "express";
import { validation } from "../../middlwares/validation.middlware.js";
import * as cartSchema from "./cart.schema.js"
import * as cartController from "./cart.controller.js"
import { isAuthenticated } from "../../middlwares/authentication.middleWare.js";
import { isAuthorized } from "../../middlwares/authorization.middleWare.js";


const router = Router()

router.post('/',
    isAuthenticated,
    isAuthorized("user"),
    validation(cartSchema.addToCart),
    cartController.addToCart
)

router.get('/',
    isAuthenticated,
    isAuthorized("user","admin"),
    validation(cartSchema.userCart),
    cartController.userCart)


router.patch('/',
    isAuthenticated,
    isAuthorized("user","admin"),
    validation(cartSchema.updateCart),
    cartController.updateCart)

router.patch('/:productId',
    isAuthenticated,
    isAuthorized("user"),
    validation(cartSchema.removeFromCart),
    cartController.removeFromCart)

 router.put('/clear',
    isAuthenticated,
    isAuthorized("user"),
    cartController.clearCart)

export default router 