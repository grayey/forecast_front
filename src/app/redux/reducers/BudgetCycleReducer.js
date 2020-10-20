
import {
  SET_ACTIVE_BUDGET_CYCLE,
  GET_ACTIVE_BUDGET_CYCLES
} from "../actions/BudgetCycleActions";


const initialState = {
  activeBudgetCycle: {},
  allCurrentCycles:[],
};


const BudgetCycleReducer = (state = initialState, action) => {

  switch(action.type){

    case SET_ACTIVE_BUDGET_CYCLE: {
      return {
        ...state,
        activeBudgetCycle: {...action.data}
      }
    }

    case GET_ACTIVE_BUDGET_CYCLES: {
      return {
        ...state,
        allCurrentCycles:[...action.data]
      }
    }

    default:
      return {
        ...state
      };

  }

}

export default BudgetCycleReducer;
