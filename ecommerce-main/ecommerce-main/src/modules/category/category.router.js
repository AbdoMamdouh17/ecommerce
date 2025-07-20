import {Router} from "express";
import{ isAuthenticated} from "../../middlwares/authentication.middleWare.js"
import{ isAuthorized} from "../../middlwares/authorization.middleWare.js"
import { validation } from "../../middlwares/validation.middlware.js";
import * as categoryController from "./category.controller.js"
import * as categorySchema from "./category.schema.js"
import {fileUpload} from "../../utils/fileUpload.js"
import subcategory from "../subcategory/subcategory.router.js"
const router = Router()


router.use("/:category/subcategory",subcategory)
// create category 
router.post("/",
    isAuthenticated,isAuthorized("admin"),
    fileUpload().single("image"),
    validation(categorySchema.createCategory),
    categoryController.createCategory)

// update category 
router.patch("/:id",
    isAuthenticated,isAuthorized("admin"),
    fileUpload().single("image"),
    validation(categorySchema.updateCategory),
    categoryController.updateCategory)

// delete category 
router.delete("/:id",
    isAuthenticated,isAuthorized("admin"),
    validation(categorySchema.deleteCategory),
    categoryController.deleteCategory)

//get all categories
router.get("/",categoryController.allCategory)
export default router 