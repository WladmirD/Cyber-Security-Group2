import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import chatmodulestyles from './Chat.module.css';
import { io } from 'socket.io-client';
import { notify } from './toast';
const connection_url = 'http://localhost:3030';
const connection_sqliteserver_url = 'http://localhost:5050';
// Connect to the socket io server
const socket = io(connection_url);

//======================
function RoomDialog({ DataUserIdCurrent, show, onClose }) {
  console.log('test')
  console.log(DataUserIdCurrent)
  const [roomName, setRoomName] = useState('');
  const [password, setPassword] = useState('');
  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log('Room Name:', roomName);
    // console.log('Password:', password);
    // validation password for room
    onClose();

    // valid - sanitization the password  and roomName
    const regexName = /^[a-zA-Z0-9 ]+$/;
    const regexOnlyNumber = /^\d+$/;

    if (regexName.test(roomName.trim()) && regexOnlyNumber.test(password.trim())) {
      CreateNewChatRoom(DataUserIdCurrent, roomName, password);
    } else {
      alert("Passwords should only be digital numbers!");
    }

    // Close the modal after submission
  };

  // ==============CHAT ROOM FUNCTIONS --- ADD NEW ROOM
  const CreateNewChatRoom = async (userid, roomname, passcode) => {
    try {
      const node_api_url = connection_sqliteserver_url + '/model/createnewroom';
      const response = await fetch(node_api_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userid, roomname, passcode }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      } else {
        alert('Created new room successfully!');

        // call socket io to resfresh available rooms
        // Emit event to Socket.IO to refresh available rooms
        socket.emit('getAvailableChatRooms', 'refresh');
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
                  <h5 className='modal-title'>Create a Room</h5>
                  <button
                    type='button'
                    className='btn-close'
                    aria-label='Close'
                    onClick={onClose}
                  ></button>
                </div>
                <div className='modal-body'>
                  <form onSubmit={handleSubmit}>
                    <div className='mb-3'>
                      <label htmlFor='roomName' className='form-label'>
                        Room Name
                      </label>
                      <input
                        type='text'
                        id='roomName'
                        className='form-control'
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        required
                      />
                    </div>
                    <div className='mb-3'>
                      <label htmlFor='password' className='form-label'>
                        Password
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
                    onClick={onClose}
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
