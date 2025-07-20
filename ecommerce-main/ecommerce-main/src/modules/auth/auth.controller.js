import {asyncHandler} from '../../utils/asyncHandler.js'
import {User} from '../../../DB/models/user.model.js'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sendEmail } from '../../utils/sendEmails.js'
import {signUpTemplate} from'../../utils/htmlTemplets.js'
import {Token} from '../../../DB/models/token.model.js'
import Randomstring from 'randomstring'
import {restePassTemp} from'../../utils/htmlTemplets.js'
import { Cart } from '../../../DB/models/cart.model.js'


export const register = asyncHandler(async(req,res,next)=>{

    const{email ,userName ,password } = req.body

    const user = await User.findOne({email})
    if(user) return next(new Error("User Already existed!",{cause:409}))

    const hashPassword = bcryptjs.hashSync(password,parseInt(process.env.SALT_ROUND))

    const token = jwt.sign({email},process.env.TOKEN_SECRET)

    await User.create({...req.body,password:hashPassword})
    
    const confirmationlink =`http://localhost:3000/auth/activate_account/${token}`
    
    const messageSent = await sendEmail({to:email,subject:"Activated Account",html:signUpTemplate(confirmationlink)});
    if(!messageSent) return next(new Error("something went wrong!"))
    
    return res.status(201).json({success:true,message:"check your email!"})
});

export const activateAccount = asyncHandler(async (req, res, next) => {
    const { token } = req.params;
    const { email } = jwt.verify(token, process.env.TOKEN_SECRET);

    const user = await User.findOneAndUpdate({ email },{ isConfirmed: true });
    if(!user) return 

    await Cart.create({user:user._id})

    return res.status(201).json({success: true,message:"try to login!"})
});

export const login =asyncHandler(async(req,res,next)=>{
    const{email ,password } = req.body

    const user = await User.findOne({ email });
    if (!user) return next(new Error("Invalid Email!", { cause: 404 }));

    if (!user.isConfirmed)
        return next(new Error("You should activate your account!"));

    const match = bcryptjs.compareSync(password, user.password);
    if (!match) return next(new Error("Invalid Password!"));

    const token = jwt.sign({ email, id: user._id }, process.env.TOKEN_SECRET);

    await Token.create({ token, user: user._id });

    return res.json({ success: true, results: token });

});

export const forgetCode = asyncHandler(async(req,res,next)=>{
    const{email} = req.body

    const user = await User.findOne({ email });
    if (!user) return next(new Error("Invalid Email!", { cause: 404 }));

    // generate forget code
    const forgetCode = Randomstring.generate({
        length: 6,    
        charset: 'numeric'  
    });
    console.log(forgetCode)
    //save forgetCode
     user.forgetCode= forgetCode
     await user.save();

    //sendEmail
    const messageSent = await sendEmail({
        to: email,
        subject: "Reset Password",
        html: restePassTemp(forgetCode),
    });
    
    if (!messageSent) return next(new Error("Something went wrong!"));
    // send response 
    return res.json({success:true,message:"Check your email!"})
}); 


export const resetPassword = asyncHandler(async(req,res,next)=>{
    const{email,password,forgetCode} = req.body

    const user = await User.findOne({ email });
    if (!user) return next(new Error("Invalid Email!", { cause: 404 }));

    if(!user.isConfirmed)  return next(new Error("Activate your account first!", { cause: 403 }));

    if(forgetCode!== user.forgetCode) return next(new Error("Code is invalid!"))

    user.password =bcryptjs.hashSync(password,parseInt(process.env.SALT_ROUND))
    await user.save()
    // Find Token to make is valid false 
    const tokens = await Token.find({user:user.user_id})
    tokens.forEach(async(token)=>{
        token.isValid = false 
        await token.save()
    })
    return res.json({success:true,message:"try to login again!"})
})
