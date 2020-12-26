import React, { Component, useState, useEffect } from "react"
import { Dropdown, Row, Col, Button,Form, ButtonToolbar,Modal } from "react-bootstrap";
// import SweetAlert from "sweetalert2-react";
import swal from "sweetalert2";
import ProcessingService from "../../../services/processing.service";
import AppMainService from "../../../services/appMainService";
import * as utils from "@utils";
import { Formik } from "formik";
import * as yup from "yup";
import AppNotification from "../../../appNotifications";
import jwtAuthService  from "../../../services/jwtAuthService";

import { FetchingRecords, CustomSlider, ErrorView } from "../../../appWidgets";
import moment from "moment";
import { RichTextEditor } from "@gull";
import { FaArrowRight } from "react-icons/fa";
import { VIEW_FORBIDDEN } from "app/appConstants";



import LaddaButton, {
    XL,
    EXPAND_LEFT,
    EXPAND_RIGHT,
    EXPAND_UP,

    CONTRACT,
  } from "react-ladda";

export class BudgetCyclesComponent extends Component{

  CAN_VIEW_ALL = false;
  CAN_CREATE  = false;
  CAN_EDIT  = false;
  CAN_ENABLE_NEW_VERSION  = false;
  CAN_TOGGLE_STATUS = false;


    state = {
        editedIndex:0,
        allBudgetCycles:[],
        showEditModal:false,
        showCreateModal:false,
        showInstructionsModal:false,
        isSaving:false,
        isFetching:true,
        firstVersion:{},
        allVersionCodes:[],
        saveMsg:'Save',
        updateMsg:'Update',
        editedBudgetCycle: {},
        viewedBudgetCycle:{},
        versionMigrationOptions:[
          'AUTO',
          'MANUAL'
        ],
        createBudgetCycleForm: {
            year: "",
            start_date: "",
            end_date: "",
            currency_conversion_rate: "",
            instructions: "",
          },
          updateBudgetCycleForm: {
            year: "",
            start_date: "",
            end_date: "",
            currency_conversion_rate: "",
            instructions: "",
          },
          availableYears:[]

    }
    processingService;



    constructor(props){
        super(props)
        this.processingService = new ProcessingService();
        this.appMainService = new AppMainService();

        const componentName = "Processing___Budget_Cycles";
        const componentPermissions = utils.getComponentPermissions(componentName, props.route.auth);
        this.userPermissions = utils.comparePermissions(jwtAuthService.getUserTasks(), componentPermissions);
        this.CAN_VIEW_ALL = this.userPermissions.includes(`${componentName}__CAN_VIEW_ALL`);
        this.CAN_CREATE = this.userPermissions.includes(`${componentName}__CAN_CREATE`);
        this.CAN_EDIT = this.userPermissions.includes(`${componentName}__CAN_EDIT`);
        this.CAN_ENABLE_NEW_VERSION = this.userPermissions.includes(`${componentName}__CAN_ENABLE_NEW_VERSION`);
        this.CAN_TOGGLE_STATUS = this.userPermissions.includes(`${componentName}__CAN_TOGGLE_STATUS`);



    }

    componentDidMount = async () => {
           this.getAllVersionCodes();

    }

    /**
     *
     * @param {*} event
     * @param {*} errors
     * @param {*} form
     */

    handleChange = (event, form='create') => {
        const {createBudgetCycleForm, updateBudgetCycleForm} = this.state
        if(form=='create'){
            createBudgetCycleForm[event.target.name] = event.target.value;
        }else if(form=='edit'){
            updateBudgetCycleForm[event.target.name] = event.target.value;
        }
        this.setState({ createBudgetCycleForm, updateBudgetCycleForm });
    }

    handleRichEditorChange = (html, form='create') => {
      const {createBudgetCycleForm, updateBudgetCycleForm} = this.state
      if(form=='create'){
        createBudgetCycleForm['instructions'] = html;
      }else{
        updateBudgetCycleForm['instructions'] = html;
      }
      this.setState({ createBudgetCycleForm, updateBudgetCycleForm });

    }

    /**
     * This method lists all versioncodes
     */
     getAllVersionCodes = async ()=>{
        this.appMainService.getAllVersionCodes().then(
            async(versioncodesResponse)=>{
                const allVersionCodes = versioncodesResponse;
                const firstVersion = versioncodesResponse.find(v => v.step == 1);
                await this.setState({ firstVersion, allVersionCodes })
                this.getAllBudgetCycles();

            }
        ).catch((error)=>{
          this.getAllBudgetCycles();

          console.error('Version Error', error)
        })
    }





    /**
     * This method lists all budgetcycles
     */
     getAllBudgetCycles = async ()=>{
         let isFetching = false;
         const { allVersionCodes } = this.state;

        this.processingService.getAllBudgetCycles().then(
            async (budgetcyclesResponse)=>{
              const allBudgetCycles = budgetcyclesResponse;
              allBudgetCycles.forEach((cycle)=>{
                const { budgetversions } = cycle;
                cycle.active_version = budgetversions.find(version=>version.is_active);
                const present_v = cycle.active_version.version_code;
                const next_v = allVersionCodes.find(av => av.step == present_v.step + 1);
                if(next_v){
                  cycle.next_version = next_v
                }

              })
              await  this.setState({ allBudgetCycles, isFetching }); // so allBudgetCycles is set
              this.filterYears();

                console.log('BudgetCycles response', allBudgetCycles)
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
     *
     * @type {[type]}
     */
     getFutureYears = (year, count=10)=>{
      const futureYears = [];
      let i = 0;
      while (i < count){
        futureYears.push(+year + i);
        i++;
      }
      return futureYears;

    }

    /**
     * Filter years
     * @type {[type]}
     */

    filterYears = async ()=>{
      const { allBudgetCycles } = this.state;
      const futureYears = this.getFutureYears(moment().year());
      const budgetYears = allBudgetCycles.map(budgetCycle => +budgetCycle.year);
      const availableYears = futureYears.filter(yr => !budgetYears.includes(+yr)).sort();
      this.setState({availableYears});
    }

    /**
     * This method creates a new budgetcycle
     */
    createBudgetCycle = async ()=>{
        const {createBudgetCycleForm, allBudgetCycles, firstVersion} = this.state;
        let isSaving = true;
        let saveMsg = 'Saving';
        this.setState({isSaving, saveMsg})
        this.processingService.createBudgetCycle(createBudgetCycleForm).then(
            async (budgetcycleData) => {
                isSaving = false;
                saveMsg = 'Save';
                budgetcycleData['active_version'] = firstVersion //making sure
                allBudgetCycles.unshift(budgetcycleData)
              await this.setState({ allBudgetCycles, isSaving, saveMsg })
                this.filterYears();
                const successNotification = {
                    type:'success',
                    msg:`${budgetcycleData.year} successfully created!`
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


    viewInstructions = (viewedBudgetCycle) => {
      this.setState({viewedBudgetCycle});
      this.toggleModal('instructions');

    }


    /**
     * This method updates a new budgetcycle
     */
    updateBudgetCycle = async ()=>{

        let { updateBudgetCycleForm, allBudgetCycles, editedBudgetCycle } = this.state;
        let isSaving = true;
        let updateMsg = 'Updating';
        this.setState({isSaving, updateMsg});
        const { active_version } = editedBudgetCycle;
        this.processingService.updateBudgetCycle(updateBudgetCycleForm, editedBudgetCycle.id).then(
            (updatedBudgetCycle)=>{
                updatedBudgetCycle.temp_flash = true;
                updatedBudgetCycle['active_version'] = active_version;
                isSaving = false;
                updateMsg = 'Update';
                allBudgetCycles.splice(this.state.editedIndex, 1, updatedBudgetCycle)
                this.setState({ allBudgetCycles, isSaving, updateMsg })
                const successNotification = {
                    type:'success',
                    msg:`Budget cycle ${updatedBudgetCycle.year} successfully updated!`
                }
                new AppNotification(successNotification)
                this.toggleModal('edit');

             setTimeout(async ()=>{
                    updatedBudgetCycle.temp_flash = false
                    allBudgetCycles.splice(this.state.editedIndex, 1, updatedBudgetCycle)
                    await this.setState({ allBudgetCycles, isSaving, updateMsg })
                    this.filterYears();
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
        let {showEditModal, showCreateModal, showInstructionsModal } = this.state;
        if(modalName == 'create'){
            showCreateModal = !showCreateModal;
        }else if(modalName == 'edit'){
            showEditModal = !showEditModal
        }else if(modalName=='instructions'){
          showInstructionsModal = !showInstructionsModal
        }

        this.setState({ showEditModal, showCreateModal, showInstructionsModal })

    }


enableNextVersion = (budgetcycle) => {
  const title = `<small>Enable&nbsp;<b><em>${budgetcycle.year} ${budgetcycle.next_version.name} (${budgetcycle.next_version.code})</em></b>?</small>`
  const suffix = budgetcycle.version_migration == 'AUTO' ? `, and current budget entries will be auto-migrated.` : "!"
  const text = `${budgetcycle.active_version.version_code.name} (${budgetcycle.active_version.version_code.code}) will be archived${suffix}`
  swal.fire({
         title,
         text,
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
         let { allBudgetCycles } = this.state
           this.processingService.enableNextBudgetCycleVersion(budgetcycle).then(
             async (versionedCycle) => {
                 const cycleIndex = allBudgetCycles.findIndex(r=> r.id == versionedCycle.id);
                 versionedCycle.active_version = budgetcycle.next_version;
                 allBudgetCycles.splice(cycleIndex, 1, versionedCycle);

               await this.setState({ allBudgetCycles });
               this.filterYears();
                 const successNotification = {
                     type:'success',
                     msg:`${budgetcycle.next_version.name} (${budgetcycle.next_version.code}) of ${budgetcycle.year} successfully enabled!`
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
     * This method sets the budgetcycle to be edited
     *  and opens the modal for edit
     *
     */
    editBudgetCycle = (editedBudgetCycle) => {
        const updateBudgetCycleForm = {...editedBudgetCycle}
        const {availableYears} = this.state;
        //
        availableYears.push(+editedBudgetCycle.year);
        availableYears.sort();
        //
        const editedIndex = this.state.allBudgetCycles.findIndex(budgetcycle => editedBudgetCycle.id == budgetcycle.id)
        this.setState({editedBudgetCycle, editedIndex, updateBudgetCycleForm, availableYears});
        this.toggleModal('edit')
    }


    /**
     *
     * @param {*} budgetcycle
     * This method toggles a budgetcycle's status
     */
    toggleBudgetCycle = (budgetcycle)=>{
        const toggleMsg = budgetcycle.is_current? "Disable":"Enable";
        const gL = budgetcycle.is_current? ".":", and notifications will be sent out";
        const { active_version } = budgetcycle;

        swal.fire({
            title: `<small>${toggleMsg}&nbsp;<b>${budgetcycle.year}</b>?</small>`,
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
                let { allBudgetCycles } = this.state
                const toggleIndex = allBudgetCycles.findIndex(r => r.id == budgetcycle.id)
                // budgetcycle.status = !budgetcycle.status;

              this.processingService.toggleBudgetCycle(budgetcycle).then(
                (toggledBudgetCycle)=>{
                  toggledBudgetCycle['active_version'] = active_version;
                    allBudgetCycles.splice(toggleIndex, 1, toggledBudgetCycle)
                    this.setState({ allBudgetCycles })
                    const successNotification = {
                        type:'success',
                        msg:`Budget cycle ${toggledBudgetCycle.year} successfully ${toggleMsg}d!`
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
     * @param {*} budgetcycle
     * This method deletes a budgetcycle
     *
     */
    deleteBudgetCycle = (budgetcycle)=>{
         swal.fire({
                title: `<small>Delete&nbsp;<b>${budgetcycle.year}</b>?</small>`,
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
                let { allBudgetCycles } = this.state
                  this.processingService.deleteBudgetCycle(budgetcycle).then(
                    async (deletedBudgetCycle) => {
                        allBudgetCycles = allBudgetCycles.filter(r=> r.id !== budgetcycle.id)
                      await this.setState({ allBudgetCycles });
                      this.filterYears();
                        const successNotification = {
                            type:'success',
                            msg:`Budget cycle ${budgetcycle.year} successfully deleted!`
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
        const createBudgetCycleForm = {
            name: "",
            description: "",
          }
          this.setState({createBudgetCycleForm})

    }

    render(){

      const { CAN_VIEW_ALL, CAN_CREATE, CAN_TOGGLE_STATUS, CAN_EDIT, CAN_ENABLE_NEW_VERSION } = this;


        return !CAN_VIEW_ALL ? <ErrorView errorType={VIEW_FORBIDDEN} /> : (

            <>
                <div className="specific">


                                  <Modal show={this.state.showInstructionsModal} onHide={
                                      ()=>{ this.toggleModal('instructions')}
                                      } {...this.props} id='instructions_modal'>
                                      <Modal.Header closeButton>

                                      <Modal.Title>
                                        <img src="/assets/images/logo.png" alt="Logo" className="modal-logo"  />&nbsp;&nbsp;
                                        Instructions for <b>{this.state?.viewedBudgetCycle?.year}</b>
                                    </Modal.Title>
                                      </Modal.Header>

                                               <Modal.Body>

                                                 <div dangerouslySetInnerHTML={{__html: this.state.viewedBudgetCycle.instructions}} />

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



                <Modal show={this.state.showEditModal} onHide={
                                                      ()=>{ this.toggleModal('edit')}
                                                      } {...this.props} id='edit_modal'>
                                                      <Modal.Header closeButton>
                                                      <Modal.Title>
                                                        <img src="/assets/images/logo.png" alt="Logo" className="modal-logo"  />&nbsp;&nbsp;

                                                        Update budget cycle <b>{this.state.editedBudgetCycle.year}</b>
                                                    </Modal.Title>
                                                      </Modal.Header>

                                                      <Formik
                                                      initialValues={this.state.updateBudgetCycleForm}
                                                      validationSchema={this.updateBudgetCycleSchema}
                                                      onSubmit={this.updateBudgetCycle}
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
                                                               <Modal.Body>
                                                                  <div className="form-row">
                                                                  <div
                                                                      className={utils.classList({
                                                                      "col-md-6 mb-2": true,
                                                                      "valid-field":
                                                                          !errors.year && touched.year,
                                                                      "invalid-field":
                                                                          errors.year && touched.year
                                                                      })}
                                                                  >
                                                                      <label htmlFor="budgetcycle_name">
                                                                          <b>Year<span className='text-danger'>*</span></b>
                                                                      </label>

                                                                    <select
                                                                      className="form-control"
                                                                      id="budgetcycle_name"
                                                                      placeholder=""
                                                                      name="year"
                                                                      value={values.year}
                                                                      onChange={(event)=>this.handleChange(event, 'edit')}
                                                                      onBlur={handleBlur}
                                                                      required
                                                                      >
                                                                      <option value="">Select year</option>
                                                                      {
                                                                        this.state.availableYears.map((year)=>{
                                                                        return  (<option value={year} key={year}>{year}</option>)
                                                                        })
                                                                      }

                                                                    </select>
                                                                      <div className="valid-feedback"></div>
                                                                      <div className="invalid-feedback">Year is required</div>
                                                                  </div>

                                                                  <div
                                                                      className={utils.classList({
                                                                      "col-md-6 mb-2": true,
                                                                      "valid-field":
                                                                          !errors.currency_conversion_rate && touched.currency_conversion_rate,
                                                                      "invalid-field":
                                                                          errors.currency_conversion_rate && touched.currency_conversion_rate
                                                                      })}
                                                                  >
                                                                      <label htmlFor="budgetcycle_name">
                                                                          <b>[Currency] Rate<span className='text-danger'>*</span></b>
                                                                      </label>

                                                                      <input
                                                                      type="number"
                                                                      className="form-control"
                                                                      id="currency_conversion_rate"
                                                                      placeholder=""
                                                                      step="0.1"
                                                                      name="currency_conversion_rate"
                                                                      value={values.currency_conversion_rate}
                                                                      onChange={(event)=>this.handleChange(event, 'edit')}
                                                                      onBlur={handleBlur}
                                                                      required
                                                                      />

                                                                      <div className="valid-feedback"></div>
                                                                      <div className="invalid-feedback">[Currency] Rate is required</div>
                                                                  </div>

                                                                  <div
                                                                      className={utils.classList({
                                                                      "col-md-6 mb-2": true,
                                                                      "valid-field":
                                                                          !errors.start_date && touched.start_date,
                                                                      "invalid-field":
                                                                          errors.start_date && touched.start_date
                                                                      })}
                                                                  >
                                                                      <label htmlFor="budgetcycle_name">
                                                                          <b>Start Date<span className='text-danger'>*</span></b>
                                                                      </label>

                                                                      <input
                                                                      type="date"
                                                                      className="form-control"
                                                                      id="start_date"
                                                                      placeholder=""
                                                                      name="start_date"
                                                                      value={values.start_date}
                                                                      onChange={(event)=>this.handleChange(event, 'edit')}
                                                                      onBlur={handleBlur}
                                                                      required
                                                                      />

                                                                      <div className="valid-feedback"></div>
                                                                      <div className="invalid-feedback">Start Date is required</div>
                                                                  </div>

                                                                  <div
                                                                      className={utils.classList({
                                                                      "col-md-6 mb-2": true,
                                                                      "valid-field":
                                                                          !errors.end_date && touched.end_date,
                                                                      "invalid-field":
                                                                          errors.end_date && touched.end_date
                                                                      })}
                                                                  >
                                                                      <label htmlFor="budgetcycle_name">
                                                                          <b>End Date<span className='text-danger'>*</span></b>
                                                                      </label>

                                                                      <input
                                                                      type="date"
                                                                      className="form-control"
                                                                      id="end_date"
                                                                      placeholder=""
                                                                      name="end_date"
                                                                      value={values.end_date}
                                                                      onChange={(event)=>this.handleChange(event, 'edit')}
                                                                      onBlur={handleBlur}
                                                                      required
                                                                      />

                                                                      <div className="valid-feedback"></div>
                                                                      <div className="invalid-feedback">End Date is required</div>
                                                                  </div>


                                                                  <div
                                                                      className={utils.classList({
                                                                      "col-md-12 mb-2": true,
                                                                      "valid-field":
                                                                          touched.instructions && !errors.instructions,
                                                                      "invalid-field":
                                                                          touched.instructions && errors.instructions
                                                                      })}
                                                                  >
                                                                      <label htmlFor="edit_budgetcycle_description">
                                                                           <b>Instructions<span className='text-danger'>*</span></b>
                                                                      </label>



                                                                     <RichTextEditor
                                                                       theme="snow"
                                                                       modules={{
                                                                         toolbar: [
                                                                           [{ size: ["small", false, "large", "huge"] }],
                                                                           ["bold", "italic", "underline", "strike"],
                                                                           [{ list: "ordered" }, { list: "bullet" }],
                                                                           ["clean"]
                                                                         ]
                                                                       }}
                                                                       content={values.instructions}
                                                                       handleContentChange={html =>
                                                                         this.handleRichEditorChange(html, 'edit')
                                                                       }
                                                                       placeholder="insert text here..."
                                                                     />

                                                                      <div className="valid-feedback"></div>
                                                                      <div className="invalid-feedback">
                                                                      Provide instructions
                                                                      </div>
                                                                  </div>



                                                                  </div>
                                                              </Modal.Body>

                                                              <Modal.Footer>

                                                                      <LaddaButton
                                                                          className="btn btn-secondary_custom border-0 mr-2 mb-2 position-relative"
                                                                          loading={false}
                                                                          progress={0.5}
                                                                          type='button'
                                                                          onClick={()=>this.toggleModal('edit')}

                                                                          >
                                                                          Close
                                                                      </LaddaButton>

                                                                      <LaddaButton
                                                                          className={`btn btn-${utils.isValid(this.updateBudgetCycleSchema, this.state.editBudgetCycleForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
                                                                          loading={this.state.isSaving}
                                                                          progress={0.5}
                                                                          type='submit'
                                                                          data-style={EXPAND_RIGHT}
                                                                          >
                                                                          {this.state.saveMsg}
                                                                      </LaddaButton>
                                                                      </Modal.Footer>

                                                          </form>
                                                          );
                                                      }}

                                                      </Formik>



                                                  </Modal>


                <Modal show={this.state.showCreateModal} onHide={
                    ()=>{ this.toggleModal('create')}
                    } {...this.props} id='create_modal'>
                    <Modal.Header closeButton>
                    <Modal.Title>
                      <img src="/assets/images/logo.png" alt="Logo" className="modal-logo"  />&nbsp;&nbsp;

                      Create Budget Cycle
                    </Modal.Title>
                    </Modal.Header>

                    <Formik
                    initialValues={this.state.createBudgetCycleForm}
                    validationSchema={this.createBudgetCycleSchema}
                    onSubmit={this.createBudgetCycle}
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
                             <Modal.Body>
                                <div className="form-row">
                                <div
                                    className={utils.classList({
                                    "col-md-6 mb-2": true,
                                    "valid-field":
                                        !errors.year && touched.year,
                                    "invalid-field":
                                        errors.year && touched.year
                                    })}
                                >
                                    <label htmlFor="budgetcycle_name">
                                        <b>Year<span className='text-danger'>*</span></b>
                                    </label>

                                  <select
                                    className="form-control"
                                    id="budgetcycle_name"
                                    placeholder=""
                                    name="year"
                                    value={values.year}
                                    onChange={(event)=>this.handleChange(event)}
                                    onBlur={handleBlur}
                                    required
                                    >
                                    <option value="">Select year</option>
                                    {
                                      this.state.availableYears.map((year)=>{
                                      return  (<option value={year} key={year}>{year}</option>)
                                      })
                                    }

                                  </select>
                                    <div className="valid-feedback"></div>
                                    <div className="invalid-feedback">Year is required</div>
                                </div>

                                <div
                                    className={utils.classList({
                                    "col-md-6 mb-2": true,
                                    "valid-field":
                                        !errors.currency_conversion_rate && touched.currency_conversion_rate,
                                    "invalid-field":
                                        errors.currency_conversion_rate && touched.currency_conversion_rate
                                    })}
                                >
                                    <label htmlFor="budgetcycle_name">
                                        <b>[Currency] Rate<span className='text-danger'>*</span></b>
                                    </label>

                                    <input
                                    type="number"
                                    className="form-control"
                                    id="currency_conversion_rate"
                                    placeholder=""
                                    step="0.1"
                                    name="currency_conversion_rate"
                                    value={values.currency_conversion_rate}
                                    onChange={(event)=>this.handleChange(event)}
                                    onBlur={handleBlur}
                                    required
                                    />

                                    <div className="valid-feedback"></div>
                                    <div className="invalid-feedback">[Currency] Rate is required</div>
                                </div>

                                <div
                                    className={utils.classList({
                                    "col-md-6 mb-2": true,
                                    "valid-field":
                                        !errors.start_date && touched.start_date,
                                    "invalid-field":
                                        errors.start_date && touched.start_date
                                    })}
                                >
                                    <label htmlFor="budgetcycle_name">
                                        <b>Start Date<span className='text-danger'>*</span></b>
                                    </label>

                                    <input
                                    type="date"
                                    className="form-control"
                                    id="start_date"
                                    placeholder=""
                                    name="start_date"
                                    value={values.start_date}
                                    onChange={(event)=>this.handleChange(event)}
                                    onBlur={handleBlur}
                                    required
                                    />

                                    <div className="valid-feedback"></div>
                                    <div className="invalid-feedback">Start Date is required</div>
                                </div>

                                <div
                                    className={utils.classList({
                                    "col-md-6 mb-2": true,
                                    "valid-field":
                                        !errors.end_date && touched.end_date,
                                    "invalid-field":
                                        errors.end_date && touched.end_date
                                    })}
                                >
                                    <label htmlFor="budgetcycle_name">
                                        <b>End Date<span className='text-danger'>*</span></b>
                                    </label>

                                    <input
                                    type="date"
                                    className="form-control"
                                    id="end_date"
                                    placeholder=""
                                    name="end_date"
                                    value={values.end_date}
                                    onChange={(event)=>this.handleChange(event)}
                                    onBlur={handleBlur}
                                    required
                                    />

                                    <div className="valid-feedback"></div>
                                    <div className="invalid-feedback">End Date is required</div>
                                </div>


                                <div
                                    className={utils.classList({
                                    "col-md-12 mb-2": true,
                                    "valid-field":
                                        touched.instructions && !errors.instructions,
                                    "invalid-field":
                                        touched.instructions && errors.instructions
                                    })}
                                >
                                    <label htmlFor="create_budgetcycle_description">
                                         <b>Instructions<span className='text-danger'>*</span></b>
                                    </label>



                                   <RichTextEditor
                                     theme="snow"
                                     modules={{
                                       toolbar: [
                                         [{ size: ["small", false, "large", "huge"] }],
                                         ["bold", "italic", "underline", "strike"],
                                         [{ list: "ordered" }, { list: "bullet" }],
                                         ["clean"]
                                       ]
                                     }}
                                     content={values.instructions}
                                     handleContentChange={html =>
                                       this.handleRichEditorChange(html)
                                     }
                                     placeholder="insert text here..."
                                   />

                                    <div className="valid-feedback"></div>
                                    <div className="invalid-feedback">
                                    Provide instructions
                                    </div>
                                </div>

                                </div>
                            </Modal.Body>

                            <Modal.Footer>

                                    <LaddaButton
                                        className="btn btn-secondary_custom border-0 mr-2 mb-2 position-relative"
                                        loading={false}
                                        progress={0.5}
                                        type='button'
                                        onClick={()=>this.toggleModal('create')}

                                        >
                                        Close
                                    </LaddaButton>

                                    <LaddaButton
                                        className={`btn btn-${utils.isValid(this.createBudgetCycleSchema, this.state.createBudgetCycleForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
                                        loading={this.state.isSaving}
                                        progress={0.5}
                                        type='submit'
                                        data-style={EXPAND_RIGHT}
                                        >
                                        {this.state.saveMsg}
                                    </LaddaButton>
                                    </Modal.Footer>

                        </form>
                        );
                    }}

                    </Formik>



                </Modal>

                {
                  CAN_CREATE ? (
                    <div className='float-right'>
                        <Button  variant="secondary_custom" className="ripple m-1 text-capitalize" onClick={ ()=>{ this.toggleModal('create')} } disabled={!this.state.availableYears.length}><i className='i-Add'></i> Budget Cycle</Button>
                    </div>
                  ) : null
                }


                <div className="breadcrumb">
                    <h1>Budget Cycles</h1>
                    <ul>
                        <li><a href="#">List</a></li>
                        <li>View</li>
                    </ul>
                </div>

                <div className="separator-breadcrumb border-top"></div>
                <div className="row mb-4">

                    <div className="col-md-12 mb-4">
                        <div className="card text-left">
                            <div className="card-body">
                                <h4 className="card-title mb-3">Budget Cycles</h4>
                                <p>List of budget cycles.</p>

                            {/* <div style={{"maxHeight":"500px", "overflowY":"scroll"}}> */}

                            <div className="table-responsivex">
                                    <table className="display table table-striped table-hover " id="zero_configuration_table" style={{"width":"100%"}}>
                                        <thead>
                                            <tr className="ul-widget6__tr--sticky-th">
                                                <th>#</th>
                                                <th>Year</th>
                                              <th>Active Version</th>
                                                <th>Instructions</th>
                                                  <th>USD Rate</th>
                                                <th>Version Migration</th>
                                                <th>Start Date</th>
                                                <th>End Date</th>
                                                <th>Status</th>
                                                <th>Date Created</th>
                                                <th>Date Updated</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {
                                          this.state.allBudgetCycles.length ?  this.state.allBudgetCycles.map( (budgetcycle, index)=>{
                                            const { active_version } = budgetcycle;
                                            const { version_code } = active_version;
                                                return (
                                                    <tr key={budgetcycle.id} className={budgetcycle.temp_flash ? 'bg-success text-white':''}>
                                                        <td>
                                                            <b>{index+1}</b>.
                                                        </td>
                                                        <td>
                                                            {budgetcycle?.year}
                                                        </td>
                                                        <td>
                                                          {version_code?.name || active_version?.name} ({version_code?.code || active_version?.code})
                                                        </td>
                                                        <td class="text-center">
                                                          <a onClick={()=>this.viewInstructions(budgetcycle)}  className="text-primary long-view">View</a>
                                                        </td>
                                                        <td>
                                                          {utils.formatNumber(budgetcycle?.currency_conversion_rate, false)}
                                                        </td>
                                                          <td className="text-center">
                                                            <select className="form-controlx">

                                                              {
                                                                this.state?.versionMigrationOptions?.map((migration)=>{
                                                                  return <option selected={budgetcycle?.version_migration == migration} value={migration} key={migration}>{migration}</option>
                                                                })
                                                              }


                                                            </select>



                                                          </td>
                                                        <td>
                                                          {utils.formatDate(budgetcycle?.start_date)}

                                                        </td>
                                                        <td>
                                                          {utils.formatDate(budgetcycle?.end_date)}
                                                        </td>

                                                        <td>
                                                          {
                                                            CAN_TOGGLE_STATUS ? (
                                                              <Form>

                                                                   <Form.Check
                                                                          checked={budgetcycle.is_current}
                                                                          type="switch"
                                                                          id={`custom-switch${budgetcycle.id}`}
                                                                          label={budgetcycle.is_current ? 'Active' : 'Inactive'}
                                                                          className={budgetcycle.is_current ? 'text-success' : 'text-danger'}
                                                                          onChange={()=> this.toggleBudgetCycle(budgetcycle)}
                                                                      />


                                                                  </Form>
                                                            ): (
                                                              <span className={budgetcycle.is_current ? `badge  badge-success`: `badge  badge-danger`}>
                                                                {budgetcycle.is_current ? 'Active' : 'Inactive'}
                                                              </span>
                                                            )
                                                          }

                                                        </td>
                                                        <td>
                                                        {utils.formatDate(budgetcycle.created_at)}
                                                        </td>
                                                        <td>
                                                        {utils.formatDate(budgetcycle.updated_at)}
                                                        </td>

                                                        <td>
                                                        <Dropdown key={budgetcycle.id}>
                                                            <Dropdown.Toggle variant='secondary_custom' className="mr-3 mb-3" size="sm">
                                                            Manage
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu>
                                                              {
                                                                CAN_EDIT ? (
                                                                  <Dropdown.Item onClick={()=> {
                                                                      this.editBudgetCycle(budgetcycle);
                                                                  }} className='border-bottom'>
                                                                      <i className="nav-icon i-Pen-2 text-success font-weight-bold"> </i> Edit
                                                                  </Dropdown.Item>
                                                                ): null
                                                              }


                                                            {
                                                              budgetcycle.next_version && CAN_ENABLE_NEW_VERSION ? (
                                                                <Dropdown.Item onClick={()=> {
                                                                    this.enableNextVersion(budgetcycle);
                                                                }} className='border-bottom'>
                                                                    <FaArrowRight/> Enable <b><em>{budgetcycle?.year} {budgetcycle?.next_version?.name} ({budgetcycle?.next_version?.code})</em></b>?
                                                                </Dropdown.Item>
                                                              ): null
                                                            }



                                                            <Dropdown.Item className='text-danger' onClick={
                                                                ()=>{this.deleteBudgetCycle(budgetcycle);}
                                                            }>
                                                                <i className="i-Close-Window"> </i> Delete
                                                            </Dropdown.Item>

                                                            </Dropdown.Menu>
                                                        </Dropdown>

                                                        </td>

                                                    </tr>
                                                )


                                            }) :
                                            (
                                                <tr>
                                                    <td className='text-center' colSpan='12'>
                                                    <FetchingRecords isFetching={this.state.isFetching}/>
                                                    </td>
                                                </tr>
                                            )
                                        }

                                        </tbody>
                                        <tfoot>
                                            <tr>
                                              <th>#</th>
                                              <th>Year</th>
                                                <th>Active Version</th>
                                              <th>Description</th>
                                                <th>USD Rate</th>
                                              <th>Version Migration</th>
                                              <th>Start Date</th>
                                              <th>End Date</th>
                                              <th>Status</th>
                                              <th>Date Created</th>
                                              <th>Date Updated</th>
                                              <th>Action</th>
                                            </tr>
                                        </tfoot>
                                    </table>
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

createBudgetCycleSchema = yup.object().shape({
        year: yup.string().required("Year is required"),
        instructions: yup.string().required("instructions is required"),
        start_date: yup.string().required("Start date is required"),
        end_date: yup.string().required("End date is required"),
        currency_conversion_rate: yup.number().required("Conversion rate is required"),
      });


updateBudgetCycleSchema = yup.object().shape({
          year: yup.string().required("Year is required"),
          instructions: yup.string().required("instructions is required"),
          start_date: yup.string().required("Start date is required"),
          end_date: yup.string().required("End date is required"),
          currency_conversion_rate: yup.number().required("Conversion rate is required"),
        });

}




export default BudgetCyclesComponent
