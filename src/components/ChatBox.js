import React, { useEffect, useRef, useState } from 'react';
import { Alert, Container, Form, Button } from 'react-bootstrap';
import styles from "./SignUp.module.css";
import chatmodulestyles from "./Chat.module.css";
import './Chatbox.css';
import io from 'socket.io-client';
import RoomDialog from "./RoomDialog";
import PassCodeDialog from "./PasscodeDialog";
import useForm from './hooks/useForm';
import marioIcon from "../img/marioicon.jpg";
import batmanIcon from "../img/batman.jpg";
let socket = undefined;
// the address of nodjs server
const connection_url = 'http://localhost:3030';
const connection_sqliteserver_url = 'http://localhost:5000';
const CurrentUserID = '1';
const ChatBox = () => {
  const [text, setText] = useForm('text');
  const chatboxRef = useRef(null);
  const [messages, setMessages] = useForm('messages', []);
  const [showAlert, setShowAlert] = useState(false);
  const [allavailablerooms, setRooms] = useState([]);
  const [chatarrays, setChatarrays] = useState([]);
  // to control the create room dialog
  const [showDialog, setShowDialog] = useState(false);
  const [ShowPasscodeDialog, setShowPasscodeDialog] = useState(false);
  //===use to pass the value of roomid to another form 
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedPassCode, setSelectedPassCode] = useState(null);
  const broadcastButton = useRef(null);
  const [CurrentRoonName, setCurrentRoonName] = useForm('text');
  const [loading, setLoading] = useState(false);
  // ==============CHAT ROOM FUNCTIONS

  //===========get chat history
  const fetchAllHistoryofRoom = async (roomid) => {
    try {
      const node_api_url = connection_sqliteserver_url + "/model/getChatHistory";
      const response = await fetch(node_api_url, {
        method: 'POST', // Since your API is defined as a POST endpoint
        headers: {
          'Content-Type': 'application/json', // Ensure proper headers
        },
        body: JSON.stringify({ roomid })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json(); // Parse JSON response
      console.log('Final Chat history Data:', data); // Log the received data
      // // Extract roomname and passcode
      const chatarrays = data.data.map(chatrecord => ({
        messgcontent: chatrecord.chatcontent,
        userid: chatrecord.userid,
        createddate: chatrecord.createddate
      }));
      setChatarrays(chatarrays);
      //hide loading
      setTimeout(setLoading(false), 2000);
    } catch (error) {
      console.error('Error fetching chatrooms:', error.message); // Log any error
    }
  };

  // insert new record for chat history 
  // ==============CHAT ROOM FUNCTIONS --- ADD NEW ROOM
  const AddNewRecordtoChatHistory = async (userid, roomid, chatcontent) => {
    try {
      const node_api_url = connection_sqliteserver_url + "/api/insertchathistory";
      const response = await fetch(node_api_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userid, roomid, chatcontent }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      } else {
        // call socket io to resfresh available rooms
        // Emit event to Socket.IO to refresh available rooms
        socket.emit('onTextChange', roomid);
      }

      // Parse JSON response
      const data = await response.json();
      // Log the received data
      console.log('Result after creating room:', data);

    } catch (error) {
      console.error('Error fetching chatrooms:', error.message);
    }
  };

  //================ get infor about chatrooms
  const fetchChatrooms = async () => {
    try {
      setText('');
      const node_api_url = connection_sqliteserver_url + "/model/getAllChatrooms";
      const response = await fetch(node_api_url, {
        method: 'POST', // Since your API is defined as a POST endpoint
        headers: {
          'Content-Type': 'application/json', // Ensure proper headers
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json(); // Parse JSON response
      console.log('Chatroom Data:', data); // Log the received data
      // Extract roomname and passcode
      const extractedRooms = data.data.map(room => ({
        roomname: room.roomname,
        passcode: room.passcode,
        roomid: room.id
      }));

      setRooms(extractedRooms);
    } catch (error) {
      console.error('Error fetching chatrooms:', error.message); // Log any error
    }
  };


  //===================================
  const onRoomItemClick = (roomname, roompass, roomid) => {
    setText('');
    setChatarrays([]);
    setLoading(true);
    console.log('Room name:', roomname);
    console.log('Passcode:', roompass);
    console.log('Roomid:', roomid);
    setSelectedRoomId(roomid);
    setSelectedPassCode(roompass);
    //set room name for welcome message
    setCurrentRoonName('Welcome to - ' + roomname);
    setShowPasscodeDialog(true);
  }


  const onSubmit = (e) => {
    // insert new record
    AddNewRecordtoChatHistory('1', selectedRoomId, text);
  };
  //=====================================

  const buttonTriggers = ['Enter'];
  const keyPressed = (e) => {
    if (buttonTriggers.indexOf(e.key) >= 0)
      e.preventDefault();

    // send message when a user press enter
    if (e.key === 'Enter')
      broadcastButton.current.click();
  }

  // =========CALL NODE JS SERVER 
  useEffect(() => {

    //Call to API for getting  all available rooms
    fetchChatrooms();

    //connect to socket io server
    socket = io(connection_url, { transport: ['websocket'] });

    socket.on('Res-Available-Chat-Rooms', (data) => {
      // call to refresh available rooms
      fetchChatrooms();
    });

    socket.on('Res-Room-History-Chat', (data) => {
      // getting chat history of this room
      fetchAllHistoryofRoom(data);
    });

    socket.on('on-text-change', (data) => {
      setText('');
      fetchAllHistoryofRoom(data)
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    });

    // Cleanup on unmount
    return () => {
      if (socket) socket.disconnect();
    };
  }, [setMessages, setText, showAlert]);

  return (
    <div style={{ display: "flex", justifyContent: "flex-start", "minHeight": "0px" }} className={styles.container}>
      <div style={{ "width": "99%" }}>
        <h2 style={{ fontFamily: "Russo One" }}>Welcome to Game Chat Room</h2>
        {/* RoomDialog Component */}
        <button className="btn btn-success" onClick={() => setShowDialog(true)}>
          Create New Room
        </button>
        <PassCodeDialog passcode={selectedPassCode} showloading={setLoading} roomid={selectedRoomId} show={ShowPasscodeDialog} onClose={() => setShowPasscodeDialog(false)} />
        <RoomDialog show={showDialog} onClose={() => setShowDialog(false)} />
        <hr></hr>
        <div className={chatmodulestyles.appcontainer}>
          {/* Left Panel: Channel List */}
          <div className={chatmodulestyles.channelpanel}>
            <div className={chatmodulestyles.channelheader}>ROOM AVAILABLE</div>
            <div className={chatmodulestyles.channellist}>
              {allavailablerooms.map((room, index) => (
                <div key={index} className={chatmodulestyles.channelitem} onClick={() => onRoomItemClick(room.roomname, room.passcode, room.roomid)}>
                  <div className={chatmodulestyles.channelname}>
                    {room.roomname}
                  </div>
                  <div className={chatmodulestyles.channelbar}>
                    <div
                      className={chatmodulestyles.channelbarfill}
                      style={{ width: `${Math.random() * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="pagination">
              <button className={chatmodulestyles.paginationbtn}>1</button>
              <span>/</span>
              <button className={chatmodulestyles.paginationbtn}>2</button>
            </div>
          </div>

          {/* Right Panel: Notice Area */}
          <div className={chatmodulestyles.noticepanel}>
            <div ref={chatboxRef} className={chatmodulestyles.welcomebanner} style={{ width: "100%", height: "500px", overflowY: "scroll" }}>
              <h1>{CurrentRoonName}</h1>

              {/* Right Panel: Chat history */}
              {loading ? (
                // Bootstrap spinner
                <div className="d-flex justify-content-start align-items-center mt-2" style={{ display: "block", top: "30%" }}>
                  <p className="ms-2">Loading chat history</p>&nbsp;
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                chatarrays.map((chatrecord, index) => (
                  <div className="Chatbox-container" key={index}>
                    {/* Avatar Section */}
                    <div className="Chatbox-avatar-section">
                      <img
                        src={CurrentUserID === '1' ? marioIcon : batmanIcon}
                        alt={`${chatrecord.userid}'s avatar`}
                        className="Chatbox-avatar"
                      />
                      <div className="Chatbox-online-indicator"></div>
                    </div>

                    {/* Message Section */}
                    <div className="Chatbox-message-section">
                      <div className="Chatbox-header">
                        <span className="Chatbox-username">{"User " + chatrecord.userid}</span>
                        <span className="Chatbox-time">{chatrecord.createddate}</span>
                      </div>
                      <div className="Chatbox-message">{chatrecord.messgcontent}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column ", width: "100%", padding: "5px" }}>
              <Form.Group controlId="formBasicEmail" >
                <Form.Control placeholder="Enter text" value={text} onKeyDown={(e) => keyPressed(e)} onChange={(e) => setText(e.target.value)} />
              </Form.Group>
            </div>
            <div style={{ display: "flex", width: "100%", padding: "5px" }}>
              <Button style={{ width: "100%" }} ref={broadcastButton} onClick={onSubmit} variant="primary">Send</Button>
            </div>
            {/* -------------end chat box----------------- */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
