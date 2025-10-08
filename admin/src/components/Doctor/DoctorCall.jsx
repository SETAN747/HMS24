// DoctorCall.jsx (Admin site)
import { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import socketService from "../../services/socket";

const DoctorCall = ({ patient, doctor, onClose }) => {
  const [stream, setStream] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);

  const myVideo = useRef(null);
  const patientVideo = useRef(null);
  const connectionRef = useRef(null);

  const socket = socketService.getSocket(); 

  useEffect(() => {
  if (doctor && socket) {
    socket.emit("join", {
      id: doctor._id,
      name: doctor.name,
      role: "Doctor",
    });
    console.log("✅ Doctor joined with:", doctor._id);
  }
}, [doctor, socket]);

  // Get doctor media stream
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        console.log("🎥 Doctor got media stream:", currentStream);
        setStream(currentStream);
        if (myVideo.current) myVideo.current.srcObject = currentStream;
      })
      .catch((err) => console.error("Media error:", err));
  }, []);

  const startCall = () => {
    console.log("▶️ startCall triggered");
    console.log("Patient prop:", patient);
    console.log("Doctor prop:", doctor);
    console.log("Stream available:", stream);
    console.log("Doctor Socket id:", socket.id); 

     


    if (!patient || !patient._id) {
      console.error("❌ No patient selected to call");
      return;
    }
    
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream : stream,
    });
    
    console.log("peer : ", peer)
    peer.on("signal", (signalData) => {
      console.log("📤 Doctor sending signal to backend:", signalData);
      socket.emit("callToUser", {
        callToUserId: patient._id,   // patient ka DB _id
        fromUserId: doctor._id,      // doctor ka DB _id
        name: doctor.name,
        profilepic: doctor.image || "",
        signalData,
      });
    });

    peer.on("stream", (remoteStream) => {
      console.log("📺 Doctor received patient stream");
      if (patientVideo.current) patientVideo.current.srcObject = remoteStream;
    });

    socket.on("callAccepted", ({ signal, fromSocketId }) => {
      console.log("📞 Call accepted by patient:", fromSocketId);
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const endCall = () => {
    console.log("📴 Doctor ending call");
    socket.emit("call-ended", { from: doctor._id, to: patient._id });
    connectionRef.current?.destroy();
    if (myVideo.current) myVideo.current.srcObject = null;
    if (patientVideo.current) patientVideo.current.srcObject = null;
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-900 p-4 rounded-lg flex flex-col items-center">
        <h2 className="text-white font-bold mb-2">Calling {patient.name}</h2>
        <video ref={patientVideo} autoPlay playsInline className="w-[400px] h-[300px] bg-black rounded-lg mb-2"/>
        <video ref={myVideo} muted autoPlay playsInline className="w-[200px] h-[150px] bg-black rounded-lg border-2 border-blue-500 mb-4"/>
        {!callAccepted && (
          <button onClick={startCall} className="bg-green-600 p-2 rounded mb-2">Start Call</button>
        )}
        <button onClick={endCall} className="bg-red-600 p-2 rounded">End Call</button>
      </div>
    </div>
  );
};

export default DoctorCall;
