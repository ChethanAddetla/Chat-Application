const express = require('express')
const ConversationsModel = require('../models/Conversations')
const userModel  = require('../models/Users')
const messageModel = require('../models/Messages')
const msgRoutes = express.Router();

msgRoutes.post('/conversation',async (req,res)=>{
    try{
        const {senderId,receiverId} = req.body;
        // const array=[];
        // array.push(senderId)
        // array.push(receiverId)
        if(!senderId || !receiverId){
            res.status(400).send({msg:"All the fields are required"})
        }
        const newConversation = new ConversationsModel({members:[senderId,receiverId]})
        await newConversation.save();
        res.send({msg:"Conversation created Successfully"})
 

    }
    catch(error){
        console.log(error,'error')

    }
})



msgRoutes.get('/conversation/:userId',async(req,res)=>{
    try{
        const userId = req.params.userId
        const conversations  = await ConversationsModel.find({members:{$in:[userId]}});
        const conversationUserData =  await Promise.all (conversations.map(async(conversation)=>{

            const receiverId = conversation.members.find((member)=>member !== userId)
            // console.log(receiverId)
            // console.log(await userModel.findById(receiverId))
            let temp = await userModel.findById(receiverId)
            if (!temp) {
                // console.error(`No user found with ID: ${receiverId}`);
                return null;
              } 
              else{
            return {user:{email:temp.email,id:temp._id,fullname:temp.fullname},conversationId:conversation._id};}
        })
    )
        // console.log(conversationUserData)
        const filteredConversationUserData = conversationUserData.filter(data => data !== null);
        // console.log(filteredConversationUserData);
        res.status(200).json(filteredConversationUserData)
    }
    catch(error){
        console.log(error,'error')
    }
})

msgRoutes.post('/conversationCheck/:userId',async(req,res)=>{
    try{
        const senderId = req.params.userId
        const receiverId = req.body.receiverId
        const conversations  = await ConversationsModel.find({ members: { $all: [senderId, receiverId] }});
        if(conversations.length > 0){
            res.send({conversationId:conversations[0]._id , isnew:false})
        }else{
            const newConversation = new ConversationsModel({members:[senderId,receiverId]})
            await newConversation.save();
            
            res.send({conversationId:newConversation._id ,isnew:true})
        }

        // console.log(conversationUserData)
        
    }
    catch(error){
        console.log(error,'error')
    }
})

msgRoutes.post('/message',async(req,res)=>{
    try{
    const {conversationId,senderId,message,receiverId} = req.body;
    if(!senderId||!message ){
       return res.send({msg:"Please fill all required fields"})
    }
    if(conversationId === "new " && receiverId){
       
        const newConversation = new ConversationsModel({members:[senderId,receiverId]})
        await newConversation.save();
        const newMessage = new messageModel({conversationId:newConversation._id,senderId,message})
        newMessage.save();
       return res.send({msg:"Message sent successfully !"})
    }
    const newMessage = new messageModel({conversationId,senderId,message})
    newMessage.save();
    res.send({msg:"Message sent successfully !"})
    }
    catch(error){
        console.log(error,"error");
    }
})


msgRoutes.get('/message/:conversationId',async (req,res)=>{
    try{
        const conversationId = req.params.conversationId;
        if(!conversationId){
           return res.send([])
        }
        const messages = await messageModel.find({conversationId})
        const messageUserData = await Promise.all(
            messages.map(async (item)=>{
                const user = await userModel.findById(item.senderId);
                if(!user){
                    return null;
                }
                return {user:{email:user.email,id:user._id,fullname:user.fullname},message:item.message};
            })
        )
        res.send(messageUserData)
    }
    catch(error){
        console.log("error",error);
    }
})

module.exports = msgRoutes
