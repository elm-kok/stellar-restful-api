// Imports: Dependencies
import {combineReducers} from 'redux';

// Imports: Reducers
import authReducer from './authReducer';
import hospitalReducer from './hospitalReducer';
import doctorReducer from './doctorReducer';
import patientReducer from './patientReducer';
// Redux: Root Reducer
const rootReducer = combineReducers({
  authReducer: authReducer,
  hospitalReducer: hospitalReducer,
  doctorReducer: doctorReducer,
  patientReducer: patientReducer,
});

// Exports
export default rootReducer;
