const express = require('express');
const mysql = require("mysql");
const dotenv = require('dotenv');
const app = express();
const path = require('path');
dotenv.config({ path: './.env'});

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
    insecureAuth: true
});

db.connect((error) => {
    if(error) {
        console.log(error);
    } else {
        console.log("MySQL connected!");
    }
});

//now to link this with the front end files
const publicDir = path.join(__dirname, '/');
app.use(express.static(publicDir));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
  
  app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
  });
  
  app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
  });
  
  app.get('/saved', (req, res) => {
    res.sendFile(path.join(__dirname, 'saved.html'));
  });
  
  const port = 3000;
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });

//now for the auth
const bcrypt = require("bcryptjs");
app.use(express.urlencoded({extended: 'false'}));
app.use(express.json());
app.post("/auth/register", (req, res) => {    
    const { name, email, password } = req.body;
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) throw err;
    
          const user = { name, email, password: hash };
    
          db.query('INSERT INTO users SET ?', user, (err) => {
            if (err) {
              console.error(err);
              if (err.code === 'ER_DUP_ENTRY') {
                res.status(400).send('Email already exists');
              } else{
                res.status(500).send('Error registering user');
              }
            } else {
              res.redirect('/login.html'); // Redirect to login page after successful registration
            }
          });
        });
      });
})

app.post('/auth/login', (req, res) => {
    const { name, password } = req.body;
  
    db.query('SELECT * FROM users WHERE name = ?', name, (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error logging in');
      } else if (results.length === 0) {
        res.status(401).send('Invalid name or password');
      } else {
        const user = results[0];
  
        // Compare the provided password with the hashed password in the database
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            console.error(err);
            res.status(500).send('Error logging in');
          } else if (isMatch) {
            res.redirect('/index.html'); // Redirect to dashboard after successful login
          } else {
            res.status(401).send('Invalid name or password');
          }
        });
      }
    });
  });
  

/*
const port = 3000; // Choose a port number (e.g., 3000)

app.get('/', (req, res) => {
  res.send('Hello, World!'); // This will send "Hello, World!" as the response for requests to the root URL ('/')
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
*/
