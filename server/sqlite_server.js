// require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const sqlite3 = require('sqlite3').verbose();
const databasepath = './database/game.sqlite';
const crypto = require('crypto');
const cors = require('cors');
//====================
// Enable CORS for all routes
app.use(cors());

// Other middlewares
app.use(express.json());

// ENCRYTION ------ Function to hash data using MD5
function hashMD5(data) {
  return crypto.createHash('md5').update(data).digest('hex');
}

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(today.getDate()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day}`;
  // console.log(formattedDate);
  return formattedDate;
}
// Function to create tables
const createTables = async () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(databasepath, (err) => {
      if (err) {
        console.error('Error connecting to SQLite database:', err.message);
        reject(err);
        return;
      }
      console.log('Connected to the SQLite database.');

      // Create users table
      db.run(
        `CREATE TABLE IF NOT EXISTS users (
          userid INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL
        )`,
        (err) => {
          if (err) {
            console.error('Error creating users table:', err.message);
            reject(err);
          }
        }
      );

      // Create chathistory table
      db.run(
        `CREATE TABLE IF NOT EXISTS chathistory (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userid INTEGER NOT NULL,
          roomid INTEGER NOT NULL,
          chatcontent TEXT NOT NULL,
          createddate TEXT NOT NULL,
          FOREIGN KEY(userid) REFERENCES users(userid),
          FOREIGN KEY(roomid) REFERENCES chatroom(id)
        )`,
        (err) => {
          if (err) {
            console.error('Error creating chathistory table:', err.message);
            reject(err);
          } else {
            console.log('Tables created successfully.');
            resolve();
          }
        }
      );

      // Create room table
      db.run(
        `CREATE TABLE IF NOT EXISTS chatroom (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userid INTEGER NOT NULL,
          roomname TEXT NOT NULL,
          createddate TEXT NOT NULL,
          passcode TEXT NOT NULL,
          FOREIGN KEY(userid) REFERENCES users(userid)
        )`,
        (err) => {
          if (err) {
            console.error('Error creating chathistory table:', err.message);
            reject(err);
          } else {
            console.log('Tables created successfully.');
            resolve();
          }
        }
      );

      db.close((err) => {
        if (err) {
          console.error('Error closing the database connection:', err.message);
        } else {
          console.log('Database connection closed.');
        }
      });
    });
  });
};

// Function to fetch all records from the `users` table
const getAllUsers = async () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(databasepath, (err) => {
      if (err) {
        console.error('Error connecting to SQLite database:', err.message);
        reject(err);
        return;
      }
      //console.log('Connected to the SQLite database.');

      db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
          console.error('Error fetching users:', err.message);
          reject(err);
        } else {
          //console.log('User Records:');
          //console.table(rows);
          resolve(rows);
        }

        db.close((err) => {
          if (err) {
            console.error(
              'Error closing the database connection:',
              err.message
            );
          } else {
            console.log('Database connection closed.');
          }
        });
      });
    });
  });
};

// Function to fetch user details by userId
const getUserById = async (userId) => {
  return new Promise((resolve, reject) => {
    // Connect to the SQLite database
    const db = new sqlite3.Database(databasepath, (err) => {
      if (err) {
        console.error('Error connecting to SQLite database:', err.message);
        reject(err);
        return;
      }
      //console.log('Connected to the SQLite database.');

      // Query to fetch user details by userId
      const query = `SELECT * FROM users WHERE userid = ?`;
      db.get(query, [userId], (err, row) => {
        if (err) {
          console.error('Error fetching user:', err.message);
          reject(err);
        } else {
          resolve(row); // Resolve with the retrieved user record
        }

        db.close((err) => {
          if (err) {
            console.error(
              'Error closing the database connection:',
              err.message
            );
          }
        });
      });
    });
  });
};

// Function to fetch all records from the chathistory table
const getChatHistoryByRoomId = async (roomId) => {
  return new Promise((resolve, reject) => {
    // Connect to the SQLite database
    const db = new sqlite3.Database(databasepath, (err) => {
      if (err) {
        console.error('Error connecting to SQLite database:', err.message);
        reject(err);
        return;
      }
      console.log('Connected to the SQLite database.');

      // Query to fetch chat history for the specific userId
      const query = `
  SELECT 
    chathistory.userid, 
    users.email, 
    chathistory.chatcontent, 
    chathistory.createddate 
  FROM 
    chathistory 
  INNER JOIN 
    users 
  ON 
    chathistory.userid = users.userid 
  WHERE 
    chathistory.roomid = ?
  ORDER BY 
    chathistory.id;
`;
      db.all(query, [roomId], (err, rows) => {
        if (err) {
          console.error('Error fetching chat history:', err.message);
          reject(err);
        } else {
          console.log(`Chat history for userId ${roomId}:`, rows);
          resolve(rows); // Resolve with the retrieved records
        }

        db.close((err) => {
          if (err) {
            console.error(
              'Error closing the database connection:',
              err.message
            );
          } else {
            //console.log('Database connection closed.');
          }
        });
      });
    });
  });
};

// Function to insert a record into chathistory
const insertChatHistory = async (
  userid,
  roomid,
  chatcontent,
  createddate,
  callback
) => {
  const db = new sqlite3.Database(databasepath, (err) => {
    const query = `
    INSERT INTO chathistory (userid, roomid, chatcontent, createddate)
    VALUES (?, ?, ?, ?)
  `;

    db.run(query, [userid, roomid, chatcontent, createddate], function (err) {
      if (err) {
        callback(err);
      } else {
        callback(null, { id: this.lastID });
      }
    });
  });
};

// Function to insert a record into the `users` table
const insertUser = async (name, email, password) => {
  return new Promise((resolve, reject) => {
    // Connect to the SQLite database
    const db = new sqlite3.Database(databasepath, (err) => {
      if (err) {
        console.error('Error connecting to SQLite database:', err.message);
        reject(err);
        return;
      }
      //console.log('Connected to the SQLite database.');

      // Insert query
      const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
      db.run(query, [name, email, hashMD5(password)], function (err) {
        if (err) {
          console.error('Error inserting user:', err.message);
          reject(err);
        } else {
          //console.log(`User added with ID: ${this.lastID}`);
          resolve(this.lastID); // Resolve with the ID of the inserted record
        }

        db.close((err) => {
          if (err) {
            console.error(
              'Error closing the database connection:',
              err.message
            );
          } else {
            console.log('Database connection closed.');
          }
        });
      });
    });
  });
};

// Function to insert a record into the `users` table
const createNewRoom = async (userid, roomname, passcode) => {
  return new Promise((resolve, reject) => {
    // Connect to the SQLite database
    const db = new sqlite3.Database(databasepath, (err) => {
      if (err) {
        console.error('Error connecting to SQLite database:', err.message);
        reject(err);
        return;
      }
      //console.log('Connected to the SQLite database.');

      // encode passcode with MD5 hash function
      const encryptedpasscode = hashMD5(passcode);
      // Insert query
      const query = `INSERT INTO chatroom (userid, roomname, createddate, passcode) VALUES (?, ?, ?, ?)`;
      const todaydate = getTodayDate();
      db.run(
        query,
        [userid, roomname, todaydate, encryptedpasscode],
        function (err) {
          if (err) {
            console.error('Error inserting room:', err.message);
            reject(err);
          } else {
            //console.log(`New Room created with ID: ${this.lastID}`);
            resolve(this.lastID); // Resolve with the ID of the inserted record
          }

          db.close((err) => {
            if (err) {
              console.error(
                'Error closing the database connection:',
                err.message
              );
            } else {
              console.log('Database connection closed.');
            }
          });
        }
      );
    });
  });
};

// get all available chat room
const getAllAvailabelRooms = async () => {
  return new Promise((resolve, reject) => {
    // Connect to the SQLite database
    const db = new sqlite3.Database(databasepath, (err) => {
      if (err) {
        console.error('Error connecting to SQLite database:', err.message);
        reject(err);
        return;
      }
      //console.log('Connected to the SQLite database.');

      // Query to fetch chat history for the specific userId
      const query = ` SELECT * FROM chatroom ORDER BY createddate DESC`;
      db.all(query, [], (err, rows) => {
        if (err) {
          console.error('Error fetching chat history:', err.message);
          reject(err);
        } else {
          //console.log(`Get All Available room!`, rows);
          resolve(rows); // Resolve with the retrieved records
        }

        db.close((err) => {
          if (err) {
            console.error(
              'Error closing the database connection:',
              err.message
            );
          } else {
            console.log('Database connection closed.');
          }
        });
      });
    });
  });
};


const getUserByEmailAndPassword = async (email, password, res) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(databasepath);
    console.log(hashMD5(password))

    const query = "SELECT * FROM users WHERE email = ? AND password = ?";
    try {
      db.all(query, [email, hashMD5(password)], (err, rows) => {
        if (err) {
          console.error('Error fetching user info', err.message);
          res
            .status(401)
            .json({ success: false, message: 'Invalid email or password' });
        } else {
          //console.log(`Get user credentials!`, rows.length);
          if (rows.length === 1) {
            res.json({ success: true, data: rows });
          } else {
            res.json({ success: false, data: null });
          }

        }

        db.close((err) => {
          if (err) {
            console.error(
              'Error closing the database connection:',
              err.message
            );
          } else {
            //console.log('Database connection closed.');
          }
        });
      });


    } catch (err) {
      console.error('Error getting user by email and password:', err.message);
      return null;
    }
  });
};

// Using `async/await` to run both functions in sequence
const main = async () => {
  try {
    console.log('Creating tables...');
    await createTables(); // Wait for tables to be created
    console.log('Tables created. Fetching users...');
    const hashpass = hashMD5('123456789abCD!');
    const userId1 = await insertUser('tester 1', 'tester1@gmail.com', hashpass);
    console.log(`Inserted User ID: ${userId1}`);
    const userI2 = await insertUser('tester 2', 'tester2@gmail.com', hashpass);
    console.log(`Inserted User ID: ${userI2}`);
    // add new room
    const hash_roomcode = hashMD5('123');
    const roomid = await createNewRoom(userId1, 'room 1', hash_roomcode);
    // add chat history
    const todaydate = getTodayDate();

    await insertChatHistory(
      userId1,
      roomid,
      'hello world',
      todaydate,
      (err, result) => {
        if (err) {
          console.error('Error inserting chat history:', err);
        }
        console.error('Success to add history chat');
      }
    );
    // const users = await getAllUsers();
    //console.log('Fetched Users:', users);
  } catch (err) {
    console.error('Error:', err.message);
  }
};

// call main function to create database if it is not exist and insert data - it is only use for first time run app
//main();

// ============================ API AREAS FOR GET INFORMATION FROM SQL LITE =====================================================

// API endpoint to create new room
app.post('/model/createnewroom', async (req, res) => {
  // Get user data from the request body
  const { userid, roomname, passcode } = req.body;

  // Input validation
  if (!userid || !roomname || !passcode) {
    return res.status(400).json({ error: 'Cannot valid data' });
  }

  try {
    const userId = await createNewRoom(userid, roomname, passcode);
    res.json({
      success: true,
      message: 'Create New Room successfully',
      userId,
    });
  } catch (err) {
    console.error('Error inserting user:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// API endpoint to get all available chatroom
app.post('/model/getAllChatrooms', async (req, res) => {
  try {
    const chatroomData = await getAllAvailabelRooms();
    res.json({ success: true, data: chatroomData });
  } catch (err) {
    console.error('Error fetching all available chatroom:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// API endpoint to get chat history
app.post('/model/getChatHistory', async (req, res) => {
  const { roomid } = req.body; // Get userId from the client request body
  try {
    const chatHistory = await getChatHistoryByRoomId(roomid);
    res.json({ success: true, data: chatHistory });
  } catch (err) {
    console.error('Error fetching chat history:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// API endpoint to insert a new chat history record
app.post('/api/insertchathistory', async (req, res) => {
  console.log('/api/insertchathistory');
  const { userid, roomid, chatcontent } = req.body;
  // Validate input
  // if (!userid || !roomid || !chatcontent) {
  //     return res.status(400).json({ error: 'All fields are required.' });
  // }

  // Call the insert function
  const createddate = getTodayDate();
  await insertChatHistory(
    userid,
    roomid,
    chatcontent,
    createddate,
    (err, result) => {
      if (err) {
        console.error('Error inserting chat history:', err);
        return res
          .status(500)
          .json({ error: 'Failed to insert chat history.' });
      }
      res
        .status(200)
        .json({ message: 'Chat history added successfully.', id: result.id });
    }
  );
});

// API endpoint to get user details by userId
app.post('/model/getUser', async (req, res) => {
  const { userId } = req.body; // Get userId from the client request body

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const user = await getUserById(userId);
    if (user) {
      res.json({ success: true, data: user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (err) {
    console.error('Error fetching user:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// API endpoint to get All users of the databse
app.post('/model/getAllUsers', async (req, res) => {
  try {
    const AllUsersInfo = await getAllUsers();
    res.json({ success: true, data: AllUsersInfo });
  } catch (err) {
    console.error('Error fetching data:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// API endpoint to insert a user
app.post('/model/insertUser', async (req, res) => {
  // Get user data from the request body
  const { name, email, password } = req.body;

  // Input validation
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: 'Name, email, and password are required' });
  }

  try {
    const userId = await insertUser(name, email, password);
    // Call insertUser
    res.json({ success: true, message: 'User added successfully', userId });
  } catch (err) {
    console.error('Error inserting user:', err.message);
    res.status(400).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/model/login', async (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    await getUserByEmailAndPassword(email, password, res);
  } catch (err) {
    console.error('Error logging in user:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

//======= server config =============
const PORT = 5050;
const URL = `http://localhost:${PORT}/`;

server.listen(PORT, () => console.log(`Listening on ${URL}`));
