import {useState, useEffect, useMemo, useCallback} from 'react';
import { } from 'react-router-dom';
import '../App.css';

export default function Listpage() { 
    
    const list = []// ["hello", "bye", "sans"];

    return (
        <div className="center" style={{width:"90%", height:"90%"}}>
            <div className="lists">
                {list.map(e => {
                    return <div className="list"> {e} </div>
                })}
                <div className="appendList"
                style = {{margin : list.length > 0 ? "10px auto" : "auto auto"}}>
                    Append List
                </div>
            </div>

        </div>
    )
}