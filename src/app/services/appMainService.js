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
        * BULK AREA
        *
        */
       async downloadTemplate(){
         const url =`itemcategories/download_template/`;
         return await apiService.get(url);
       }



}
