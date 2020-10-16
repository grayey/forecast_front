import React, { Component, useState, useEffect } from "react"
import { Dropdown, Row, Col, Button,Form, ButtonToolbar,Modal } from "react-bootstrap";
// import SweetAlert from "sweetalert2-react";
import swal from "sweetalert2";
import PreparationService from "../../../services/preparation.service";
import AppMainService from "../../../services/appMainService";
import * as utils from "@utils";
import { Formik } from "formik";
import * as yup from "yup";
import AppNotification from "../../../appNotifications";
import {FetchingRecords, BulkTemplateDownload} from "../../../appWidgets";
import moment from "moment";
import { RichTextEditor } from "@gull";
import { FaCog, FaArrowDown, FaArrowsAlt, FaSpinner } from "react-icons/fa";


import LaddaButton, {
    XL,
    EXPAND_LEFT,
    EXPAND_RIGHT,
    EXPAND_UP,

    CONTRACT,
  } from "react-ladda";

export class BudgetEntriesComponent extends Component{

    state = {
        editedIndex:0,
        allBudgetEntries:[],
        allItemCategories:[],
        allCostItems:[],
        showEditModal:false,
        showCreateModal:false,
        showInstructionsModal:false,
        isSaving:false,
        isFetching:true,
        fetchingCostitems:false,
        firstVersion:{},
        saveMsg:'Save',
        updateMsg:'Update',
        editedDepartmentAggregate: {},
        viewedDepartmentAggregate:{},
        createDepartmentAggregateForm: {
          unit_value: "",
          quantity:"",
          currency: "",
          naira_portion: "",
          currency_portion: "",
          total_currency: "",
          total_naira: "",
          entity: "",
          description:"",
          costitem:"",
          category:"",
          },
          updateDepartmentAggregateForm: {
            unit_value: "",
            quantity:"",
            currency: "",
            naira_portion: "",
            currency_portion: "",
            total_currency: "",
            total_naira: "",
            entity: "",
            description:"",
            costitem:"",
            category:"",
          },
          toggleFields:{
            NAIRA:false,
            DOLLAR:false,
            PERCENTAGE_SPLIT:false
          },
          availableYears:[],
          allEntities:[]

    }
    preparationService;



    constructor(props){
        super(props)
        this.preparationService = new PreparationService();
        this.appMainService = new AppMainService();
    }

    componentDidMount(){
         this.getAllBudgetEntries();
         // this.getAllVersionCodes();
         this.getAllItemCategories();
    }

    /**
     *
     * @param {*} event
     * @param {*} errors
     * @param {*} form
     */

    handleChange = async (event, form='create') => {
        const {createDepartmentAggregateForm, updateDepartmentAggregateForm} = this.state
        const eventName = event.target.name;
        const eventValue =  event.target.value;
        if(form=='create'){
            createDepartmentAggregateForm[eventName] = eventValue;
            if(eventName == 'category'){
               this.getCostItemsByCategory(eventValue);
            }
            if(eventName =='currency' ){
              await this.setCurrency(eventValue);
            }
        }else if(form=='edit'){
            updateDepartmentAggregateForm[eventName] = eventValue;
        }
        this.setState({ createDepartmentAggregateForm, updateDepartmentAggregateForm });
    }

    handleRichEditorChange = (html, form='create') => {
      const {createDepartmentAggregateForm, updateDepartmentAggregateForm} = this.state
      if(form=='create'){
        createDepartmentAggregateForm['instructions'] = html;
      }else{
        updateDepartmentAggregateForm['instructions'] = html;
      }
      this.setState({ createDepartmentAggregateForm, updateDepartmentAggregateForm });

    }

    /**
     * This method lists all versioncodes
     */
     getAllVersionCodes = async ()=>{
        this.appMainService.getAllVersionCodes().then(
            async(versioncodesResponse)=>{
                // const allVersionCodes = versioncodesResponse;
                const firstVersion = versioncodesResponse.find(v => v.step == 1);
                this.setState({firstVersion})
            }
        ).catch((error)=>{
          console.error('Version Error', error)
        })
    }

    checkSplitType = (event)=>{
      event.preventDefault();
      const eventValue = event.target.value;
      let { toggleFields } = this.state;
      if(eventValue == 'VALUES'){
        toggleFields.NAIRA = true;
        toggleFields.DOLLAR = true;
        this.toggleModal('split_type');
      }else{
        toggleFields.PERCENTAGE_SPLIT = true;
      }
      this.setState({toggleFields})
    }

  /**
   * [setCurrency description]
   * @param {[type]} eventValue                    [description]
   * @param {[type]} createDepartmentAggregateForm [description]
   */
    setCurrency = (eventValue) =>{
      const { toggleFields } = this.state;
        if(eventValue == 'NAIRA_DOLLAR') return this.toggleModal('split_type');
        toggleFields.NAIRA = eventValue == 'NAIRA';
        toggleFields.DOLLAR = eventValue == 'DOLLAR';
        this.setState({toggleFields});
  }

    /**
     * This method lists all itemcategories
     */
     getAllItemCategories = async ()=>{
       // Move to a getAllEntities method
       let { allEntities,createDepartmentAggregateForm } = this.state;
       if(!allEntities.length){
         createDepartmentAggregateForm.entity = "PRINCIPAL" // default entity
       }
       this.setState({allEntities, createDepartmentAggregateForm})
       // End getAllEntities method

        this.appMainService.getAllItemCategories().then(
            (itemcategoriesResponse)=>{
                const allItemCategories = itemcategoriesResponse;
                this.setState({ allItemCategories })
            }
        ).catch((error)=>{
            const errorNotification = {
                type:'error',
                msg:utils.processErrors(error)
            }
            new AppNotification(errorNotification)
            console.log('Error', error)
        })
    }

    /**
     * This method lists all costitems
     */
     getAllCostItems = async ()=>{

        this.appMainService.getAllCostItems().then(
            (costitemsResponse)=>{
                const allCostItems = costitemsResponse;
                this.setState({ allCostItems })
            }
        ).catch((error)=>{
            const errorNotification = {
                type:'error',
                msg:`Could not load cost items for ...`
            }
            new AppNotification(errorNotification)

        })
    }

    /**
     * This method lists cost items by category
     */
     getCostItemsByCategory = async (categoryId)=>{

        let fetchingCostitems = true;
        this.setState({ fetchingCostitems })
        this.appMainService.getCostItemsByCategory(categoryId).then(
            (costitemsResponse)=>{
             fetchingCostitems = false;
                const allCostItems = costitemsResponse;
                this.setState({ allCostItems, fetchingCostitems })
            }
        ).catch((error)=>{
           fetchingCostitems = false;
          this.setState({ fetchingCostitems })
            const errorNotification = {
                type:'error',
                msg:utils.processErrors(error)
            }
            new AppNotification(errorNotification)

        })
    }






    /**
     * This method lists all budgetentries
     */
     getAllBudgetEntries = async ()=>{
         let isFetching = false;

        this.preparationService.getAllBudgetEntries().then(
            async (budgetentriesResponse)=>{
              const allBudgetEntries = budgetentriesResponse;
              await  this.setState({ allBudgetEntries, isFetching }); // so allBudgetEntries is set

            }
        ).catch((error)=>{
            this.setState({isFetching})
            const errorNotification = {
                type:'error',
                msg:utils.processErrors(error)
            }
            new AppNotification(errorNotification)
            console.log('Error', error)
        })
    }


    /**
     * This method creates a new departmentaggregate
     */
    createDepartmentAggregate = async ()=>{
        const {createDepartmentAggregateForm, allBudgetEntries, firstVersion} = this.state;
        let isSaving = true;
        let saveMsg = 'Saving';
        this.setState({isSaving, saveMsg})
        this.preparationService.createDepartmentAggregate(createDepartmentAggregateForm).then(
            async (departmentaggregateData) => {
                isSaving = false;
                saveMsg = 'Save';
                departmentaggregateData['active_version'] = firstVersion //making sure
                allBudgetEntries.unshift(departmentaggregateData)
              await this.setState({ allBudgetEntries, isSaving, saveMsg })

                const successNotification = {
                    type:'success',
                    msg:`${departmentaggregateData.year} successfully created!`
                }
                new AppNotification(successNotification)
                this.toggleModal();
                this.resetForm();

            }
        ).catch(
            (error)=>{
                isSaving = false;
                saveMsg = 'Save';
                this.setState({ isSaving, saveMsg })
                const errorNotification = {
                    type:'error',
                    msg:utils.processErrors(error)
                }
                new AppNotification(errorNotification)
        })
    }


    viewInstructions = (viewedDepartmentAggregate) => {
      this.setState({viewedDepartmentAggregate});
      this.toggleModal('instructions');

    }


    /**
     * This method updates a new departmentaggregate
     */
    updateDepartmentAggregate = async ()=>{

        let {updateDepartmentAggregateForm, allBudgetEntries, editedDepartmentAggregate} = this.state;
        let isSaving = true;
        let updateMsg = 'Updating';
        this.setState({isSaving, updateMsg})
        this.preparationService.updateDepartmentAggregate(updateDepartmentAggregateForm, editedDepartmentAggregate.id).then(
            (updatedDepartmentAggregate)=>{
                updatedDepartmentAggregate.temp_flash = true
                isSaving = false;
                updateMsg = 'Update';
                allBudgetEntries.splice(this.state.editedIndex, 1, updatedDepartmentAggregate)
                this.setState({ allBudgetEntries, isSaving, updateMsg })
                const successNotification = {
                    type:'success',
                    msg:`Budget cycle ${updatedDepartmentAggregate.year} successfully updated!`
                }
                new AppNotification(successNotification)
                this.toggleModal('edit');

             setTimeout(async ()=>{
                    updatedDepartmentAggregate.temp_flash = false
                    allBudgetEntries.splice(this.state.editedIndex, 1, updatedDepartmentAggregate)
                    await this.setState({ allBudgetEntries, isSaving, updateMsg })
                }, 10000);

            }
        ).catch(
            (error)=>{
                isSaving = false;
                updateMsg = 'Update';
                this.setState({ isSaving, updateMsg })
                const errorNotification = {
                    type:'error',
                    msg:utils.processErrors(error)
                }
                new AppNotification(errorNotification)
        })
    }


    /**
     *
     * @param {*} modalName
     * This method toggles a modal
     */
    toggleModal = (modalName='create')=> {
        let {showEditModal, showCreateModal, showInstructionsModal, toggleFields } = this.state;
        if(modalName == 'split_type'){
            showCreateModal = !showCreateModal;
            toggleFields.PERCENTAGE_SPLIT = false;
        }else if(modalName == 'edit'){
            showEditModal = !showEditModal
        }else if(modalName=='instructions'){
          showInstructionsModal = !showInstructionsModal
        }

        this.setState({ showEditModal, showCreateModal, showInstructionsModal, toggleFields })

    }



    /**
     *
     * This method sets the departmentaggregate to be edited
     *  and opens the modal for edit
     *
     */
    editDepartmentAggregate = (editedDepartmentAggregate) => {
        const updateDepartmentAggregateForm = {...editedDepartmentAggregate}
        const {availableYears} = this.state;
        //
        availableYears.push(+editedDepartmentAggregate.year);
        availableYears.sort();
        //
        const editedIndex = this.state.allBudgetEntries.findIndex(departmentaggregate => editedDepartmentAggregate.id == departmentaggregate.id)
        this.setState({editedDepartmentAggregate, editedIndex, updateDepartmentAggregateForm, availableYears});
        this.toggleModal('edit')
    }


    /**
     *
     * @param {*} departmentaggregate
     * This method toggles a departmentaggregate's status
     */
    toggleDepartmentAggregate = (departmentaggregate)=>{
        const toggleMsg = departmentaggregate.is_current? "Disable":"Enable";
        const gL = departmentaggregate.is_current? ".":", and notifications will be sent out";


        swal.fire({
            title: `<small>${toggleMsg}&nbsp;<b>${departmentaggregate.year}</b>?</small>`,
            text: `Capture will be ${toggleMsg}d${gL}`,
            icon: "warning",
            type: "question",
            showCancelButton: true,
            confirmButtonColor: "#007BFF",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes!",
            cancelButtonText: "No"
          })
          .then(result => {
            if (result.value) {
                let { allBudgetEntries } = this.state
                const toggleIndex = allBudgetEntries.findIndex(r => r.id == departmentaggregate.id)
                // departmentaggregate.status = !departmentaggregate.status;

              this.preparationService.toggleDepartmentAggregate(departmentaggregate).then(
                (toggledDepartmentAggregate)=>{
                    allBudgetEntries.splice(toggleIndex, 1, toggledDepartmentAggregate)
                    this.setState({ allBudgetEntries })
                    const successNotification = {
                        type:'success',
                        msg:`Budget cycle ${toggledDepartmentAggregate.year} successfully ${toggleMsg}d!`
                    }
                    new AppNotification(successNotification)
                }
            ).catch(
                (error)=>{
                    const errorNotification = {
                        type:'error',
                        msg:utils.processErrors(error)
                    }
                    new AppNotification(errorNotification)
            })}

          });
    }

    /**
     *
     * @param {*} departmentaggregate
     * This method deletes a departmentaggregate
     *
     */
    deleteDepartmentAggregate = (departmentaggregate)=>{
         swal.fire({
                title: `<small>Delete&nbsp;<b>${departmentaggregate.year}</b>?</small>`,
                text: "You won't be able to revert this!",
                icon: "warning",
                type: "question",
                showCancelButton: true,
                confirmButtonColor: "#007BFF",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes!",
                cancelButtonText: "No"
              })
              .then(result => {
                if (result.value) {
                let { allBudgetEntries } = this.state
                  this.preparationService.deleteDepartmentAggregate(departmentaggregate).then(
                    async (deletedDepartmentAggregate) => {
                        allBudgetEntries = allBudgetEntries.filter(r=> r.id !== departmentaggregate.id)
                      await this.setState({ allBudgetEntries });
                        const successNotification = {
                            type:'success',
                            msg:`Budget cycle ${departmentaggregate.year} successfully deleted!`
                        }
                        new AppNotification(successNotification)
                    }
                ).catch(
                    (error)=>{
                        const errorNotification = {
                            type:'error',
                            msg:utils.processErrors(error)
                        }
                        new AppNotification(errorNotification)
                })}

              });
     }

      /**
     *
     * @param {*} modalName
     */
    resetForm = ()=> {
        const createDepartmentAggregateForm = {
            name: "",
            description: "",
          }
          this.setState({createDepartmentAggregateForm})

    }

    render(){

        return (

            <>
                <div className="specific">


                                  <Modal show={this.state.showInstructionsModal} onHide={
                                      ()=>{ this.toggleModal('instructions')}
                                      } {...this.props} id='instructions_modal'>
                                      <Modal.Header closeButton>

                                      <Modal.Title>
                                        <img src="/assets/images/logo.png" alt="Logo" className="modal-logo"  />&nbsp;&nbsp;
                                        Instructions for <b>{this.state?.viewedDepartmentAggregate?.year}</b>
                                    </Modal.Title>
                                      </Modal.Header>

                                               <Modal.Body>

                                                 <div dangerouslySetInnerHTML={{__html: this.state.viewedDepartmentAggregate.instructions}} />

                                               </Modal.Body>


                                              <Modal.Footer>




                                                      <LaddaButton
                                                          className="btn btn-secondary_custom border-0 mr-2 mb-2 position-relative"
                                                          loading={false}
                                                          progress={0.5}
                                                          type='button'
                                                          onClick={()=>this.toggleModal('instructions')}

                                                          >
                                                          Close
                                                      </LaddaButton>


                                                      </Modal.Footer>




                                  </Modal>





                <Modal show={this.state.showCreateModal} onHide={
                    ()=>{ this.toggleModal('create')}
                    } {...this.props} id='create_modal'>
                    <Modal.Header closeButton>
                    <Modal.Title>
                      <img src="/assets/images/logo.png" alt="Logo" className="modal-logo"  />&nbsp;&nbsp;
                      Currency Split
                    </Modal.Title>
                    </Modal.Header>

                             <Modal.Body>
                                 <div className="form-row">
                                   <select className="form-control" onChange={this.checkSplitType}>
                                     <option value="">Select Method</option>
                                       <option value="VALUES">Values</option>
                                     <option value="PERCENTAGE">Percentage</option>
                                   </select>
                                 </div>

                                 {
                                   this?.state?.toggleFields?.PERCENTAGE_SPLIT ?
                                   (
                                     <div className="form-row mt-2">
                                       <div className="col-md-6">
                                         <label><b>Naira percentage (%)</b></label>
                                         <input className="form-control" placeholder="e.g, 30" type="number" step="0.01"/>
                                       </div>
                                       <div className="col-md-6">
                                         <label><b>Total amount in Naira (&#x20a6;)</b></label>
                                         <input className="form-control" type="number" step="0.01"/>
                                       </div>

                                     </div>

                                   ): null

                                 }


                            </Modal.Body>

                            <Modal.Footer>
                              {
                                this?.state?.toggleFields?.PERCENTAGE_SPLIT ?
                                (
                                  <>


                                  <LaddaButton
                                      className={`btn btn-${utils.isValid(this.createDepartmentAggregateSchema, this.state.createDepartmentAggregateForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
                                      loading={this.state.isSaving}
                                      progress={0.5}
                                      type='submit'
                                      data-style={EXPAND_RIGHT}
                                      >
                                      Set
                                  </LaddaButton>
                                  </>
                                ): null
                              }

                                    </Modal.Footer>

                                  </Modal>

                <div className='float-right'>
                    <Button  variant="secondary_custom" className="ripple m-1 text-capitalize" onClick={ ()=>{ this.toggleModal('create')} } ><i className='i-Add'></i> View  instructions</Button>
                </div>

                <div className="breadcrumb">
                    <h1>Create Entries</h1>
                    <ul>
                      <li><a href="#">Bulk insert</a></li>
                        <li><a href="#">Import</a></li>
                        <li>Add lines</li>
                    </ul>

                    <div className="d-inline pl-5">
                      <BulkTemplateDownload caller="itemcategories" refresh={this.getAllItemCategories}/>
                    </div>
                </div>

                <div className="separator-breadcrumb border-top"></div>

                  <Formik
                  initialValues={this.state.createDepartmentAggregateForm}
                  validationSchema={this.createDepartmentAggregateSchema}
                  onSubmit={this.createDepartmentAggregate}
                  >
                  {({
                      values,
                      errors,
                      touched,
                      handleChange,
                      handleBlur,
                      handleSubmit,
                      isSubmitting,
                      resetForm
                  }) => {

                      return (
                      <form
                          className="needs-validation "
                          onSubmit={handleSubmit}
                          noValidate
                      >

                <div className="row mb-2">
                  <div className="card w-100">

                    <div className="card-body">

                      <div className="form-row">
                        <div className="col-md-11 pr-2">
                          <div className="form-row border-bottom pb-2">

                            <div
                                className={utils.classList({
                                "col-md-3 mb-2": true,
                                "valid-field":
                                    !errors.category && touched.category,
                                "invalid-field":
                                    errors.category && touched.category
                                })}
                            >
                                <label htmlFor="category">
                                    <b>Item Category<span className='text-danger'>*</span></b>
                                </label>

                                <select
                                  className="form-control"
                                  id="costitem_category"
                                  placeholder=""
                                  name="category"
                                  value={values.category}
                                  onChange={(event)=>this.handleChange(event)}
                                  onBlur={handleBlur}
                                  required
                                  >
                                  <option value="">Select</option>
                                  {
                                    this.state.allItemCategories.map((category)=>{
                                    return  (<option value={category.id} key={category.id}>{category.name} ({category.code})</option>)
                                    })
                                  }

                                </select>
                                <div className="valid-feedback"></div>
                                <div className="invalid-feedback">Category is required</div>
                            </div>

                              <div
                                  className={utils.classList({
                                  "col-md-3 mb-2": true,
                                  "valid-field":
                                      !errors.costitem && touched.costitem,
                                  "invalid-field":
                                      errors.costitem && touched.costitem
                                  })}
                              >
                                  <label htmlFor="costitem">
                                      <b>Cost Item<span className='text-danger'>*</span></b> {this.state.fetchingCostitems ? <FaSpinner className="spin" /> : null }
                                  </label>

                                <select
                                  className="form-control"
                                  id="costitem"
                                  placeholder=""
                                  name="costitem"
                                  value={values.costitem}
                                  onChange={(event)=>this.handleChange(event)}
                                  onBlur={handleBlur}
                                  required
                                  >
                                  <option value="">Select</option>
                                  {
                                    this.state.allCostItems.map((ci)=>{
                                    return  (<option value={ci.id} key={ci.id}>{ci?.name} ({ci?.code})</option>)
                                    })
                                  }

                                </select>
                                  <div className="valid-feedback"></div>
                                  <div className="invalid-feedback">Cost item is required</div>
                              </div>

                              <div
                                  className={utils.classList({
                                  "col-md-2 mb-2": true,
                                  "valid-field":
                                      !errors.unit_value && touched.unit_value,
                                  "invalid-field":
                                      errors.unit_value && touched.unit_value
                                  })}
                              >
                                  <label htmlFor="unit_value">
                                      <b>Unit Value<span className='text-danger'>*</span></b>
                                  </label>

                                  <input
                                  type="number"
                                  className="form-control"
                                  id="unit_value"
                                  placeholder=""
                                  step="0.0001"
                                  name="unit_value"
                                  value={values.unit_value}
                                  onChange={(event)=>this.handleChange(event)}
                                  onBlur={handleBlur}
                                  required
                                  />

                                  <div className="valid-feedback"></div>
                                  <div className="invalid-feedback">Unit Value is required</div>
                              </div>

                              <div
                                  className={utils.classList({
                                  "col-md-2 mb-2": true,
                                  "valid-field":
                                      !errors.quantity && touched.quantity,
                                  "invalid-field":
                                      errors.quantity && touched.quantity
                                  })}
                              >
                                  <label htmlFor="departmentaggregate_name">
                                      <b>Quantity<span className='text-danger'>*</span></b>
                                  </label>

                                  <input
                                  type="number"
                                  className="form-control"
                                  id="quantity"
                                  placeholder=""
                                  name="quantity"
                                  value={values.quantity}
                                  onChange={(event)=>this.handleChange(event)}
                                  onBlur={handleBlur}
                                  required
                                  />

                                  <div className="valid-feedback"></div>
                                  <div className="invalid-feedback">Quantity is required</div>
                              </div>

                              <div
                                  className={utils.classList({
                                  "col-md-2 mb-2": true,
                                  "valid-field":
                                      !errors.currency && touched.currency,
                                  "invalid-field":
                                      errors.currency && touched.currency
                                  })}
                              >
                                  <label htmlFor="departmentaggregate_name">
                                      <b>Currency<span className='text-danger'>*</span></b>
                                  </label>



                                  <select
                                    className="form-control"
                                    id="currency"
                                    placeholder=""
                                    name="currency"
                                    value={values.currency}
                                    onChange={(event)=>this.handleChange(event)}
                                    onBlur={handleBlur}
                                    required
                                    >
                                    <option value="">Select</option>
                                    <option value="NAIRA">Naira</option>
                                    <option value="DOLLAR">Dollar</option>
                                    <option value="NAIRA_DOLLAR">Naira/Dollar</option>

                                  </select>

                                  <div className="valid-feedback"></div>
                                  <div className="invalid-feedback">Currency is required</div>
                              </div>

                              </div>

                              <div className="form-row pt-2">

                                  {
                                    this?.state?.toggleFields?.NAIRA ?
                                    (
                                      <div
                                          className={utils.classList({
                                          "col-md-2 mb-2": true,
                                          "valid-field":
                                              !errors.naira_portion  && touched.naira_portion,
                                          "invalid-field":
                                              errors.naira_portion && touched.naira_portion
                                          })}
                                      >
                                          <label htmlFor="naira_portion">
                                              <b>Naira Portion (&#x20a6;)<span className='text-danger'>*</span></b>
                                          </label>



                                          <input
                                          type="number"
                                          className="form-control"
                                          id="naira_portion"
                                          placeholder=""
                                          name="naira_portion"
                                          value={values.naira_portion}
                                          onChange={(event)=>this.handleChange(event)}
                                          onBlur={handleBlur}
                                          step="0.0001"
                                          required
                                          />

                                          <div className="valid-feedback"></div>
                                          <div className="invalid-feedback">Naira Portion is required</div>
                                      </div>
                                    ) : null
                                  }
                                  {
                                    this?.state?.toggleFields?.DOLLAR ?
                                    (
                                      <div
                                          className={utils.classList({
                                          "col-md-2 mb-2": true,
                                          "valid-field":
                                              !errors.currency_portion && touched.currency_portion,
                                          "invalid-field":
                                              errors.currency_portion && touched.currency_portion
                                          })}
                                      >
                                          <label htmlFor="currency_portion">
                                              <b>Dollar Portion ($)<span className='text-danger'>*</span></b>
                                          </label>

                                          <input
                                          type="number"
                                          className="form-control"
                                          id="currency_portion"
                                          placeholder=""
                                          step="0.0001"
                                          name="currency_portion"
                                          value={values.currency_portion}
                                          onChange={(event)=>this.handleChange(event)}
                                          onBlur={handleBlur}
                                          required
                                          />

                                          <div className="valid-feedback"></div>
                                          <div className="invalid-feedback">Dollar portion is required</div>
                                      </div>
                                    ): null

                                  }




                                  <div
                                      className={utils.classList({
                                      "col-md-3 mb-2": true,
                                      "valid-field":
                                          !errors.entity && touched.entity,
                                      "invalid-field":
                                          errors.entity && touched.entity
                                      })}
                                  >
                                      <label htmlFor="entity">
                                          <b>Entry type<span className='text-danger'>*</span></b>
                                      </label>

                                      <select
                                        className="form-control"
                                        id="entity"
                                        placeholder=""
                                        name="entity"
                                        value={values.entity}
                                        onChange={(event)=>this.handleChange(event)}
                                        onBlur={handleBlur}
                                        required
                                        >
                                        <option value="">Select</option>
                                        <option value="PRINCIPAL">Principal</option>


                                      </select>

                                      <div className="valid-feedback"></div>
                                      <div className="invalid-feedback">Entity is required</div>
                                  </div>

                                  <div
                                      className={utils.classList({
                                      "col-md-4 mb-2": true,
                                      "valid-field":
                                          !errors.description && touched.description,
                                      "invalid-field":
                                          errors.description && touched.description
                                      })}
                                  >
                                      <label htmlFor="departmentaggregate_name">
                                          <b>Line description<span className='text-danger'>*</span></b>
                                      </label>

                                      <input
                                      type="text"
                                      className="form-control"
                                      id="description"
                                      placeholder=""
                                      name="description"
                                      value={values.description}
                                      onChange={(event)=>this.handleChange(event)}
                                      onBlur={handleBlur}
                                      required
                                      />

                                      <div className="valid-feedback"></div>
                                      <div className="invalid-feedback">Description is required</div>
                                  </div>

                                  </div>

                        </div>

                        <div className="col-md-1 border-left pt-3">

                          <div className=" ml-4 mt-5">

                            <LaddaButton
                                className={`btn btn-${utils.isValid(this.createDepartmentAggregateSchema, this.state.createDepartmentAggregateForm) ? 'success':'secondary_custom'} border-0 mr-2 mb-2 position-relative`}
                                loading={this.state.isSaving}
                                progress={0.5}
                                type='submit'
                                data-style={EXPAND_RIGHT}
                                >
                                Add <FaArrowDown/>
                            </LaddaButton>

                          </div>

                        </div>




                      </div>







                    </div>

                  </div>
            </div>
          </form>
          );
      }}

      </Formik>

                <div className="row mb-4">

                    <div className="col-md-12 mb-4">
                        <div className="cardx text-left">
                            <div className="card-body">
                              <div className="float-right">
                                <div className="input-group mb-3">
                                  <div className="input-group-prepend">
                                    <span className="input-group-text bg-info_custom text-white">
                                      Import previous entries

                                    </span>
                                  </div>
                                  <select className="form-control">
                                    <option>Select Version</option>
                                      <option>2020 (BV1)</option>
                                        <option>2020 (BV2)</option>
                                    <option>2019 (BV1)</option>

                                  </select>

                                  <div className="input-group-append">
                                    <Dropdown>
                                      <Dropdown.Toggle variant="info_custom" className="text-white">
                                        <FaCog/>
                                      </Dropdown.Toggle>
                                      <Dropdown.Menu>
                                        <Dropdown.Item onClick={()=>console.log('IMporting')}>Import <FaArrowDown/> </Dropdown.Item>
                                        <Dropdown.Divider />
                                        <Dropdown.Item onClick={()=>console.log('Adjusting')}>Adjust Imported Total <FaArrowsAlt/> </Dropdown.Item>
                                      </Dropdown.Menu>
                                    </Dropdown>
                                  </div>
                                </div>
                              </div>

                            <div className="float-left">
                                <img src="/assets/images/logo.png" alt="Logo" className="modal-logo"/> &nbsp;&nbsp;<b><span className='text-danger'>*</span>Conversion rate: 1USD = &#x20a6;365</b>
                            </div>


                            {/* <div style={{"maxHeight":"500px", "overflowY":"scroll"}}>
                                <h4 className="card-title"><b>Budget Cycle 2021</b></h4>
                                <div className="card-footer border-top">

                                  <div className="float-right">
                                    <LaddaButton
                                        className={`btn btn-${utils.isValid(this.createDepartmentAggregateSchema, this.state.createDepartmentAggregateForm) ? 'success':'secondary_custom'} border-0 mr-2 mb-2 position-relative`}
                                        loading={this.state.isSaving}
                                        progress={0.5}
                                        type='submit'
                                        data-style={EXPAND_RIGHT}
                                        >
                                        Add <FaArrowDown/>
                                    </LaddaButton>
                                  </div>

                                </div>
                            */}

                            <div className="table-responsive">
                                    <table className="display table table-striped table-hover " id="zero_configuration_table" style={{"width":"100%"}}>
                                        <thead>
                                            <tr className="ul-widget6__tr--sticky-th">
                                              <th>
                                                 #
                                               </th>

                                               <th>
                                                Cost item
                                               </th>

                                               <th>
                                                Category
                                               </th>

                                               <th>
                                                 Entity
                                               </th>

                                               <th>
                                                 Description
                                               </th>
                                               <th>
                                                 Unit value
                                               </th>
                                               <th>
                                                 Quantity
                                               </th>

                                               <th class="text-right">
                                                 Naira portion (&#x20a6;)
                                               </th>
                                               <th class="text-right">
                                                 Dollar portion ($)
                                               </th>
                                               <th class="text-right">
                                                 Total in Naira (&#x20a6;)
                                               </th>
                                               <th class="text-right" colSpan="2">
                                                 Total in USD ($)
                                               </th>
                                               <th >
                                                 Action
                                               </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {
                                          this.state.allBudgetEntries.length ?  this.state.allBudgetEntries.map( (departmentaggregate, index)=>{
                                                return (
                                                    <tr key={departmentaggregate.id} className={departmentaggregate.temp_flash ? 'bg-success text-white':''}>
                                                        <td>
                                                            <b>{index+1}</b>.
                                                        </td>
                                                        <td>
                                                            {departmentaggregate?.year}
                                                        </td>
                                                        <td>
                                                          {departmentaggregate?.active_version?.name} ({departmentaggregate?.active_version?.code})
                                                        </td>
                                                        <td class="text-center">
                                                          <a onClick={()=>this.viewInstructions(departmentaggregate)}  className="text-primary long-view">View</a>
                                                        </td>
                                                        <td>
                                                          {departmentaggregate?.currency_conversion_rate}
                                                        </td>
                                                        <td>
                                                          {utils.formatDate(departmentaggregate?.start_date)}

                                                        </td>
                                                        <td>
                                                          {utils.formatDate(departmentaggregate?.end_date)}
                                                        </td>

                                                        <td>
                                                        <Form>

                                                             <Form.Check
                                                                    checked={departmentaggregate.is_current}
                                                                    type="switch"
                                                                    id={`custom-switch${departmentaggregate.id}`}
                                                                    label={departmentaggregate.is_current ? 'Active' : 'Inactive'}
                                                                    className={departmentaggregate.is_current ? 'text-success' : 'text-danger'}
                                                                    onChange={()=> this.toggleDepartmentAggregate(departmentaggregate)}
                                                                />


                                                            </Form>
                                                        </td>
                                                        <td>
                                                        {utils.formatDate(departmentaggregate.created_at)}
                                                        </td>
                                                        <td>
                                                        {utils.formatDate(departmentaggregate.updated_at)}
                                                        </td>

                                                        <td>
                                                        <Dropdown key={departmentaggregate.id}>
                                                            <Dropdown.Toggle variant='secondary_custom' className="mr-3 mb-3" size="sm">
                                                            Manage
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu>
                                                            <Dropdown.Item onClick={()=> {
                                                                this.editDepartmentAggregate(departmentaggregate);
                                                            }} className='border-bottom'>
                                                                <i className="nav-icon i-Pen-2 text-success font-weight-bold"> </i> Edit
                                                            </Dropdown.Item>
                                                            <Dropdown.Item className='text-danger' onClick={
                                                                ()=>{this.deleteDepartmentAggregate(departmentaggregate);}
                                                            }>
                                                                <i className="i-Close-Window"> </i> Delete
                                                            </Dropdown.Item>
                                                            {/* <Dropdown.Item>
                                                                <i className="i-Money-Bag"> </i> Something else here
                                                            </Dropdown.Item> */}
                                                            </Dropdown.Menu>
                                                        </Dropdown>

                                                        </td>

                                                    </tr>
                                                )


                                            }) :
                                            (
                                                <tr>
                                                    <td className='text-center' colSpan='13'>
                                                    <FetchingRecords isFetching={this.state.isFetching}/>
                                                    </td>
                                                </tr>
                                            )
                                        }

                                        </tbody>
                                        <tfoot>
                                            <tr>
                                            <td colSpan="13">

                                            </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            <div className="card-footerx">
                              <div className="float-right">

                                    <LaddaButton
                                        className={`btn btn-${utils.isValid(this.createDepartmentAggregateSchema, this.state.createDepartmentAggregateForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
                                        loading={this.state.isSaving}
                                        progress={0.5}
                                        type='submit'
                                        data-style={EXPAND_RIGHT}
                                        >
                                        {this.state.saveMsg}
                                    </LaddaButton>

                              </div>
                            </div>
                            </div>
                        </div>
                    {/* </div> */}
                    {/* <!-- end of col--> */}



                </div>


                </div>

            </>
        )



    }

createDepartmentAggregateSchema = yup.object().shape({
        unit_value: yup.number().required("Unit value is required"),
        quantity: yup.number().required("Quantity is required"),
        currency: yup.string().required("Currency is required"),
        naira_portion: yup.number(),
        currency_portion: yup.number(),
        total_currency: yup.string(),
        total_naira: yup.number(),
        entity: yup.string().required("Entry type is required"),
        description: yup.string().required("Description is required"),
        costitem: yup.string().required("Costitem is required"),
        category: yup.string().required("Category is required"),
      });


updateDepartmentAggregateSchema = yup.object().shape({
          unit_value: yup.number().required("Unit value is required"),
          quantity: yup.number().required("Quantity is required"),
          currency: yup.string().required("Currency is required"),
          naira_portion: yup.number(),
          currency_portion: yup.number(),
          total_currency: yup.string(),
          total_naira: yup.number(),
          entity: yup.string().required("Entity is required"),
          description: yup.string().required("Description is required"),
          costitem: yup.string().required("Costitem is required"),
          category: yup.string().required("Category is required"),
        });

}




export default BudgetEntriesComponent
