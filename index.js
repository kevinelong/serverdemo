const express = require("express");
const fs = require('fs');

let users = JSON.parse(fs.readFileSync('users.json'));
console.log(users);

const app = express();

app.use(express.json({extended: true, limit: '1mb'}));

app.get('/',(req, res) => res.sendFile("index.html") );
app.get('/register',(req, res) => res.sendFile("register.html") );
app.get('/chat',(req, res) => res.sendFile("chat.html") );

app.post('/login',(req, res) => {
  const user = users.find(u => req.body.username === u.username && req.body.password === u.password);
  res.json( user ? {result:"success", data: user} : {result:"fail", data: req.body});
});

app.post('/register',(req, res) => {
  users.push(req.body);
  fs.writeFileSync('users.json', JSON.stringify(users));
  res.json({result:"success", data: req.body});
});

app.get('/messages',(req, res) => {
  res.json(JSON.parse(fs.readFileSync('messages.json')))
});

app.post('/messages',(req, res) => {
  let messages = JSON.parse(fs.readFileSync('messages.json'));
  messages.push(req.body);
  fs.writeFileSync('messages.json', JSON.stringify(messages));
  res.json({result:"success", data: req.body});
});

app.listen(3000,() => {
  console.log("Started on PORT 3000");
});