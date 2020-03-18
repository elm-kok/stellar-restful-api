// Initial State
const initialState = {
  loggedIn: false,
  _id: '',
  FName: '',
  LName: '',
  stellarPublicKey: '',
  mode: '',
};

// Reducers (Modifies The State And Returns A New State)
const authReducer = (state = initialState, action) => {
  switch (action.type) {
    // Login
    case 'changeMode': {
      return {
        // State
        ...state,
        // Redux Store
        mode: action.mode,
      };
    }
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
        mode: action.mode,
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
