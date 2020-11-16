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

    async getAllDepartmentAggregatesByBudgetCycleAndDepartment(budgetCycleId, departmentId){
     const url = `departmentaggregates/${budgetCycleId}/budget-cycle/${departmentId}`;
     return await apiService.get(url);
    }

  async getAllDepartmentAggregatesByActiveVersion(activeVersionId){
    const url = `departmentaggregates/${activeVersionId}/by-version/`;
    return await apiService.get(url);

  }

    /**
    *
    * @param {*} departmentaggregateData
    * this method creates a new departmentaggregate
    */
    async saveDepartmentAggregate(departmentaggregateData, id=""){
     const url = `departmentaggregates/${id  ? id+"/" : ""}`;
     const action = id ? "put":"post";
     return  await apiService[action](url,departmentaggregateData);
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
    * This method deletes a departmentaggregate
    */
    async submitDepartmentAggregate(submissionObject){
     const url = `departmentaggregates/${submissionObject.id}/submit/`
     return await apiService.put(url, submissionObject);
    }


    /**
    *
    * @param {*} departmentaggregate
    * This method approves or rejects a departmentaggregate
    */
    async approveDepartmentAggregate(departmentaggregate, approvalObject){
     const url = `departmentaggregates/${departmentaggregate.id}/approval/`
     return await apiService.put(url, approvalObject);
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

  async getAllBudgetEntriesByDepartmentSlug(slug){
    const url = `departmentaggregates/${slug}/by-slug`;
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
