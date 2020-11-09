import { Component } from 'react';
import * as apiService from './apiService';


export default class AppMainService extends Component {

    constructor(props) {
        super(props);
    }

    /**
     *
     *
     * Users Section
     *
     *
     *
     */




    /**
 *
 *
 * Categories Section
 *
 *
 *
 */

    /**
     * This method returns all categories
     */
    async getAllCategories() {
        return await apiService.get('categories');
    }



    /**
     *
     * ----- COMPANIES SECTION STARTS HERE -----
     *
     */


    /**
     *
     * @param {*} data
     * This method creates a new company
     */
    async createCompany(data) {
        return await apiService.post('companies', data);
    }



    /**
     *  This method gets all companies
     */
    async getAllCompanies() {
        return await apiService.get('companies');
    }


    /**
     *
     * @param {*} id
     *
     * This method gets a company by it's Id
     */
    async getCompanyId(id) {
        return await apiService.get('companies', id);

    }


    /**
     *
     * @param {*} id
     *
     * This method deletes a company
     */
    async deleteCompany(id) {
        return await apiService.del('companies', id);
    }


    /**
     *
     * @param {*} id
     * @param {*} data
     *
     * This method updates a company
     */
    async updateCompany(id, data) {
        const url = `companies/${id}`;
        return await apiService.put(url, data);
    }


    /**
     *
     * @param {*} id
     * @param {*} data
     *
     * This method toggles a company's enabled status
     */

    async toggleCompany(id, data) {
        const url = `companies/${id}`;
        return await apiService.patch(url, data);
    }


    /**
     *
     * --- ROLES SECTION HERE ----
     *
     */


     /**
      * This method returns a list of all roles
      */
    async getAllRoles(){
        const url = 'roles';
        return await apiService.get(url);
    }


    /**
     *
     * @param {*} roleData
     * this method creates a new role
     */
    async createRole(roleData){
        const url = 'roles/';
        return await apiService.post(url,roleData);
    }

    /**
     *
     * @param {*} role
     * @param {*} id
     * This method updates a role
     */
    async updateRole(role, id){
        const url =`roles/${id}/`;
        return await apiService.put(url,role);

    }

    /**
     *
     * @param {*} role
     * This method deletes a role
     */
    async deleteRole(role){
        const url = `roles/${role.id}`
        return await apiService.del(url);
    }

    /**
     *
     * @param {*} role
     * This method toggles a role
     */
    async toggleRole(role){
        role.status = !role.status
      return this.updateRole(role, role.id);
    }



    /**
     * This method returns a list of all users
     */
   async getAllUsers(){
       const url = 'users';
       return await apiService.get(url);
   }

   async getUserById(userId){
       const url = `users/${userId}`;
       return await apiService.get(url);
   }

   async getUserLoginInfo(userId){
       const url = `users/${userId}/login-info/`;
       return await apiService.get(url);
   }



   /**
    *
    * @param {*} userData
    * this method creates a new user
    */
   async createUser(userData){
       const url = 'users/';
       return await apiService.post(url,userData);
   }

   /**
    *
    * @param {*} user
    * @param {*} id
    * This method updates a user
    */
   async updateUser(user, id){
       const url =`users/${id}/`;
       return await apiService.put(url,user);

   }

   /**
    *
    * @param {*} user
    * This method deletes a user
    */
   async deleteUser(user){
       const url = `users/${user.id}`
       return await apiService.del(url);
   }

   /**
    *
    * @param {*} user
    * This method toggles a user
    */
   async toggleUser(user){
       user.status = !user.status
     return this.updateUser(user, user.id);
   }


     /**
     *
     * --- DEPARTMENTS SECTION HERE ----
     *
     */


     /**
      * This method returns a list of all departments
      */
     async getAllDepartments(){
        const url = 'departments';
        return await apiService.get(url);
    }


    /**
     *
     * @param {*} departmentData
     * this method creates a new department
     */
    async createDepartment(departmentData){
        const url = 'departments/';
        return await apiService.post(url,departmentData);
    }

    /**
     *
     * @param {*} department
     * @param {*} id
     * This method updates a department
     */
    async updateDepartment(department, id){
        const url =`departments/${id}/`;
        return await apiService.put(url,department);

    }

    /**
     *
     * @param {*} department
     * This method deletes a department
     */
    async deleteDepartment(department){
        const url = `departments/${department.id}`
        return await apiService.del(url);
    }

    /**
     *
     * @param {*} department
     * This method toggles a department
     */
    async toggleDepartment(department){
        department.status = !department.status
      return this.updateDepartment(department, department.id);
    }

    /**
        *
        * --- ITEM CATEGORIES SECTION HERE ----
        *
        */


        /**
         * This method returns a list of all itemcategories
         */
        async getAllItemCategories(){
           const url = 'itemcategories';
           return await apiService.get(url);
       }


       /**
        *
        * @param {*} itemcategoryData
        * this method creates a new itemcategory
        */
       async createItemCategory(itemcategoryData){
           const url = 'itemcategories/';
           return await apiService.post(url,itemcategoryData);
       }

       /**
        *
        * @param {*} itemcategory
        * @param {*} id
        * This method updates a itemcategory
        */
       async updateItemCategory(itemcategory, id){
           const url =`itemcategories/${id}/`;
           return await apiService.put(url,itemcategory);

       }

       /**
        *
        * @param {*} itemcategory
        * This method deletes a itemcategory
        */
       async deleteItemCategory(itemcategory){
           const url = `itemcategories/${itemcategory.id}`
           return await apiService.del(url);
       }

       /**
        *
        * @param {*} itemcategory
        * This method toggles a itemcategory
        */
       async toggleItemCategory(itemcategory){
           itemcategory.status = !itemcategory.status
         return this.updateItemCategory(itemcategory, itemcategory.id);
       }

       /**
        *
        * --- COST ITEMS SECTION HERE ----
        *
        */


        /**
         * This method returns a list of all costitems
         */
        async getAllCostItems(){
           const url = 'costitems';
           return await apiService.get(url);
       }


         /**
          * This method returns a list of all costitems by category
          */
         async getCostItemsByCategory(categoryId){
            const url = `costitems/${categoryId}/by-category`;
            return await apiService.get(url);
        }





       /**
        *
        * @param {*} costitemData
        * this method creates a new costitem
        */
       async createCostItem(costitemData){
           const url = 'costitems/';
           return await apiService.post(url,costitemData);
       }

       /**
        *
        * @param {*} costitem
        * @param {*} id
        * This method updates a costitem
        */
       async updateCostItem(costitem, id){
           const url =`costitems/${id}/`;
           return await apiService.put(url,costitem);

       }

       /**
        *
        * @param {*} costitem
        * This method deletes a costitem
        */
       async deleteCostItem(costitem){
           const url = `costitems/${costitem.id}`
           return await apiService.del(url);
       }

       /**
        *
        * @param {*} costitem
        * This method toggles a costitem
        */
       async toggleCostItem(costitem){
           costitem.status = !costitem.status
         return this.updateCostItem(costitem, costitem.id);
       }

       /**
        *
        * --- VERSION CODES SECTION HERE ----
        *
        */


        /**
         * This method returns a list of all versioncodes
         */
        async getAllVersionCodes(){
           const url = 'versioncodes';
           return await apiService.get(url);
       }


       /**
        *
        * @param {*} versioncodeData
        * this method creates a new versioncode
        */
       async createVersionCode(versioncodeData){
           const url = 'versioncodes/';
           return await apiService.post(url,versioncodeData);
       }

       /**
        *
        * @param {*} versioncode
        * @param {*} id
        * This method updates a versioncode
        */
       async updateVersionCode(versioncode, id){
           const url =`versioncodes/${id}/`;
           return await apiService.put(url,versioncode);

       }

       /**
        *
        * @param {*} versioncode
        * This method deletes a versioncode
        */
       async deleteVersionCode(versioncode){
           const url = `versioncodes/${versioncode.id}`
           return await apiService.del(url);
       }

       /**
        *
        * @param {*} versioncode
        * This method toggles a versioncode
        */
       async toggleVersionCode(versioncode){
           versioncode.status = !versioncode.status
         return this.updateVersionCode(versioncode, versioncode.id);
       }


       /**
     *
     * --- APPROVALS SECTION HERE ----
     *
     */


     /**
      * This method returns a list of all approvals
      */
     async getAllApprovals(){
        const url = 'approvals';
        return await apiService.get(url);
    }

    async bulkUpdateApprovalStages(approvalIds){
      const url = 'approvals/bulk-update/';
      return await apiService.post(url,approvalIds);
    }


    /**
     *
     * @param {*} approvalData
     * this method creates a new approval
     */
    async createApproval(approvalData){
        const url = 'approvals/';
        return await apiService.post(url,approvalData);
    }

    /**
     *
     * @param {*} approval
     * @param {*} id
     * This method updates a approval
     */
    async updateApproval(approval, id){
        const url =`approvals/${id}/`;
        return await apiService.put(url,approval);

    }

    /**
     *
     * @param {*} approval
     * This method deletes a approval
     */
    async deleteApproval(approval){
        const url = `approvals/${approval.id}`
        return await apiService.del(url);
    }

    /**
     *
     * @param {*} approval
     * This method toggles a approval
     */
    async toggleApproval(approval){
        approval.status = !approval.status
      return this.updateApproval(approval, approval.id);
    }


      /**
       APP SETTINGS SECTION
       */
      async getAppSettings(applied=''){
        const url =`app_settings/?applied=${applied}`;
        return await apiService.get(url);
      }

       /**
        * BULK AREA
        *
        */
       async downloadTemplate(){
         const url =`itemcategories/download_template/`;
         return await apiService.get(url);
       }

/**
 * [uploadBulkFile description]
 * @param  {[type]}  caller_url [description]
 * @param  {[type]}  file       [description]
 * @return {Promise}            [description]
 * This method uploads a bulk file
 */
       async uploadBulkFile(caller_url, file){
         const url =`${caller_url}/upload_bulk_file/`;
         return await apiService.postFile(url, file);
       }



}
