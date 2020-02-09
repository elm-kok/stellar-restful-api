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
        //1 -> Approve
        //0 -> Disable
        //remove -> Reject
        HospitalList: state.HospitalList.concat([
          {
            seq: action.seq,
            name: action.HospitalName,
            endPoint: action.HospitalEndPoint,
            status: 1,
          },
        ]),
      };
    }
    case 'Update': {
      return {
        // State
        ...state,
        // Redux Store
        //1 -> Approve
        //0 -> Disable
        //remove -> Reject
        HospitalList: action.hospitalList,
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
