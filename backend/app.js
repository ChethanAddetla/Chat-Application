const express = require('express');
const mongoose =require('mongoose')
const userRoutes = require('./routes/userRoutes');
const msgRoutes = require('./routes/msgRoutes');
const userModel = require('../backend/models/Users');
const cors = require('cors')
const app=express();

const corsOptions = {
  // origin:'http://localhost:5173', 
  origin : 'https://realtime-chat-application-g25y.onrender.com',
  optionsSuccessStatus: 200 
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 


const PORT = process.env.PORT|| 5000;

const server =app.listen(PORT,()=>{console.log('server is running on port '+PORT)})

const io=require('socket.io')(server,{
    cors:{

        origin: 'https://realtime-chat-application-g25y.onrender.com'
        // 'http://localhost:5173'


    }
})

let users=[]
io.on('connection',socket=>{
    // console.log('User Connected',socket.id)
    socket.on('addUser',clint =>{
        const isUserExist = users.find(user => user.userId === clint.userId)
        if(!isUserExist){
        const user={userId:clint.userId,socketId:socket.id}
        users.push(user)
        io.emit('getUser',users)
       
    }
    
    });

    socket.on('disconnect',()=>{
        users = users.filter(user => user.socketId !== socket.id);
        io.emit('getUser',users);
    });
    // io.emit('getuser',socket.userId);
    socket.on('sendMessage',async({ senderId,receiverId,message,conversationId})=>{
      // console.log({ senderId,receiverId,message,conversationId})

      const receiver = users.find(user=>user.userId === receiverId);
      const sender = users.find(user=>user.userId === senderId);
      const user = await userModel.findById(senderId)
    //   console.log(user)
      if(receiver){
          // console.log({ senderId,receiverId,message,conversationId})
        io.to(receiver?.socketId).to(sender?.socketId).emit('getMessage',{
            senderId,
            message,
            conversationId,
            receiverId,
            user:{id:user._id,fullname :user.fullname,profilePicture:user.profilePicture}
            
        })
      }
      else{
        io.to(sender?.socketId).emit('getMessage',{
            senderId,
            message,
            conversationId,
            receiverId,
            user:{id:user._id,fullname :user.fullname,profilePicture:user.profilePicture}


        })
      }
    })

})








const db = "mongodb+srv://chethanaddetlapp:saichethan@cluster0.gymgrke.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
mongoose.connect(db)


app.use(express.json())

app.use('/user',userRoutes);
app.use('/msg',msgRoutes);
app.use(express.urlencoded({extended :false}));





app.get('/',(req,res)=>{
    res.send("hi bro")

})


