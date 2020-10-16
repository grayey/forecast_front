import * as apiService from './apiService';


export default class PreparationService {

    constructor() {

    }



    /**
       * DEPARTMENT AGGREGATES SECTION
       */
    /**
    * This method returns a list of all departmentaggregates
    */
    async getAllDepartmentAggregates(){
     const url = 'departmentaggregates';
     return await apiService.get(url);
    }


    /**
    *
    * @param {*} departmentaggregateData
    * this method creates a new departmentaggregate
    */
    async createDepartmentAggregate(departmentaggregateData){
     const url = 'departmentaggregates/';
     return await apiService.post(url,departmentaggregateData);
    }

    /**
    *
    * @param {*} departmentaggregate
    * @param {*} id
    * This method updates a departmentaggregate
    */
    async updateDepartmentAggregate(departmentaggregate, id){
     const url =`departmentaggregates/${id}/`;
     return await apiService.put(url,departmentaggregate);

    }

    /**
    *
    * @param {*} departmentaggregate
    * This method deletes a departmentaggregate
    */
    async deleteDepartmentAggregate(departmentaggregate){
     const url = `departmentaggregates/${departmentaggregate.id}`
     return await apiService.del(url);
    }

    /**
    *
    * @param {*} departmentaggregate
    * This method toggles a departmentaggregate
    */
    async toggleDepartmentAggregate(departmentaggregate){
     departmentaggregate.is_current = !departmentaggregate.is_current;
    return this.updateDepartmentAggregate(departmentaggregate, departmentaggregate.id);
    }

    /**
     * BUDGET ENTRIES SECTION
     */
  /**
  * This method returns a list of all budgetentries
  */
  async getAllBudgetEntries(){
   const url = 'budgetentries';
   return await apiService.get(url);
  }


  /**
  *
  * @param {*} budgetentryData
  * this method creates a new budgetentry
  */
  async createBudgetEntry(budgetentryData){
   const url = 'budgetentries/';
   return await apiService.post(url,budgetentryData);
  }

  /**
  *
  * @param {*} budgetentry
  * @param {*} id
  * This method updates a budgetentry
  */
  async updateBudgetEntry(budgetentry, id){
   const url =`budgetentries/${id}/`;
   return await apiService.put(url,budgetentry);

  }

  /**
  *
  * @param {*} budgetentry
  * This method deletes a budgetentry
  */
  async deleteBudgetEntry(budgetentry){
   const url = `budgetentries/${budgetentry.id}`
   return await apiService.del(url);
  }

  /**
  *
  * @param {*} budgetentry
  * This method toggles a budgetentry
  */
  async toggleBudgetEntry(budgetentry){
   budgetentry.is_current = !budgetentry.is_current;
  return this.updateBudgetEntry(budgetentry, budgetentry.id);
  }


}
