import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import 'bootstrap/dist/css/bootstrap.min.css';
import chatmodulestyles from './Chat.module.css';
import { io } from 'socket.io-client';
import { notify } from './toast';
const connection_url = 'http://localhost:3030';
const connection_sqliteserver_url = 'http://localhost:5050';

// Connect to the socket io server
const socket = io(connection_url);
//======================


//create hash value from password plain text of users
const hashMD5 = (input) => {
  const hash = CryptoJS.MD5(input).toString();
  return hash;
};

function RoomDialog({ show, onClose, roomid, passcode, showloading, setOpenChatBox }) {
  //get current userid

  const [password, setPassword] = useState('');
  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // validation password for room
    onClose();

    // valid passcode
    // ensure the value of passcode is number only
    console.log("passcode")
    console.log(passcode)
    console.log("password")
    console.log(hashMD5(password))
    if (passcode === hashMD5(password)) {
      getRoomInfo(roomid);
    } else {
      alert("Cannot valid this PassCode!")
      showloading(false);
    }
  };

  const closeDialog = () => {
    showloading(false);
    onClose();
  };

  // ==============CHAT ROOM FUNCTIONS --- ADD NEW ROOM
  const getRoomInfo = async (roomid) => {
    try {
      const node_api_url =
        connection_sqliteserver_url + '/model/getChatHistory';
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

      // // Parse JSON response
      // const data = await response.json();
      // // Log the received data
      // console.log('Result after creating room:', data);
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
          <div className='modal d-block' role='dialog'>
            <div
              className={chatmodulestyles.modaldialogcentered}
              role='document'
            >
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: 'white',
                  width: '40%',
                }}
              >
                <div className='modal-header'>
                  <h5 className='modal-title'>
                    Enter Your PassCode To Join the Room
                  </h5>
                  <button
                    type='button'
                    className='btn-close'
                    aria-label='Close'
                    onClick={closeDialog}
                  ></button>
                </div>
                <div className='modal-body'>
                  <form onSubmit={handleSubmit}>
                    <div className='mb-3'>
                      <label htmlFor='password' className='form-label'>
                        Room Code
                      </label>
                      <input
                        type='password'
                        id='password'
                        className='form-control'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <button type='submit' className='btn btn-success'>
                      Submit
                    </button>
                  </form>
                </div>
                <div className='modal-footer'>
                  <button
                    type='button'
                    className='btn btn-secondary'
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
