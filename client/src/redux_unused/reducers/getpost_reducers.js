import { GETPOST_STARTED, GETPOST_SUCCEEDED, GETPOST_FAILED } from '../types/getpost_types';

var initialState = {
    blogposts: [],
    loading_posts: false,
    error: false,
    no_more_posts: false
}

function getpostReducer(state = initialState, action) {
    switch(action.type){
        case GETPOST_STARTED:
            return {
                ...state,
                loading_posts: true
            }
        case GETPOST_SUCCEEDED:
            return {
                ...state,
                blogposts: [...state.blogposts, action.payload],
                loading_posts: false
            }
        case GETPOST_FAILED :
            return {
                ...state,
                error: action.payload
            }
        default:
            return state
    }
}

export { getpostReducer };