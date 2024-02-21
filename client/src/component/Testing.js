import React, {useState, useEffect, useRef} from 'react';
import { SHA256 } from 'crypto-js';

export default function Testing(){
    const [a,setA] = useState(
        {
            a : '1',
            b : '2',
            same : false,
        }
        );
    
    const on1 = (e) => {
        setA(() => {
            const res = {...a, b : e.target.value};
            res.same = res.a === res.b;
            return res;
        })
    }
    const on2 = (e) => {
        setA(() => {
            const res = {...a, a : e.target.value};
            res.same = res.a === res.b;
            return res;
        })
    }

    const target = useRef(null);

    useEffect(()=>{
        //console.log(SHA256(1).toString());
        const temp = target.current;
        console.log(temp);
        console.log(temp.parentElement);
        console.log(temp.childNodes[1]);
        console.log(temp.childern);
        console.log(temp.nextSibling);
        console.log(temp.previousSibling);
    },[])

    return <div style = {{display : 'flex', flexDirection : 'column', margin : "auto auto"}}>
        <h1> {[a.a, a.b, a.same].join(" ")} </h1> 
        <input onChange = {on1}></input>
        <input onChange = {on2}></input>

        <div id="temp" onClick={(e)=>{
            console.log(e.target.id);
        }}>
            Hello World!
        </div>
        <div ref={target} id="payForIt" style={{border:"5px solid #000000", textAlign:"center"}}>
            Pay for it
            <h6 className="playForIt" style={{margin:"auto auto"}}> Play for it </h6>
        </div>
    </div>
}