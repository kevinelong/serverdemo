const express = require("express");
const fs = require('fs');
var gravatar = require('gravatar');

let users = JSON.parse(fs.readFileSync('users.json'));
let items = JSON.parse(fs.readFileSync('items.json'));

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
  req.body.coin = 10000;
  req.body.inventory = [];
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
  
  let messages = JSON.parse(fs.readFileSync('messages.json'));
  messages.push(req.body);
  fs.writeFileSync('messages.json', JSON.stringify(messages));
  res.json({result:"success", data: req.body});

});

app.listen(3000,() => {
  console.log("Started on PORT 3000");
});