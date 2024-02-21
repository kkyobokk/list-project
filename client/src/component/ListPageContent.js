import {useState, useEffect, useMemo, useCallback, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import { Overlay, ListGroup } from 'react-bootstrap';
import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';


export default function ListPageContent({ list, selector}){
    const {name, timeStamp, ...withs} = list;

    const mergeButton = (e) => {
        selector(e.target);
    }


    return (
        <div className="list" onClick={()=>{}}>
            <div style={{display:"none", flexDirection:"column"}}>
                {Object.keys(withs).map((e, i) => {
                    return <div key={e} className='withSelector' style={{backgroundColor : withs[e] ? '#77aaff':'#dddddd'}}>  
                            {['T','V','E'][i]}
                        </div>
                })}    
            </div>

            <div className="listName">
                {name}
                <div style={{fontSize:"10px"}}>
                    {timeStamp.slice(0, 10)}
                </div>
            </div> 
            
            <button className="listSetMerge" id={name} onClick={mergeButton}/>

        </div>
    )
}