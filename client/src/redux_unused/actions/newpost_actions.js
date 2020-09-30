import { NEWPOST_ADD, NEWPOST_SUCCEED, NEWPOST_FAILED } from '../types/newpost_types';
import axios from 'axios';

const addNewPost = item => dispatch => {
    try {
        dispatch({ type: NEWPOST_ADD });
        axios.post('/api/add_post', item).then(res => 
            dispatch({type: NEWPOST_SUCCEED, payload: res.data})
        )
    }
    catch (error){
        dispatch({type: NEWPOST_FAILED, payload: error.message});
    }
}

export { addNewPost }