const express = require("express"); //WEB SERVER AND FRAMEWORK
const fs = require('fs'); // OS FILE SYSTEM
var gravatar = require('gravatar'); // GLOBAL PROFILE PICTURES FOR EMAILS

//LOAD STATIC DATA FROM "DATABASE" FILES
let users = JSON.parse(fs.readFileSync('users.json'));
let items = JSON.parse(fs.readFileSync('items.json'));

const app = express(); //CREATE INSTANCE OF WEB SERVER

app.use(express.json({extended: true, limit: '1mb'}));

//STATIC HTML TEXT FILE ROUTES MAP PATHS->FUNCTION
app.get('/',(req, res) => res.sendfile("index.html") );
app.get('/register',(req, res) => res.sendfile("register.html") );
app.get('/chat',(req, res) => res.sendfile("chat.html") );

//DYNAMIC ROUTE TO POST(CREATE) LOGIN SESSION
app.post('/login',(req, res) => {
  //FIND MATCHING USER NAME AND PASSWORD IN DATABASE
  const user = users.find(u => req.body.username === u.username && req.body.password === u.password);
  res.json( user ? {result:"success", data: user} : {result:"fail", data: req.body});
});

//REGISTER CREATE A NEW USER
app.post('/register',(req, res) => {
  req.body.image = gravatar.url(req.body.username);
  req.body.coin = 10000;
  req.body.inventory = [];
  users.push(req.body);
  fs.writeFileSync('users.json', JSON.stringify(users));
  res.json({result:"success", data: req.body});
});

// GET/READ LIST OF ALL MESSAGES
app.get('/messages',(req, res) => {
  res.json(JSON.parse(fs.readFileSync('messages.json')))
});

// CREATE A NEW MESSAGE
app.post('/messages',(req, res) => {
  if(req.body.message.length <= 0){
    res.json({result:"fail", data: req.body});
  }

  //IS THIS A SLASH COMMAND, PROCESS AS COMMAND
  if("/" == req.body.message.charAt(0)){
    let command = req.body.message.slice(1,req.body.message.length);
    let remaining = req.body.message.slice(command.indexOf(" ")+2, req.body.message.length);
    let words = command.split(" ");
    
    if(words[0] == "buy"){
      const item = items.find(o => o.name === remaining );
      if(item){
        const user = users.find(u => u.username === req.body.username );
        if(user.coin >= item.price){
          req.body.message = `${req.body.username} buys ${item.name} for ${item.price}.`;   
          user.coin -= item.price;
          user.inventory.push(item);
          fs.writeFileSync('users.json', JSON.stringify(users));
        }else{
          req.body.message = `${user.coin} cannot buy ${item.name} for ${item.price}.`;   
        }
      }else{
        req.body.message = `No such item "${remaining}".`;
      }
      req.body.username = "SYSTEM";
    }else if(words[0] == "inv"){
      const user = users.find(u => u.username === req.body.username );
      req.body.message = `INVENTORY "${  user.inventory.map(i=>i.name).join(", ") }".`;
      req.body.username = "SYSTEM";
    }
  }

  //FINALLY ACTUALLY SAVE THE MESSAGE
  let messages = JSON.parse(fs.readFileSync('messages.json'));
  messages.push(req.body);
  fs.writeFileSync('messages.json', JSON.stringify(messages));
  res.json({result:"success", data: req.body});

});

app.listen(3000,() => { //BEGIN LISTENING FOR INCOMING HTTP REQUESTS
  console.log("Started on PORT 3000");
});