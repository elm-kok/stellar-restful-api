// Imports: Dependencies
import {combineReducers} from 'redux';

// Imports: Reducers
import authReducer from './authReducer';
import hospitalReducer from './hospitalReducer';
import doctorReducer from './doctorReducer';

// Redux: Root Reducer
const rootReducer = combineReducers({
  authReducer: authReducer,
  hospitalReducer: hospitalReducer,
  doctorReducer: doctorReducer,
});

// Exports
export default rootReducer;
