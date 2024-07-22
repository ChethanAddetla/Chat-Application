const express = require('express')
const bcrypt =require('bcrypt')
const jwt = require('jsonwebtoken')
const userModel = require('../models/Users');
const userRoutes=express.Router();
require("dotenv").config();


userRoutes.post('/signup',async (req,res)=>{
    
    const {fullname,email,password} = req.body;
    try{
        if(!fullname ||!email || !password){
            res.status(400).send({msg:"Please fill all the fields"});
        }
        else{
            let hashedPass = await bcrypt.hash(password,10);
             
            let user = new userModel({fullname,email})
            user.set('password',hashedPass)

            await user.save();
            res.send({msg:"Signup Successful"})
        }
        
    }
    catch(error){
        res.status(400).send({msg:"Email Exist" , msg2:error})
    }
    

    // res.send({...data});
    // console.log({...data})

})


userRoutes.post('/login',async (req,res)=>{
    const {email,password} =req.body;
    if(!email ||!password){
        res.status(400).send({msg:"Please fill all the fields"})
    }
    else{
        let result = await userModel.find({email:email})
        if(result.length >0){
            console.log()
            let equal =await bcrypt.compare(password,result[0].password);
            if(equal){
                // console.log(equal)
                const payload={
                    userId:result[0]._id,
                    email : result[0].email
                } 
                let accesstoken = generatetoken(payload);
                
                let result2 = await userModel.findByIdAndUpdate(result[0]._id,{token:accesstoken},{new:true})
                res.send({msg:"Login Successful" ,token:accesstoken,user:{name:result[0].fullname,userId:result[0]._id,email:result[0].email}})
            }
            else{
                res.status(400).send({msg:"Password doesn't match"})
            }
            
        }
        else{
            // console.log(result)
            res.status(400).send({msg:"Email not found"})
        }
    }

    
})

userRoutes.get('/users',async (req,res)=>{
    try{
    let users = await userModel.find();
    let userData = await Promise.all( users.map((user)=>{
        return{
            user:{email:user.email,fullname:user.fullname},userId:user._id
        }
    }))
    res.send(userData)
    // console.log(userData)

}
    catch(error){
        console.log("Error",error);
    }


    
})


const generatetoken=(data)=>{
    return jwt.sign(data,process.env.SECURITY_KEY,{expiresIn:'1d'})
}
module.exports = userRoutes

