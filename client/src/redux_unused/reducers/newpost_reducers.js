import { NEWPOST_ADD, NEWPOST_SUCCEED, NEWPOST_FAILED } from '../types/newpost_types';

function newpostReducer(state = null, action){
    switch(action.type){
        case NEWPOST_ADD:
            return { validating: true };
        case NEWPOST_SUCCEED:
            return { data: action.payload, validating: false, success: true };
        case NEWPOST_FAILED:
            return { validating: false, error: action.payload};
        default:
            return {}   
    }
}

export { newpostReducer }