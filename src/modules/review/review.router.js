import { Router } from "express"
import { isAuthorized } from "../../middlwares/authorization.middleWare.js";
import { isAuthenticated } from "../../middlwares/authentication.middleWare.js";
import { validation } from "../../middlwares/validation.middlware.js";
import * as reviewSchema from "./review.schema.js"
import * as reviewController from "./review.controller.js"

const router = Router({mergeParams:true})

router.post("/",isAuthenticated, 
    isAuthorized("user"), 
    validation(reviewSchema.addReview),
    reviewController.addReview
);
//update review
router.patch("/:id",isAuthenticated, 
    isAuthorized("user"), 
    validation(reviewSchema.updateReview),
    reviewController.updateReview
);
export default router