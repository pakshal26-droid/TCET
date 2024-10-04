import React, { useEffect } from "react";

const JitsiMeetComponent = () => {
  useEffect(() => {
    // Check if the script is already loaded
    if (
      !document.querySelector(
        'script[src="https://meet.jit.si/external_api.js"]'
      )
    ) {
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = () => {
        // Initialize the Jitsi API after the script has loaded
        initializeJitsi();
      };
      document.body.appendChild(script);
    } else {
      // If script is already loaded, initialize Jitsi immediately
      initializeJitsi();
    }

    function initializeJitsi() {
      if (!window.JitsiMeetExternalAPI) {
        console.error("JitsiMeetExternalAPI not loaded");
        return;
      }

      const domain = "meet.jit.si";
      const options = {
        roomName: "MyRoomName",
        width: "100%",
        height: 600,
        parentNode: document.getElementById("jitsi-container"),
      };
      new window.JitsiMeetExternalAPI(domain, options);
    }
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Jitsi Meet App</h1>
      <div id="jitsi-container" />
    </div>
  );
};

export default JitsiMeetComponent;
