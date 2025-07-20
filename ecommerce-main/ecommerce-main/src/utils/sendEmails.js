import nodemailer from 'nodemailer'
export const sendEmail = async({to , subject , html})=>{

    //sender
    const transporter = nodemailer.createTransport({
        host:'localhost',
        service:'gmail',
        port: 465, //Port 465 is a port used with SSL
        secure:true,
        auth:{
            user:process.env.EMAIL,
            pass:process.env.PASS
        }
    })
    // recever 
    const info = await transporter.sendMail({
        from:`"Ecommerce Aplication" <${process.env.EMAIL}>`,
        to,
        subject,
        html,
    }); 

    if(info.rejected.length>0) return false ;
    return true 
}