// Initial State
const initialState = {
  loggedIn: false,
  _id: '',
  passwd: '',
  userToken: '',
};

// Reducers (Modifies The State And Returns A New State)
const authReducer = (state = initialState, action, userToken) => {
  switch (action.type) {
    // Login
    case 'LOGIN': {
      return {
        // State
        ...state,
        // Redux Store
        loggedIn: true,
        _id: action._id,
        passwd: action.passwd,
        userToken: 'abc',
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
