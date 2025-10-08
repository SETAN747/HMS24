// PatientCall.jsx
import { useRef, useState, useEffect } from "react";
import Peer from "simple-peer";
import { getSocket } from "../services/socket";

const PatientCall = ({ doctor, onClose }) => {
  const [stream, setStream] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);

  const myVideo = useRef(null);
  const doctorVideo = useRef(null);
  const connectionRef = useRef(null);

  const socket = getSocket();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) myVideo.current.srcObject = currentStream;
      });
  }, []);

  const answerCall = () => {
    console.log("✅ Patient answering call from:", doctor.name);
    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on("signal", (signalData) => {
      console.log("📤 Patient sending callAccepted:", signalData);
      socket.emit("callAccepted", { signal: signalData, to: doctor._id });
    });

    peer.on("stream", (remoteStream) => {
      console.log("📺 Patient received doctor stream");
      if (doctorVideo.current) doctorVideo.current.srcObject = remoteStream;
    });

    peer.signal(doctor.signalData);
    connectionRef.current = peer;
    setCallAccepted(true);
  };

  const endCall = () => {
    console.log("📴 Patient ending call");
    socket.emit("call-ended", { from: doctor._id, to: doctor._id });
    connectionRef.current?.destroy();
    if (myVideo.current) myVideo.current.srcObject = null;
    if (doctorVideo.current) doctorVideo.current.srcObject = null;
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-900 p-4 rounded-lg flex flex-col items-center">
        <h2 className="text-white font-bold mb-2">Call from {doctor.name}</h2>
        <video ref={doctorVideo} autoPlay playsInline className="w-[400px] h-[300px] bg-black rounded-lg mb-2"/>
        <video ref={myVideo} muted autoPlay playsInline className="w-[200px] h-[150px] bg-black rounded-lg border-2 border-green-500 mb-4"/>
        {!callAccepted && (
          <button onClick={answerCall} className="bg-green-600 p-2 rounded mb-2">Accept</button>
        )}
        <button onClick={endCall} className="bg-red-600 p-2 rounded">End Call</button>
      </div>
    </div>
  );
};

export default PatientCall;
