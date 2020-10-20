
import * as apiService from './apiService';


export default class ProcessingService {

    constructor() {

    }

    /**
     * BUDGET CYCLES SECTION
     */
/**
 * This method returns a list of all budgetcycles
 */
async getAllBudgetCycles(){
   const url = 'budgetcycles';
   return await apiService.get(url);
}


/**
 * This method returns a list of all budgetcycles
 */
async getBudgetCycleById(budgetCycleId){
   const url = `budgetcycles/${budgetCycleId}`;
   return await apiService.get(url);
}

/**
*
* @param {*} budgetcycleData
* this method creates a new budgetcycle
*/
async createBudgetCycle(budgetcycleData){
   const url = 'budgetcycles/';
   return await apiService.post(url,budgetcycleData);
}

/**
*
* @param {*} budgetcycle
* @param {*} id
* This method updates a budgetcycle
*/
async updateBudgetCycle(budgetcycle, id){
   const url =`budgetcycles/${id}/`;
   return await apiService.put(url,budgetcycle);

}

/**
*
* @param {*} budgetcycle
* This method deletes a budgetcycle
*/
async deleteBudgetCycle(budgetcycle){
   const url = `budgetcycles/${budgetcycle.id}`
   return await apiService.del(url);
}

/**
*
* @param {*} budgetcycle
* This method toggles a budgetcycle
*/
async toggleBudgetCycle(budgetcycle){
   budgetcycle.is_current = !budgetcycle.is_current;
 return this.updateBudgetCycle(budgetcycle, budgetcycle.id);
}

}
