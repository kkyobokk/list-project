const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');

const session = require('express-session');
const FileStore = require('session-file-store')(session);

const expressSanitizer = require('express-sanitizer');
const https = require("https");

const fs = require("fs");
const path = require("path");
const CryptoJS = require('crypto-js');
const crypto = require('crypto');
//const sha256 = CryptoJS.SHA256;
const sha256 = function(e){
  return crypto.createHash('sha256').update(e).digest('base64');
}

const customHash = function(e){
  return e.slice(0, 2).toString().toUppercase()
}


const app = express();

const options = {
  key: fs.readFileSync("./config/cert.key"),
  cert: fs.readFileSync("./config/cert.crt"),
};

app.use(cors({
  origin : 'http://localhost:3000',
  methods : ["GET", "POST"],
  credentials : true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.json());
app.use(express.urlencoded({ extended : true}));
app.use(expressSanitizer());

app.use(session({
  name : "SID",
  secret : "temporary secret key",
  resave : false,
  saveUninitialized : true,
  store : new FileStore(),
  cookie : {
    maxAge : 60*60*24*30,
    httpOnly : false,
    secure : true,
    sameSite : "none",
  }
}))

app.use((req,res,next)=>{
  console.log(req.path)
  next();
})





app.post("/login", function (req, res) {
  req.session.loggedin = true;
  res.send({loggedin : true});
});



app.post("/signup", function (req, res) {
  try {
    const id = sha256(req.body.id).toString();
    const pss = sha256(req.body.pss).toString();
    const salt = crypto.randomBytes(64).toString('base64');
    const password = sha256(`${pss}${salt}`).toString();

    const signUpPath = path.join(__dirname,'database','user_info',customHash(id))
    
    if(!fs.existsSync(signUpPath)) {
      console.log('files : ',fs.readdirSync(path.join(__dirname, 'database', 'user_info')))
      fs.mkdirSync(signUpPath);
    }

   
    fs.writeFile(path.join(signUpPath,`${id}.json`), 

      JSON.stringify({
        saltedPassword : password,
        salt : salt,
      }), 

      (err) => {
        console.log(err ? '\n\n'+err+'\n\n' : 'None');
        if(!err) {
          res.json({Err : false, ErrMassage : 'None', IsSignedUp : true})
        }
        else {
          res.json({Err : true, ErrMessage : err, IsSignedUp : false})
        }
      })

  }
  catch (err) { 
    console.log(err);
    res.json({Err : true, ErrMessage : err, IsSignedUp : false});
  }
});



app.get('/', (req, res) => {
  res.send("Hello Word")
})

https.createServer(options, app).listen(8080, () => {
  console.log("HTTPS Server is listening");
})