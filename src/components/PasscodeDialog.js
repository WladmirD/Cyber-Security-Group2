import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import chatmodulestyles from "./Chat.module.css";
import { io } from 'socket.io-client';
const connection_url = 'http://localhost:3030';
const connection_sqliteserver_url = 'http://localhost:5000';
// Connect to the socket io server
const socket = io(connection_url);

//======================
function RoomDialog({ show, onClose, roomid, passcode, showloading }) {
  //get current userid
  console.log('Room ID:', roomid);
  console.log('PassCode:', passcode);
  // const roomId = '1'
  // const originalpass = '202cb962ac59075b964b07152d234b70'
  const [password, setPassword] = useState("");
  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Room id:", roomid);
    console.log("Password:", password);
    // validation password for room
    onClose();
    if (passcode === password) {
      getRoomInfo(roomid);
    } else {
      alert("Wrong PassCode!")
      showloading(false);
    }
    // send to nodejs for create new room 
    // Close the modal after submission
  };

  const closeDialog = () => {
    showloading(false);
    onClose()
  }


  // ==============CHAT ROOM FUNCTIONS --- ADD NEW ROOM
  const getRoomInfo = async (roomid) => {
    try {
      const node_api_url = connection_sqliteserver_url + "/model/getChatHistory";
      const response = await fetch(node_api_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomid }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      } else {
        // call socket io to resfresh available rooms
        // Emit event to Socket.IO to refresh available rooms
        socket.emit('getRoomHistoryChat', roomid);
      }

      // Parse JSON response
      const data = await response.json();
      // Log the received data
      console.log('Result after creating room:', data);

    } catch (error) {
      console.error('Error fetching chatrooms:', error.message);
    }
  };

  return (
    <div className={chatmodulestyles.dialogcontainer}>
      {/* Button to trigger the modal */}
      {/* Bootstrap Modal */}
      {show && (
        <div className={chatmodulestyles.modaloverlay}>
          <div className="modal d-block" role="dialog" >
            <div className={chatmodulestyles.modaldialogcentered} role="document">
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", backgroundColor: "white", width: "40%" }}>
                <div className="modal-header">
                  <h5 className="modal-title">Enter Your PassCode To Join the Room</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={closeDialog}
                  ></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">
                        Room Code
                      </label>
                      <input
                        type="password"
                        id="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-success">
                      Submit
                    </button>
                  </form>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeDialog}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomDialog;
