import React, {useState} from 'react';

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

    return <div style = {{display : 'flex', flexDirection : 'column', margin : "auto auto"}}>
        <h1> {[a.a, a.b, a.same].join(" ")} </h1> 
        <input onChange = {on1}></input>
        <input onChange = {on2}></input>
    </div>
}