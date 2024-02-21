import {useState, useEffect, useMemo, useCallback,  useRef} from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Modal, Button, Overlay, ListGroup } from 'react-bootstrap';
import ListPageContent from './ListPageContent';
import MergeListPageContent from './MergeListPageContent';
import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import _ from 'lodash'


export default function Listpage() {
    const { id } = useParams();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const navigate = useNavigate();
    
    const [ list, setList ] = useState([]);
    const [ show, setShow ] = useState(false);
    const [ showOverlay, setShowOverlay ] = useState(false);
    const [ appendingList, setAppendingList ] = useState({
        header : {
            name : null,
            withTag : false,
            withEvaluation : false,
            withExtraContents : false
        },
        body : {}
    })
    const [ isRequired, setIsRequired ] = useState({
        appendList : false,
        updateList : true,
    });

    const handleClose = () => setShow(false);
    const handleOpen = () => setShow(true);

    const appendList = () => {
        if(!isRequired.appendList){
            setIsRequired(()=>{
                return {...isRequired, appendList : true}
            });    
        }
        else {
            alert("Wait few moments");
        }
    };

    const [ openMergeLayer, setOpenMergeLayer ] = useState(null);

    const selectOpenMergeLayer = function(e) {
        setOpenMergeLayer(() => {
            return e;
        });
        setShowOverlay(()=>{
            const bool = (openMergeLayer === e) ? !showOverlay : true;
            return bool;
        })

    }


    useEffect(()=>{
        list.forEach((e,i) => {
            console.log(e);

            //target.current[e.header.name] = e.header.name;
        });
        console.log()
    },[list])


    useEffect(()=>{
        if(isRequired.updateList) {
            fetch(`https://localhost:8080/list/get/${id}`, {
                method : "POST",
                headers: {
                    "Content-Type" : "application/json",
                },
                credentials:'include',
            })
            .then(res => res.json())
            .then(res => {
                if(res.Got) {
                    setList(()=>[...res.Lists]);
                    setIsRequired(()=>{
                        return {...isRequired, updateList : false};
                    });
                }
                else {

                }
            })
            .catch(err => {
                console.log(err);
            })
        }


        if(isRequired.appendList) {

            if(!appendingList.header.name) {
                alert("Enter List's Name");
                setIsRequired(()=>{return {...isRequired, appendList : false}});
                return;
            }

            fetch(`https://localhost:8080/list/append/${id}`, {
                method : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body : JSON.stringify({
                "appendingList" : {...appendingList}   
                }),
                credentials : "include",
            })
            .then(res => res.json())
            .then(res => {
                if(res.Appended){
                    alert("List is Appended");
                    setAppendingList(()=> {
                        return {
                            header : {
                                name : null,
                                withTag : false,
                                withEvaluation : false,
                                withExtraContents : false
                            },
                            body : {}
                        };
                    });
                    setShow(()=>false);
                    setIsRequired(()=>{return{updateList : true, appendList : false}});
                    //navigate(`/list/${id}/${'a'}`);
                }
                else {
                    alert(res.ErrMessage);
                    setIsRequired(()=>{return{...isRequired, appendList : false}});
                }
            })
            .catch(err => {
                console.log(err);
                setIsRequired(()=>{
                    return 
                });
            });    
        }

    }, [isRequired]);


    
    useEffect(() => {
        //console.log(localStorage.getItem('token'));

        fetch('https://localhost:8080/login/session', {
            method : "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization" : `${localStorage.getItem('token')}`,
            },
            body : JSON.stringify({
                "id" : id,
            }),
            credentials : "include",
        })
        .then(res => res.json())
        .then(res => {
            if(!res.LoggedIn) {
                console.log(res);
                alert("Unacceptable Access");
                navigate("/login");
            }
            else {
                console.log("is Logged in : ", res.LoggedIn)
            }
        })
        .catch(err => {
            console.log(err);
        })
    }, [])

    useEffect(()=>{
        const handleClickOutside = (e)=>{
            console.log(e.target.parentElement.style);
            
            if(e.target !== null 
                && (!(`${e.target.className} ${e.target.parentElement.className}`.match(/(mergeList_item)|(list-group-item)|(listSetMerge)/g) !== null))) {
                setShowOverlay(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        
        return ()=>{document.removeEventListener('mousedown', handleClickOutside);}
    }, [openMergeLayer]);

    useEffect(()=>{
        console.log(query.get('list'));
    },[])

    return (
        <div className="center" style={{width:"90%", height:"90%"}}>
            <div className="lists">
                {list.map(e => {
                    return (
                            <ListPageContent 
                            list={e} 
                            selector={selectOpenMergeLayer}
                            key={e.name}
                            />
                        );
                })}
                <button className="appendList" onClick={handleOpen}
                    style = {{margin : list.length > 0 ? "10px auto" : "auto auto"}}>
                    Append List
                </button>
            </div>


            <Overlay target={openMergeLayer} show={showOverlay} placement="right" >
                <ListGroup className="mergeList">
                    <MergeListPageContent key={openMergeLayer !== null ? openMergeLayer.id : 'null'} list={openMergeLayer && openMergeLayer.id}/>
                </ListGroup>
                
            </Overlay>
            
            
            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header>
                    <Modal.Title> 
                        <div style={{fontSize:"28px", fontWeight:"700"}}> List Setting </div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div id="modal_append_list">
                        <input className="modal_ap_li_child" placeholder="List Name" onChange={(ele) => {
                                    setAppendingList(() => {
                                        const res = {...appendingList};
                                        res.header.name = ele.target.value;
                                        return res;
                                    })
                                }}/>
                        
                        {['withTag', 'withEvaluation', 'withExtraContents'].map(e => {
                            return <label key ={e}>
                                <input className="modal_ap_li_child" type="checkbox" onChange={(ele) => {
                                    setAppendingList(() => {
                                        const res = {...appendingList};
                                        res.header[e] = ele.target.checked;
                                        return res;
                                    })
                                }}/>
                                add {e.match(/with(.+)/)[1]}
                            </label>
                        })}
  
                    </div>
                    </Modal.Body>
                <Modal.Footer>
                    <Button className="btn_append_list" variant="secondary" onClick={appendList}>
                        추가
                    </Button>
                    <Button className="btn_close" variant="secondary" onClick={handleClose}>
                        닫기
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}