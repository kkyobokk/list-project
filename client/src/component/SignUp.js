import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const  validateId = function(id) {
    return /^[a-zA-Z0-9]{5,12}$/.test(id);
}

const validatePss = function(pss) {
    return /^\S{5,30}$/.test(pss)
}

const validateAll = function(id, pss, checkPss) {
    return validateId(id) && validatePss(pss) && pss === checkPss;
}

function Signup(){
    const navigate = useNavigate();
    const [isRequired, setIsRequired] = useState(false);

    const [infos, setInfos] = useState({
        id : '',
        pss : '',
        checkPss : '',
    });

    const [sequence, setSequence] = useState([
        {
            type : 'Id',
            style : {
                fontSize : '10px',
                fontWeight : '700',
                border : 'solid 1px #000000',
                width : '100px',
                height : "70%",
                lineHeight : "20px",
                borderRadius : "5px",
                backgroundColor : "#CCCCCC"
            },
            label : "ID",
            text : "중복확인",
            onclickFunc : () => {
                
            }
        },
        {
            type : 'Pss',
            style : {},
            label : "Password",
            text : '',
            onclickFunc : () => {},
        },
        {
            type : 'CheckPss',
            style : {},
            label : "Check Password",
            text : "",
            onclickFunc : () => {}
        }])
    
    const [signupBtn, setSignupBtn] = useState({
        setting : {
            style : {
                fontWeight : '400', 
                margin : "10px auto", 
                width : "100px",
                backgroundColor : "#FFDDDD",
            },
            text : "Unaccepted"
        },
        usable : false,
        onclickFunc : () => {},
    })

    const signupBtnStyle = useMemo(() => {
        return {
        useable : {
            style : {
                fontWeight : '500', 
                margin : "10px auto", 
                width : "100px"
            },
            text : "sign up"
        },
        unusable : {
            style : {
                fontWeight : '400', 
                margin : "10px auto", 
                width : "100px",
                backgroundColor : "#FFDDDD",
            },
            text : "Unaccepted"
        }
    }}, [])

    useEffect(() => {
        setSignupBtn(() => {
            const res = {...signupBtn};
            res.usable = validateAll(infos.id, infos.pss, infos.checkPss);
            res.setting = res.usable ? signupBtnStyle.useable : signupBtnStyle.unusable;
            res.onclickFunc = !res.usable ? () => {
                if(!validateId(infos.id)) {
                    alert('Re-enter Id with 5 to 12 length only using alphabet and numbers'); 
                    return;
                }
                if(!validatePss(infos.pss)) {
                    alert('Re-enter Password with 5 to 30 length');
                    return;
                }
                if(infos.pss !== infos.checkPss) {
                    alert('Password and Password Confirmation are incorrect');
                    return;
                }
                return;
            } : signUp;
            return res;
        })
    }, [infos])

    useEffect(() => {
        setSequence(() => {
            const res = [...sequence];
            res[2].text = infos.pss !== '' && infos.checkPss !== '' ? infos.pss === infos.checkPss ? 'correct' : 'incorrect' : ''
            if(!(infos.id.length > 5 && infos.pss.length > 5 
                && infos.pss === infos.checkPss)) {
                    
                }
            return res;
        })
    }, [infos])

    useEffect(() => {
        if(!isRequired) return;
        
        fetch("https://localhost:8080/signup", {
            method : "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body : JSON.stringify({
                "id" : infos.id,
                "pss" : infos.pss,
            }),
            credentials: "include",
            })
            .then(res => res.json())
            .then(res => {
                console.log(res);
                if(!res.Err && res.IsSignedUp){
                    alert("Sign Success")
                    navigate('/login');
                }
                else {
                    setIsRequired(() => {
                            alert("Try again please");
                            console.log(res.ErrMessage);
                            return false;
                        }
                    )

                }
            })
            .catch(err => {
                setIsRequired(() => {
                        alert("Fail to Sign up");
                        console.log(err);
                        return false;
                    }
                )
            });
    }, [isRequired, infos])

    const getFunction = useMemo(() => {
        return { 
        Id : (e) => {
            setInfos(() => {
                const res = {...infos};
                res.id = e.target.value;
                return res;
            })
        },
        Pss : e => {
            setInfos(() => {
                const res = {...infos};
                res.pss = e.target.value;
                return res;
            })
        },
        CheckPss : e => {
            setInfos(() => {
                const res = {...infos};
                res.checkPss = e.target.value;
                return res;
            })
        }}
    },[infos])

    

    const signUp = useCallback(() => {
        if(!isRequired){
            setIsRequired(()=>true);
        }
        else {
            alert("Try again a few momnets later")
        }
    }, [isRequired])

    return (
        <div className = "center" style = {{height : "80%"}}>
            <div className="text" style = {{margin : ""}}>
                <h1 style={{
                color:"#FFDEEE",
                textShadow : "0px 2px 4px gray",
                }}>Sign Up</h1>
            </div> 

            <div id="signup">
                {sequence.map(e => {
                    return <div className="signupele" key = {e.type}>        
                        <div className = "signuptbLabel"> 
                            <div className="signuptbLabelele">
                                {e.label}
                            </div>
                        </div>
                        <form className="signuptbEnterele">
                            <input className="signuptbInput" name={"signuptbInput"+e.type} 
                            type = {['Pss', 'CheckPss'].includes(e.type) ? "password" : null}
                            autoComplete="off"
                            onChange = {getFunction[e.type]}
                            onClick = {e.onclickFunc} />
                            <div className="singuptbInputText" style={e.style}> {e.text} </div>
                        </form>
                    </div>
                })}
                <div id="sub" style = {signupBtn.setting.style} onClick = {signupBtn.onclickFunc}> {signupBtn.setting.text} </div>
            </div>
        </div>
        
    )
}

export default Signup;