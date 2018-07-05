const express = require('express');
const bodyParser = require('body-parser'); // we'll need body-parser to read that json object
const jwt = require('jsonwebtoken');
const cors = require('cors');
const expressjwt = require('express-jwt');

const app = express();
const PORT = process.env.PORT || 8888;
const users = [
  { id: 1, username: 'admin', password: 'admin' },
  { id: 2, username: 'guest', password: 'guest' }
];

app.use(bodyParser.json()); // only handle json objects and fill up the req.body object

// If you have an api that runs on a different server or even a different port
// than your application and you do a fetch call. You'll get an No
// 'Access-Control-Allow-Origin' error.
app.use(cors()); // use cors middleware to allow CORS (our server can now handle requests from different origins!)

const jwtCheck = expressjwt({
  secret: 'mysupersecretkey'
});

app.get('/resources', (req, res) => {
  res.status(200).send('Public resource, you can see this');
});
app.get('/resources/secret', jwtCheck, (req, res) => {
  res.status(200).send('Secret resource, you should be logged in to see this')
});

app.get('/status', (req, res) => {
  const localTime = (new Date()).toLocaleTimeString();
  res.status(200).send(`Server time is ${localTime}.`);
});

// HANDLES USER AUTHENTICATION
app.post('/login', (req, res) => {
  //const user = req.body.username; // passed in as a JSON object
  //res.status(200).send(`You logged in with ${user}`);
  if (!req.body.username || !req.body.password) {
    res.status(400).send('You need a username and a password'); // .send doesn't stop the execution?
    return;
  }
  // find() returns the value of the first element in the array that satisfies the
  // provided testing function. Otherwise undefined is returned.
  const user = users.find(u => {
    return u.username === req.body.username && u.password === req.body.password;
  });

  if (!user) {
    res.status(401).send('User not found');
    return;
  }

  // if valid user, send token back
  const token = jwt.sign({
    sub: user.id,
    username: user.username
  }, 'mysupersecretkey', {expiresIn: '3 hours'});
  res.status(200).send({access_token: token});

});

app.get('*', (req, res) => {
  res.sendStatus(404);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});
