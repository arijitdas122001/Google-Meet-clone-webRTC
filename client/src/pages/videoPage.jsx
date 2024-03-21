import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSocket } from '../socketContext/context';
import ReactPlayer from 'react-player'
import PeerConnection from '../services/PeerConnection';

const videoPage = () => {
  const {id}=useParams();
  const socket=useSocket();
  const [RemoteSocketId,setRemoteSocketId]=useState(null);
  const [MyStream,setMyStream]=useState(null);
  const handelSecondUserData=useCallback((data)=>{
    const {email,socketId}=data;
    setRemoteSocketId(socketId);
  });
  const handelCallUser=useCallback(async()=>{
    const stream=await navigator.mediaDevices.getUserMedia({
      audio:true,
      video:true,
    });
    const offer=await PeerConnection.getOffer();
    // console.log(offer);
    socket.emit("user:call",{to:RemoteSocketId,offer});
    setMyStream(stream);
  },[socket,RemoteSocketId]);
  const handelIncomingCall=useCallback(async(data)=>{
    const {from,offer}=data;
    setRemoteSocketId(from);
    let stream=await navigator.mediaDevices.getUserMedia({
      audio:true,
      video:true,
    });
    setMyStream(stream);
    let ans=PeerConnection.getAnswer(offer);
    socket.emit("call:accepted",{to:RemoteSocketId,ans});
    console.log(`Incoming call ${offer}`);
  });
  const handelAcceptCall=useCallback((data)=>{
    const {from,ans}=data;
    PeerConnection.setLDescription(ans);
    console.log(`Accept Call ${ans}`);
  })
  useEffect(()=>{
    // if the secound user joins this event then handel the data
    socket.on("user:join",handelSecondUserData);
    socket.on("incoming:call",handelIncomingCall);
    socket.on("call:accepted",handelAcceptCall);
    return ()=>{  
      socket.off("user:join",handelSecondUserData);
      socket.on("call:accepted",handelAcceptCall);
      socket.on("incoming:call",handelIncomingCall);
    };
  },[socket,handelIncomingCall,handelSecondUserData,handelAcceptCall]);
  return (
    <div>
      <h1>RoomCode is {id}</h1>
      <h2>{RemoteSocketId?"Connected":"No one in the Room"}</h2>
      <button onClick={handelCallUser}>Join</button>
      {RemoteSocketId && <ReactPlayer height={200} width={200} url={MyStream} playing={true} />}
    </div>
  )
}

export default videoPage
