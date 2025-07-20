import { Router } from "express";
import * as subcategoryController from "./subcategory.controller.js"
import * as subcategorySchema from "./subcategory.schema.js"
import { isAuthenticated } from "../../middlwares/authentication.middleWare.js";
import{ isAuthorized} from "../../middlwares/authorization.middleWare.js"
import { fileUpload } from "../../utils/fileUpload.js";
import { validation } from "../../middlwares/validation.middlware.js";

const router = Router({mergeParams:true})

// create 
router.post("/",isAuthenticated, 
    isAuthorized("admin"), 
    fileUpload().single("image"), 
    validation(subcategorySchema.createSubcategory),
    subcategoryController.createSubcategory
);
//update 
router.patch(
    "/:id",
    isAuthenticated,
    isAuthorized("admin"),
    fileUpload().single("image"),
    validation(subcategorySchema.updateSubcategory),
    subcategoryController.updateSubcategory
);

// delete 
router.delete(
    "/:id",
    isAuthenticated,
    isAuthorized("admin"),
    validation(subcategorySchema.deleteSubcategory),
    subcategoryController.deleteSubcategory
);
//get all categories
router.get("/",validation(subcategorySchema.getAllSubcategories),subcategoryController.getAllSubcategories)

export default router 