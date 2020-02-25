// Initial State
const initialState = {
  HospitalList: [],
};

// Reducers (Modifies The State And Returns A New State)
const hospitalReducer = (state = initialState, action) => {
  switch (action.type) {
    // Login
    case 'AddHospital': {
      return {
        // State
        ...state,
        // Redux Store
        //1 -> Approve
        //0 -> Disable
        //remove -> Reject
        HospitalList: state.HospitalList.concat([
          {
            seq_sig: action.seq_sig,
            seq_end: action.seq_end,
            name: action.HospitalName,
            hospCode: action.hospCode,
            endPoint: action.HospitalEndPoint,
            status: 1,
          },
        ]),
      };
    }
    case 'UpdateHospital': {
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
