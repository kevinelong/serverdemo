const express = require("express");
const fs = require('fs');
var gravatar = require('gravatar');

let users = JSON.parse(fs.readFileSync('users.json'));
console.log(users);

const app = express();

app.use(express.json({extended: true, limit: '1mb'}));

app.get('/',(req, res) => res.sendfile("index.html") );
app.get('/register',(req, res) => res.sendfile("register.html") );
app.get('/chat',(req, res) => res.sendfile("chat.html") );

app.post('/login',(req, res) => {
  const user = users.find(u => req.body.username === u.username && req.body.password === u.password);
  res.json( user ? {result:"success", data: user} : {result:"fail", data: req.body});
});

app.post('/register',(req, res) => {
  req.body.image = gravatar.url(req.body.username);
  users.push(req.body);
  fs.writeFileSync('users.json', JSON.stringify(users));
  res.json({result:"success", data: req.body});
});

app.get('/messages',(req, res) => {
  res.json(JSON.parse(fs.readFileSync('messages.json')))
});

app.post('/messages',(req, res) => {
  if(req.body.message.length <= 0){
    res.json({result:"fail", data: req.body});
  }
  
  if("/" == req.body.message.charAt(0)){
    let command = req.body.message.slice(1,req.body.message.length);
    let remaining = req.body.message.slice(command.indexOf(" ")+1, req.body.message.length);
    let words = command.split(" ");
    if(words[0] == "buy"){
      req.body.message = `${req.body.username} buys ${remaining}.`;
      req.body.username = "SYSTEM";
    }
  }
  
  let messages = JSON.parse(fs.readFileSync('messages.json'));
  messages.push(req.body);
  fs.writeFileSync('messages.json', JSON.stringify(messages));
  res.json({result:"success", data: req.body});
});

app.listen(3000,() => {
  console.log("Started on PORT 3000");
});