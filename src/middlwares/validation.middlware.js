import { Types } from "mongoose"

export const isValidObjectId = (value,helper)=>{
    if(Types.ObjectId.isValid(value)) return true
    return helper.message("Invalid ObjectId!")
 
}

export const validation = (Schema)=>{
    return (req ,res , next )=>{
        const data = {...req.body,...req.params,...req.query}
        const validationResult = Schema.validate(data,{abortEarly:false})
        if(validationResult.error){
            const errorMessage = validationResult.error.details.map((errorObj)=> errorObj.message);
            return next(new Error(errorMessage,{cause:400}))
        }
        return next();
    }
}