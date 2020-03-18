// Initial State
const initialState = {
  PatientList: [],
};

// Reducers (Modifies The State And Returns A New State)
const patientReducer = (state = initialState, action) => {
  switch (action.type) {
    // Login
    case 'AddPatient': {
      return {
        // State
        ...state,
        // Redux Store
        //1 -> Approve
        //0 -> Disable
        //remove -> Reject
        PatientList: state.PatientList.concat([
          {
            seq: action.seq,
            name: action.name,
            spk: action.spk,
            secretKey: action.secretKey,
            date: action.date,
          },
        ]),
      };
    }
    case 'UpdatePatient': {
      return {
        // State
        ...state,
        // Redux Store
        //1 -> Approve
        //0 -> Disable
        //remove -> Reject
        PatientList: action.patientList,
      };
    }
    // Default
    default: {
      return state;
    }
  }
};

// Exports
export default patientReducer;
