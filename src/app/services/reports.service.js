
import * as apiService from './apiService';


export default class ReportsService {

    constructor() {

    }

/**
 * This method returns a department's report over budgetcycle(s)
 */
async getReportByDepartment(filterObject){
   const url = 'reports/by-department/';
   return await apiService.post(url, filterObject);
}



}
