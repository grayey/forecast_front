
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


async exportVersionByDepartment(export_info){
const { version_id, aggregate_id } = export_info;
const url = `reports/${aggregate_id}/aggregate/`
return await apiService.getFile(url);

}



}
