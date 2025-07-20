import { Router } from "express"; 
import * as couponSchema from './coupon.schema.js'
import * as couponController from './coupon.controller.js'
import { isAuthorized } from "../../middlwares/authorization.middleWare.js";
import { validation } from "../../middlwares/validation.middlware.js";
import { isAuthenticated } from "../../middlwares/authentication.middleWare.js";

const router = Router()

router.post("/",isAuthenticated, 
    isAuthorized("seller"), 
    validation(couponSchema.createCoupon),
    couponController.createCoupon
);

router.patch("/:code",isAuthenticated, 
    isAuthorized("seller"), 
    validation(couponSchema.updateCoupon),
    couponController.updateCoupon
);


router.delete("/:code",isAuthenticated, 
    isAuthorized("seller"), 
    validation(couponSchema.deleteCoupon),
    couponController.deleteCoupon
);

router.get("/",isAuthenticated, 
    isAuthorized("seller","admin"), 
    couponController.allCoupons    
);
export default router