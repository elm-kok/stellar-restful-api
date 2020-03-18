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
            name: action.name,
            hospcode: action.hospcode,
            endpoint: action.endpoint,
            status: 1,
            date: action.date,
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
