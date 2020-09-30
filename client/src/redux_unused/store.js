import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers/';

const middleware = [thunk];
const composeEnhancers = window._REDUX_DEVTOOLS_EXTENSION_COMPOSE_ || compose;
const initialState = {};

const store = createStore(rootReducer, initialState, composeEnhancers(applyMiddleware(...middleware)));

export default store;