import { Server } from "socket.io";
const io=new Server(8000,{
  cors:true,
});
const emailToSocketId=new Map();
const SocketIdtoemail=new Map();
io.on('connection', (socket) => {
    console.log('a user connected on ',socket.id);
    socket.on('room:join',data=>{
      const {email,code}=data;
      emailToSocketId.set(email,socket.id);
      SocketIdtoemail.set(socket.id,email);
      // creating a new even for the second user and emitting on the same room
      io.to(code).emit("user:join",{email,socketId:socket.id});
      // joining the second user into  the server
      socket.join(code);
      io.to(socket.id).emit("room:join",data);
    });
    socket.on('user:call',({to,offer})=>{
      // console.log(offer);
      io.to(to).emit('incoming:call',{from:socket.id,offer});
    });
    socket.on('call:accepted',({to,ans})=>{
      io.to(to).emit('call:accepted',{from:socket.id,ans});
    });
    socket.on('peer:nego:needed',({to,offer})=>{
      // console.log("peer:nego:needed",offer);
      io.to(to).emit('peer:nego:needed',{from:socket.id,offer});
    })
    socket.on('peer:nego:done',({to,answer})=>{
      // console.log("peer:nego:final",answer);
      io.to(to).emit('peer:nego:final',{from:socket.id,answer});
    })
  });   