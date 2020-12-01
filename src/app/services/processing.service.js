
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



/**
 * [enableNextBudgetCycleVersion description]
 * @return {Promise} [description]
 * This method enables the next version of a budget cycle
 */
async enableNextBudgetCycleVersion(budgetcycle){
  const { id, next_version } = budgetcycle
  const url =`budgetcycles/${id}/enable-next-version/${next_version.id}/`;
  return await apiService.put(url);
}

/**
 * BUDGET VERSIONS SECTION
 */
/**
* This method returns a list of all budgetversions
*/
async getAllBudgetVersions(){
const url = 'budgetversions';
return await apiService.get(url);
}


/**
* This method returns a list of all budgetversions
*/
async getBudgetVersionById(budgetVersionId){
const url = `budgetversions/${budgetVersionId}`;
return await apiService.get(url);
}

async getBudgetVersionBySlug(budgetVersionSlug){
const url = `budgetversions/${budgetVersionSlug}/by-slug`;
return await apiService.get(url);
}

/**
*
* @param {*} budgetversionData
* this method creates a new budgetversion
*/
async createBudgetVersion(budgetversionData){
const url = 'budgetversions/';
return await apiService.post(url,budgetversionData);
}

/**
*
* @param {*} budgetversion
* @param {*} id
* This method updates a budgetversion
*/
async updateBudgetVersion(budgetversion, id){
const url =`budgetversions/${id}/`;
return await apiService.put(url,budgetversion);

}

/**
*
* @param {*} budgetversion
* This method deletes a budgetversion
*/
async deleteBudgetVersion(budgetversion){
const url = `budgetversions/${budgetversion.id}`
return await apiService.del(url);
}

/**
*
* @param {*} budgetversion
* This method toggles a budgetversion
*/
async toggleBudgetVersion(budgetversion){
budgetversion.is_current = !budgetversion.is_current;
return this.updateBudgetVersion(budgetversion, budgetversion.id);
}



/**
*
* @param {*} budgetversion
* This method approves or rejects a budgetversion
*/
async approveBudgetVersion(budgetversion, approvalObject){
 const url = `budgetversions/${budgetversion.id}/approval/`
 return await apiService.put(url, approvalObject);
}

}
