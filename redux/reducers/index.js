// Imports: Dependencies
import {combineReducers} from 'redux';

// Imports: Reducers
import authReducer from './authReducer';
import hospitalReducer from './hospitalReducer';

// Redux: Root Reducer
const rootReducer = combineReducers({
  authReducer: authReducer,
  hospitalReducer: hospitalReducer,
});

// Exports
export default rootReducer;
