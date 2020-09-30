import { combineReducers } from 'redux';
import { newpostReducer } from './newpost_reducers';
import { getpostReducer } from './getpost_reducers';

export default combineReducers({
    newpostReducer,
    getpostReducer
});