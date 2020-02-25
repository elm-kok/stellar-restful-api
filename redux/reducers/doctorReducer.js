// Initial State
const initialState = {
  DoctorList: [],
};

// Reducers (Modifies The State And Returns A New State)
const doctorReducer = (state = initialState, action) => {
  switch (action.type) {
    // Login
    case 'AddDoctor': {
      return {
        // State
        ...state,
        // Redux Store
        //1 -> Approve
        //0 -> Disable
        //remove -> Reject
        DoctorList: state.DoctorList.concat([
          {
            seq_sig: action.seq_sig,
            name: action.DoctorName,
            status: 1,
          },
        ]),
      };
    }
    case 'UpdateDoctor': {
      return {
        // State
        ...state,
        // Redux Store
        //1 -> Approve
        //0 -> Disable
        //remove -> Reject
        DoctorList: action.doctorList,
      };
    }
    // Default
    default: {
      return state;
    }
  }
};

// Exports
export default doctorReducer;
