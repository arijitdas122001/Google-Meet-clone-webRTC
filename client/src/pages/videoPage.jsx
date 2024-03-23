import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSocket } from '../socketContext/context';
import ReactPlayer from 'react-player'
import PeerConnection from '../services/PeerConnection';

const videoPage = () => {
  const {id}=useParams();
  const socket=useSocket();
  const [RemoteSocketId,setRemoteSocketId]=useState(null);
  const [MyStream,setMyStream]=useState();
  const [RemoteStream,setRemoteStream]=useState();
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
  const SendStreams=useCallback(()=>{
    for(const tracks of MyStream.getTracks()){
      PeerConnection.peer.addTrack(tracks,MyStream);
    }
  },[MyStream]);
  const handelAcceptCall=useCallback((data)=>{
    const {from,ans}=data;
    PeerConnection.setLDescription(ans);
    console.log(`Accept Call ${ans}`);
    SendStreams();
  },[SendStreams]);
  const handelNegoNeed=useCallback(async()=>{
    const offer=await PeerConnection.getOffer();
    socket.emit('peer:nego:needed',{to:RemoteSocketId,offer});
  },[RemoteSocketId,socket]);
  const handelNegoSecondUser=useCallback(async({from,offer})=>{
    const answer=await PeerConnection.getAnswer(offer);
    socket.emit('peer:nego:done',{to:from,answer});
  },[]);
  useEffect(()=>{
    PeerConnection.peer.addEventListener('negotiationneeded',handelNegoNeed);
    return(()=>{
      PeerConnection.peer.removeEventListener('negotiationneeded',handelNegoNeed);
    })
  },[handelNegoNeed]);
  const handelFinalNego=useCallback(async({answer})=>{
    console.log("answer",answer)
    await PeerConnection.setLDescription(answer);
  },[])
  useEffect(()=>{ 
    PeerConnection.peer.addEventListener('track',async(ev)=>{
      const remotestream=ev.streams;  
      console.log("got the tracks");
      setRemoteStream(remotestream[0]);
    })
  },[]);
  useEffect(()=>{
    // if the secound user joins this event then handel the data
    socket.on("user:join",handelSecondUserData);
    socket.on("incoming:call",handelIncomingCall);
    socket.on("call:accepted",handelAcceptCall);
    socket.on('peer:nego:needed',handelNegoSecondUser);
    socket.on('peer:nego:final',handelFinalNego);

    return ()=>{  
      socket.off("user:join",handelSecondUserData);
      socket.off("call:accepted",handelAcceptCall);
      socket.off("incoming:call",handelIncomingCall);
      socket.off('peer:nego:needed',handelNegoSecondUser);
      socket.off('peer:nego:final',handelFinalNego);
    };
  },[socket,handelIncomingCall,handelSecondUserData,handelAcceptCall,handelNegoNeed,handelFinalNego]);
  return (
    <div>
      <h1>RoomCode is {id}</h1>
      <h2>{RemoteSocketId?"Connected":"No one in the Room"}</h2>
      <button onClick={handelCallUser}>Join</button>
      {MyStream && <button onClick={SendStreams}>Call</button>}
      {RemoteSocketId && <ReactPlayer height={200} width={200} url={MyStream} playing={true} />}
      <h2>RemoteStreams</h2>
      {RemoteStream && 
      <ReactPlayer height={200} width={200} url={RemoteStream} playing={true} />
      }
    </div>
  )
}

export default videoPage
