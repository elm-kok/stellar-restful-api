// Initial State
const initialState = {
  loggedIn: false,
  _id: '',
  FName: '',
  LName: '',
  stellarPublicKey: '',
};

// Reducers (Modifies The State And Returns A New State)
const authReducer = (state = initialState, action) => {
  switch (action.type) {
    // Login
    case 'LOGIN': {
      return {
        // State
        ...state,
        // Redux Store
        loggedIn: true,
        _id: action._id,
        FName: action.FName,
        LName: action.LName,
        stellarPublicKey: action.stellarPublicKey,
      };
    }
    // Default
    default: {
      return state;
    }
  }
};

// Exports
export default authReducer;
