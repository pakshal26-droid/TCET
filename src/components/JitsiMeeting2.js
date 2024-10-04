import React, { useEffect, useRef, useState } from "react";

const JitsiMeetComponent = ({ roomName }) => {
  const domain = "meet.jit.si";
  const videoRef = useRef(null);
  const jitsiContainerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [apiLoaded, setApiLoaded] = useState(false);

  useEffect(() => {
    // Load Jitsi Meet External API script
    const script = document.createElement("script");
    script.src = `https://${domain}/external_api.js`;
    script.async = true;
    script.onload = () => setApiLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (apiLoaded) {
      const options = {
        roomName: roomName,
        width: "100%",
        height: "100%",
        parentNode: jitsiContainerRef.current,
        configOverwrite: {},
        interfaceConfigOverwrite: {
          filmStripOnly: true,
          SHOW_JITSI_WATERMARK: false,
          SHOW_BRAND_WATERMARK: false,
          DEFAULT_REMOTE_DISPLAY_NAME: "Fellow Jitster",
          TOOLBAR_BUTTONS: ["microphone", "camera", "chat", "hangup"],
        },
        userInfo: {
          displayName: "Your Name",
        },
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);

      api.addListener("videoConferenceJoined", () => {
        console.log("Jitsi Meet conference joined");
        startCapture(api);
      });

      return () => {
        if (api) {
          api.dispose();
        }
      };
    }
  }, [apiLoaded, roomName]);

  const startCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      startRecording(stream);
    } catch (err) {
      console.error("Error capturing media: ", err);
    }
  };

  const startRecording = (stream) => {
    setRecordedChunks([]);
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]);
      }
    };

    mediaRecorder.onstop = () => {
      downloadRecording();
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
    console.log("Recording started");
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log("Recording stopped");
    }
  };

  const downloadRecording = () => {
    if (recordedChunks.length === 0) {
      console.log("No recording to download");
      return;
    }

    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = "recording.webm";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div id="jitsi-container" />
      <video ref={videoRef} style={{ display: "none" }}></video>
      <div>
        <button onClick={stopRecording} disabled={!isRecording}>
          Stop Recording and Download
        </button>
      </div>
    </div>
  );
};

export default JitsiMeetComponent;
