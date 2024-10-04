import React, { useState } from "react";
import JitsiMeetComponent from "./components/JitsiMeetComponent.js";
import "../src/index.css";
import JitsiMeetingComponent from "./components/JitsiMeetingComponent.js";
import JitsiMeeting2 from "./components/JitsiMeeting2.js";

function App() {
  const [roomName, setRoomName] = useState("MyMeetingRoom");

  return (
    <div>
      <h1 className="title">Embed Jitsi Meeting</h1>
      {/* <JitsiMeetComponent /> */}
      {/* <JitsiMeetingComponent /> */}
      <JitsiMeeting2 />
    </div>
  );
}

export default App;
