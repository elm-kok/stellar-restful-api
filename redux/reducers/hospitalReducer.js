import {act} from 'react-test-renderer';

// Initial State
const initialState = {
  HospitalList: [],
};

// Reducers (Modifies The State And Returns A New State)
const hospitalReducer = (state = initialState, action) => {
  switch (action.type) {
    // Login
    case 'Add': {
      return {
        // State
        ...state,
        // Redux Store
        HospitalList: state.HospitalList.concat([
          [action.seq, action.HospitalName, action.HospitalEndPoint],
        ]),
      };
    }
    // Default
    default: {
      return state;
    }
  }
};

// Exports
export default hospitalReducer;
