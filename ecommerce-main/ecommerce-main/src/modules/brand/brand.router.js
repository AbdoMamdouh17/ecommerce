import { Router } from "express";
import * as brandcontroller from './brand.controller.js'
import * as brandSchema from './brand.schema.js'
import { isAuthenticated } from "../../middlwares/authentication.middleWare.js";
import{ isAuthorized} from "../../middlwares/authorization.middleWare.js"
import { fileUpload } from "../../utils/fileUpload.js";
import { validation } from "../../middlwares/validation.middlware.js";

const router = Router()

router.post("/",isAuthenticated, 
    isAuthorized("admin"), 
    fileUpload().single("image"), 
    validation(brandSchema.createBrand),
    brandcontroller.createBrand
);

router.patch("/:id",isAuthenticated, 
    isAuthorized("admin"), 
    fileUpload().single("image"), 
    validation(brandSchema.updateBrand),
    brandcontroller.updateBrand
);

router.delete("/:id",isAuthenticated, 
    isAuthorized("admin"), 
    fileUpload().single("image"), 
    validation(brandSchema.deleteBrand),
    brandcontroller.deleteBrand
);
router.get("/",
    brandcontroller.aLLBrands);
  
export default router 