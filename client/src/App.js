import './App.css';
import React, {useState, useEffect } from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import LogIn from './component/LogIn';
//import List from './component/List';
import SignUp from './component/SignUp'
import NotFound from './component/NotFound';
import Testing from './component/Testing';

function App() {


  return (
    <BrowserRouter>
      <div className="contain">
        <Routes>
          <Route path="/login" element={<LogIn/>}/>
          <Route path="/signup" element={<SignUp/>}/>
          <Route path="/test" element={<Testing/>}/>
          <Route path="*" element={<NotFound></NotFound>}/>
        </Routes>
      </div>
    </BrowserRouter>

  );
}

export default App;