import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../socketContext/context';
import { useNavigate } from 'react-router-dom';
const Landing = () => {
  const [email,setEmail]=useState("");
  const [code,setCode]=useState("");
  const socket=useSocket();
  const navigate=useNavigate();
//   console.log(socket);
  const handelSubmit=useCallback((e)=>{
    e.preventDefault();
    console.log("clicking");
    socket.emit("room:join",{email,code});
  },[email,code,socket]);
  const handelRoomData=useCallback((data)=>{
    const {email,code}=data;  
    navigate(`/call/${code}`);
  },[])
  useEffect(()=>{
    socket.on("room:join",handelRoomData);
    return()=>{
        socket.off("room:join",handelRoomData);
    }
  },[socket,handelRoomData])
  return (
    <div>
      <h1>Connect To the Interview</h1>
      <form onSubmit={handelSubmit}>
      <label>Email:</label>
      <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
      <br />
      <label>Interview Code</label>
      <input type="text" value={code} onChange={(e)=>setCode(e.target.value)} />
      <button>Join</button>
      </form>
    </div>
  )
}

export default Landing;
