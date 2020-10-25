import ProcessingService from "../../services/processing.service";
import * as utils from "@utils";
import AppNotification from "../../appNotifications";



export const SET_ACTIVE_BUDGET_CYCLE = "SET_ACTIVE_BUDGET_CYCLE";
export const GET_ACTIVE_BUDGET_CYCLES = "GET_ACTIVE_BUDGET_CYCLES";

const processingService  = new ProcessingService();

export const setactivebudgetcycle = budgetCycleId => dispatch => {
  processingService.getBudgetCycleById(budgetCycleId).then(
      (budgetCycleResponse)=>{
        dispatch({
          type: SET_ACTIVE_BUDGET_CYCLE,
          data: budgetCycleResponse
        });
        localStorage.setItem('ACTIVE_BUDGET_CYCLE',JSON.stringify(budgetCycleResponse));
        const successNotification = {
            type:'success',
            msg:`Budget cycle selection reset to ${budgetCycleResponse.year}.`
        }
        console.log("Action log", budgetCycleResponse)
        new AppNotification(successNotification)
      }
  ).catch((error)=>{
      const errorNotification = {
          type:'error',
          msg:utils.processErrors(error)
      }
      new AppNotification(errorNotification)
  })

}


export const getactivebudgetcycle = () => dispatch => {

  processingService.getAllBudgetCycles().then(
      (budgetCycleResponse)=>{
        const allBudgetCycles = budgetCycleResponse.filter((cycle)=>{
          return cycle.is_current;
        })

        allBudgetCycles.reverse();
        dispatch({
          type: GET_ACTIVE_BUDGET_CYCLES,
          data: allBudgetCycles
        });
        const successNotification = {
            type:'success',
            msg:`Active lists refreshed.`
        }
        new AppNotification(successNotification);

      }).catch((error)=>{
      const errorNotification = {
          type:'error',
          msg:utils.processErrors(error)
      }
      new AppNotification(errorNotification)
  })


}
