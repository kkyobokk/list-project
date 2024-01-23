import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const LogIn = function() {
  const navigate = useNavigate();

  const [pss, setPss] = useState('');
  const [id, setId] = useState('');


  const getId = e => {
    setId(() => {
      return e.target.value;
    })
  }
  const getPss = e => {
    setPss(() => {
      return e.target.value;
    })
  }

  const sendIDandPassword = async function() {
    
    if(id === '' && pss === '') {
      alert("Enter the correct form")
      return;
    }
    else if(id.length < 5 && pss.length < 5) {
      alert("Enter 5 or more length");
      return;
    }

    await fetch("https://localhost:8080/login", {
      method : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body : JSON.stringify({
        "id" : id,
        "pss" : pss,
      }),
      credentials: "include",
    })
    .then(res => {
      alert("Login Success")
      navigate('/');
    })
    .catch(err => {
      alert("Fail to Login")
      console.log(err)
    });
  };

  return (
    <div className="center">
        <div className="text">
          <h1 style={{
            color:"#FFDEEE",
            textShadow : "0px 2px 4px gray",
            //fontFamily : "궁서체",
            }}>List<br/>Manage</h1>
        </div>
        <br/>
        <div className="posting">
          <input type="text" name="id" id="id" className="postele" placeholder="get ID" 
          onChange={getId}/>
          <input type="password" name="pss" id="pss" className="postele" placeholder="get Password"
          onChange={getPss}/>
          <div id="sub" className="postele" 
            onClick={sendIDandPassword}> login </div>
        </div>
      </div>
  )
}

export default LogIn;