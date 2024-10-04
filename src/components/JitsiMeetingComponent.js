import React, { useEffect, useRef, useState } from "react";

const JitsiMeetingComponent = ({ roomName }) => {
  const domain = "meet.jit.si";
  const jitsiContainerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
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
        startRecording(api);
      });

      return () => {
        if (api) {
          api.dispose();
        }
      };
    }
  }, [apiLoaded, roomName]);

  const startRecording = async (api) => {
    try {
      const tracks = await api.getLocalTracks();
      const stream = new MediaStream(tracks.map((track) => track.track));

      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start(1000); // Capture data every second
      setIsRecording(true);
      console.log("Recording started");
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log("Recording stopped");
      saveRecording();
    }
  };

  const saveRecording = () => {
    const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = "jitsi-recording.webm";
    a.click();
    window.URL.revokeObjectURL(url);
    recordedChunksRef.current = [];
  };

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <div ref={jitsiContainerRef} style={{ width: "100%", height: "100%" }} />
      <button onClick={stopRecording} disabled={!isRecording}>
        Stop Recording and Save
      </button>
    </div>
  );
};

export default JitsiMeetingComponent;
