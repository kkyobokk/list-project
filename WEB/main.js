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
const jwt = require("jsonwebtoken");

const secretKey = "temporary secret key";

const sha256 = function(e){
  const req = e.toString();
  return crypto.createHash('sha256').update(req).digest('base64')
          .toString().replace(/[/]/g, '_');
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
  secret : secretKey,
  resave : false,
  saveUninitialized : true,
  store : new FileStore(),
  cookie : {
    maxAge : 60*60*24*30,
    httpOnly : false,
    secure : true,
    sameSite : "None",
  }
}))

app.use((req,res,next)=>{
  console.log(req.path)
  next();
})





app.post("/login", function (req, res) {
  try {
    const id = sha256(req.body.id);
    const pss = sha256(req.body.pss);
    const Path = path.join(__dirname, 'database', customHash(id), id, 'userInfo.json'); 
    console.log(id);
    if(!fs.existsSync(Path)){
      res.json({Err : 4001, ErrMessage : "Invalid Id", LoggedIn : false});
    }
    else {
      fs.readFile(Path, (err, readData) => {
        const data = JSON.parse(readData);
        const salt = data.salt;
        if(err) {
          console.log(err);
          res.json({Err : true, ErrMessage : err, LoggedIn : false})
        }
        else if(data.saltedPassword !== sha256(`${pss}:${salt}`)){
          res.json({Err : 4002, ErrMessage : "Invalid Password", LoggedIn : false})
        }
        else {
          console.log(id);

          req.session.hashid = sha256(id);
          req.session.Loggedin = true;

          let token;

          if(req.body.tokeepLogin) {
            const payload = {id:sha256(id)};
            token = jwt.sign(payload, secretKey, {expiresIn:60*60*24});
            console.log("JWT generated");
          }

          res.json({
            Err : false, 
            ErrMessage : null, 
            Loggedin : true,
            token : req.body.tokeepLogin ? token : undefined,
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



app.post("/login/session", (req, res) => {
  try {
    const req_id = sha256(sha256(req.body.id));
    const res_id = req.session.hashid;
    const token = req.headers.authorization;

    if(token !== undefined && token !=="undefined") {
      jwt.verify(token, secretKey, (err, decodedToken)=>{
        if(err){
          console.log(err);
          res.json({Err : true, ErrMessage : err, LoggedIn : false});
        }
        else if(req_id === decodedToken.id){
          req.session.hashid = sha256(req.body.id);
          req.session.Loggedin = true;
          res.json({Err : false, Errmessage : null, LoggedIn : true});
        }
        else {
          res.json({Err : false, ErrMessage : "Invaild Token", LoggedIn : false});
        }
      })
    }
    else{
      const loggedin = req.session.Loggedin && res_id===req_id;
      res.json({Err : false, ErrMessage : null, LoggedIn : loggedin});
    }
    
  }
  catch(err) {
    console.log(err);
    res.json({Err : true, ErrMessage : err, LoggedIn : false})
  }
})



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




app.post("/list/get/:id", (req, res) => {
  const id = sha256(req.params.id).toString(16);
  const Path = path.join(__dirname, "database", customHash(id), id, "userLists");
  try{
    if(!fs.existsSync(Path)) {
      fs.mkdir(Path, (err) => {
        if(err) {
          res.json({Err: true, ErrMessage : err, got : false})
        }
        else {
          res.json({Err:true, ErrMessage : "File's None", Got : false});   
        }
      })
    }
    else {
      fs.readdir(Path, (err, files) => {
        const ret = files.map(e => {
          //console.log(e);
          try {
            return JSON.parse(fs.readFileSync(path.join(Path, e))).header;
          }
          catch(err){
            return null;
          }
        });
        //console.log(ret);
        res.json({Err: false, ErrMessage:null, Got : true, Lists : ret});
      })
    }  
  }
  catch(err) {
    res.json({Err : true, ErrMessage : err, Got : false});
  }
  
})



app.post("/list/append/:id", (req, res)=>{
  try{
    const ap_li = {...req.body.appendingList};
    const id = sha256(req.params.id).toString(16);
    const Path = path.join(__dirname, "database", customHash(id), id, "userLists");
    const fileName = `${sha256(ap_li.header.name).toString(16)}.json`;
    ap_li.header.timeStamp = new Date();

    console.log(ap_li.header.name);
    if(!fs.existsSync(Path)) {
      fs.mkdirSync(Path);
    }
    
    if(fs.existsSync(path.join(Path, fileName))) {
      res.json({Err : 4001, ErrMessage : "Exsisting List", Appended : false});
      return;
    }
    fs.writeFile(path.join(Path, fileName), JSON.stringify({...ap_li}), (err) => {
      console.log(sha256(ap_li.header.name))
      res.json({Err:false, ErrMessage:null, Appended : true, });
    });
  }
  catch(err) {
    console.log(err);
    res.json({Err: true, ErrMessage : err, Appended : false});
  }
})






app.get('/', (req, res) => {
  res.send("Hello Word")
})

https.createServer(options, app).listen(8080, () => {
  console.log("HTTPS Server is listening");
})