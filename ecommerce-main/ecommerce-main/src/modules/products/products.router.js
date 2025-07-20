import { Router } from "express";
import { fileUpload } from "../../utils/fileUpload.js";
import { validation } from "../../middlwares/validation.middlware.js";
import { isAuthorized } from "../../middlwares/authorization.middleWare.js";
import { isAuthenticated } from "../../middlwares/authentication.middleWare.js";
import * as productController from "./products.controller.js"
import * as productSchema from "./products.schema.js"
import reviewRouter from "../review/review.router.js"
const router = Router()

router.use("/:productId/review",reviewRouter)

router.post("/",
    isAuthenticated,
    isAuthorized("seller"),
    fileUpload().fields([
        {name:"defaultImage", maxCount:1},
        {name:"subImages", maxCount:3}
    ]),
    validation(productSchema.createProduct),
    productController.createProduct
)

router.delete("/:id",
    isAuthenticated,
    isAuthorized("seller"),
    validation(productSchema.deleteProduct),
    productController.deleteProduct
)
router.get("/",productController.allProducts)
export default router;