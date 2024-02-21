import {useState, useEffect, useMemo, useCallback, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import { Overlay, ListGroup, Button } from 'react-bootstrap';
import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function MergeListPageContent({ list }){
    const [ mergeList, setMergeList ] = useState(list);
    console.log()

    useEffect(()=>{
        console.log(mergeList);
    }, [mergeList]);

    return (
        <ListGroup>
            <ListGroup.Item className="mergeList_item">
                <input placeholder={mergeList}/>
            </ListGroup.Item>
            <ListGroup.Item className="mergeList_item">
                
            </ListGroup.Item>
            <ListGroup.Item className='mergeList_item'>
                <div style={{justifyContent:"center"}}>
                    <Button className="mergeList_item" variant='secondary' style={{fontSize:'12px',}}>Merge</Button>
                </div>
            </ListGroup.Item>
        </ListGroup>
    )
}