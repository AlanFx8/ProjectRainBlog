import { GETPOST_STARTED, GETPOST_SUCCEEDED, GETPOST_FAILED } from '../types/getpost_types';
import axios from 'axios';

const getPost = id => dispatch => {
    try {
        dispatch({type: GETPOST_STARTED});
        axios.get(`/api/get_post/${id}`)
        .then(res => dispatch({type: GETPOST_SUCCEEDED, payload: res.data}));
    }
    catch(error){
        dispatch({type: GETPOST_FAILED, payload: error.message});
    }
}

export { getPost }