const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');

const session = require('express-session');
const FileStore = require('session-file-store')(session);
const cookieParser = require('cookie-parser');

const expressSanitizer = require('express-sanitizer');
const https = require("https");

const fs = require("fs");
const path = require("path");
const crypto = require('crypto');
const sha256 = function(e){
  return crypto.createHash('sha256').update(e).digest('base64');
}

const customHash = function(e){
  return e.slice(0, 2).toUpperCase()
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
app.use(cookieParser());

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
  try {
    const id = sha256(req.body.id).toString(16);
    const pss = sha256(req.body.pss).toString(16);
    const Path = path.join(__dirname, 'database', customHash(id), id, 'userInfo.json'); 
    if(!fs.existsSync(Path)){
      res.json({Err : 4001, ErrMessage : "Invalid Id", LoggedIn : false});
    }
    else {
      fs.readFile(Path, (err, readData) => {
        const data = JSON.parse(data);
        const salt = data.salt;
        if(data.saltedPassword !== sha256(`${pss}:${salt}`).toString('base64')){
          res.json({Err : 4002, ErrMessage : "Invalid Password", LoggedIn : false})
        }
        else {
          req.session.Loggedin = true;
          res.json({
            Err : false, 
            ErrMessage : null, 
            Loggedin : true,
            token : req.body.tokeepLogin ? sha256(`${id}:${salt}`).toString(16) : undefined,
          });
        }
      })
    }
  }
  catch (err) {
    console.log(err);
    res.json({Err : true, ErrMessage : err, LoggedIn : false});
  }
});



app.post("/signup/toSignUp", function (req, res) {
  try {
    const id = sha256(req.body.id).toString(16);
    const pss = sha256(req.body.pss).toString(16);
    const salt = crypto.randomBytes(64).toString('base64');
    const password = sha256(`${pss}:${salt}`).toString('base64');

    const signUpPath = path.join(__dirname,'database',customHash(id), id)
    
    if(!fs.existsSync(signUpPath)) {
      fs.mkdirSync(signUpPath,  { recursive : true });
    }
   
    fs.writeFile(path.join(signUpPath, `userInfo.json`), 
      JSON.stringify({
        saltedPassword : password,
        salt : salt,
      }), 
      (err_1) => {
        console.log(err_1 ? '\n\n'+err_1+'\n\n' : 'None');
        if(!err_1) {
            fs.mkdirSync(path.join(signUpPath, 'userLists'))
            res.json({Err : false, ErrMessage : 'None', IsSignedUp : true});
        }
        else {
          console.log(err_1);
          res.json({Err : true, ErrMessage : err_1, IsSignedUp : false})
        }
      }
    )
  }
  catch (err) { 
    console.log(err);
    res.json({Err : true, ErrMessage : err, IsSignedUp : false});
  }
});


app.post("/signup/checkId", function(req, res){
  try {
    const id = sha256(req.body.id).toString(16);
    const dir = customHash(id);
    const isDuplicated = fs.existsSync(path.join(__dirname, "database", dir, id));
    res.json({Err : false, ErrMessage : null, isNotDuplicated : !isDuplicated});
  }
  catch (err) {
    console.log(err);
    res.json({Err : true, ErrMessage : err, isDuplicated : null});
  }
})






app.get('/', (req, res) => {
  res.send("Hello Word")
})

https.createServer(options, app).listen(8080, () => {
  console.log("HTTPS Server is listening");
})