import { Schema ,model } from 'mongoose'

const UserSchema = new Schema({
    userName:{
        type:String,
        required:true,
        min:3,
        max:20
    },
    email:{
        type:String,
        unique:true,
        required:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true
    },
    isConfirmed:{
        type:Boolean,
        default:false
    },
    gender:{
        type:String,
        enum:["male","female"]
    },
    phone:{
        type:String
    },
    role:{
        type:String,
        enum:["user","seller"],
        default:"user"
    },
    forgetCode:String,
    profileImage:{
        url:{type:String,default:
            'https://res.cloudinary.com/dyzsdwzxo/image/upload/v1741700394/people_15675850_pcbvjt.png'},
        id:{type:String,default:'people_15675850_pcbvjt'},
    },
    coverImages:[{url: {type:String},id:{type: String}}]
},{timestamps: true})

export const User = model("User",UserSchema);


