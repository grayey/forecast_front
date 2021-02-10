import React, { Component, useState, useEffect } from "react"
import { Dropdown, Row, Col, Button,Form, ButtonToolbar,Modal } from "react-bootstrap";
// import SweetAlert from "sweetalert2-react";
import swal from "sweetalert2";
import ProcessingService from "../../../services/processing.service";
import AppMainService from "../../../services/appMainService";
import jwtAuthService  from "../../../services/jwtAuthService";

import * as utils from "@utils";
import { Formik } from "formik";
import * as yup from "yup";
import AppNotification from "../../../appNotifications";
import { FetchingRecords, CustomProgressBar, ErrorView } from "../../../appWidgets";
import moment from "moment";
import { RichTextEditor } from "@gull";
import { Link, Redirect, NavLink, withRouter } from "react-router-dom";
import { VIEW_FORBIDDEN } from "app/appConstants";




import LaddaButton, {
    XL,
    EXPAND_LEFT,
    EXPAND_RIGHT,
    EXPAND_UP,

    CONTRACT,
  } from "react-ladda";

export class BudgetVersionsComponent extends Component{

  CAN_VIEW_ALL = false;
  CAN_VIEW_DETAIL  = false;
  CAN_TOGGLE_CAPTURE  = false;
  CAN_ARCHIVE_VERSION  = false;

    state = {
        editedIndex:0,
        allBudgetVersions:[],
        showEditModal:false,
        showCreateModal:false,
        showInstructionsModal:false,
        isSaving:false,
        isFetching:true,
        firstVersion:{},
        saveMsg:'Save',
        updateMsg:'Update',
        editedBudgetVersion: {},
        viewedBudgetVersion:{},
        createBudgetVersionForm: {
            year: "",
            start_date: "",
            end_date: "",
            currency_conversion_rate: "",
            instructions: "",
          },
          updateBudgetVersionForm: {
            year: "",
            start_date: "",
            end_date: "",
            currency_conversion_rate: "",
            instructions: "",
          },
          availableYears:[],
          allApprovals:[],

    }
    processingService;



    constructor(props){
        super(props)
        this.processingService = new ProcessingService();
        this.appMainService = new AppMainService();

        const componentName = "Processing___Budget_Versions";
        const componentPermissions = utils.getComponentPermissions(componentName, props.route.auth);
        this.userPermissions = utils.comparePermissions(jwtAuthService.getUserTasks(), componentPermissions);
        this.CAN_VIEW_ALL = this.userPermissions.includes(`${componentName}__CAN_VIEW_ALL`);
        this.CAN_VIEW_DETAIL = this.userPermissions.includes(`${componentName}__CAN_VIEW_DETAIL`);
        this.CAN_TOGGLE_CAPTURE = this.userPermissions.includes(`${componentName}__CAN_TOGGLE_CAPTURE`);
        this.CAN_ARCHIVE_VERSION = this.userPermissions.includes(`${componentName}__CAN_ARCHIVE_VERSION`);
    }

    componentDidMount(){
         this.getAllBudgetVersions();
         this.getAllVersionCodes();
         this.getAllApprovals();
    }

    /**
     *
     * @param {*} event
     * @param {*} errors
     * @param {*} form
     */

    handleChange = (event, form='create') => {
        const {createBudgetVersionForm, updateBudgetVersionForm} = this.state
        if(form=='create'){
            createBudgetVersionForm[event.target.name] = event.target.value;
        }else if(form=='edit'){
            updateBudgetVersionForm[event.target.name] = event.target.value;
        }
        this.setState({ createBudgetVersionForm, updateBudgetVersionForm });
    }

    handleRichEditorChange = (html, form='create') => {
      const {createBudgetVersionForm, updateBudgetVersionForm} = this.state
      if(form=='create'){
        createBudgetVersionForm['instructions'] = html;
      }else{
        updateBudgetVersionForm['instructions'] = html;
      }
      this.setState({ createBudgetVersionForm, updateBudgetVersionForm });

    }

    /**
     * This method lists all versioncodes
     */
     getAllVersionCodes = async ()=>{
        this.appMainService.getAllVersionCodes().then(
            async(versioncodesResponse)=>{
                // const allVersionCodes = versioncodesResponse;
                const firstVersion = versioncodesResponse.find(v => v.step == 1);
                this.setState({ firstVersion })
            }
        ).catch((error)=>{
          console.error('Version Error', error)
        })
    }

    /**
   * This method lists all approvals
   */
   getAllApprovals = async ()=>{

      this.appMainService.getAllApprovals().then(
          (approvalsResponse)=>{
              const allApprovals = approvalsResponse;
              this.setState({ allApprovals })
              console.log('Approvals response', approvalsResponse)
          }
      ).catch((error)=>{
          // const errorNotification = {
          //     type:'error',
          //     msg:utils.processErrors(error)
          // }
          console.log('Error', error)
      })
  }




    /**
     * This method lists all budgetversions
     */
     getAllBudgetVersions = async ()=>{
         let isFetching = false;

        this.processingService.getAllBudgetVersions().then(
            async (budgetversionsResponse)=>{
              const allBudgetVersions = budgetversionsResponse;
              await  this.setState({ allBudgetVersions, isFetching }); // so allBudgetVersions is set
              this.filterYears();

                console.log('BudgetVersions response', budgetversionsResponse)
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
      const { allBudgetVersions } = this.state;
      const futureYears = this.getFutureYears(moment().year());
      const budgetYears = allBudgetVersions.map(budgetVersion => +budgetVersion.year);
      const availableYears = futureYears.filter(yr => !budgetYears.includes(+yr)).sort();
      this.setState({availableYears});
    }

    /**
     * This method creates a new budgetversion
     */
    createBudgetVersion = async ()=>{
        const {createBudgetVersionForm, allBudgetVersions, firstVersion} = this.state;
        let isSaving = true;
        let saveMsg = 'Saving';
        this.setState({isSaving, saveMsg})
        this.processingService.createBudgetVersion(createBudgetVersionForm).then(
            async (budgetversionData) => {
                isSaving = false;
                saveMsg = 'Save';
                budgetversionData['active_version'] = firstVersion //making sure
                allBudgetVersions.unshift(budgetversionData)
              await this.setState({ allBudgetVersions, isSaving, saveMsg })
                this.filterYears();
                const successNotification = {
                    type:'success',
                    msg:`${budgetversionData.year} successfully created!`
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


    viewInstructions = (viewedBudgetVersion) => {
      this.setState({viewedBudgetVersion});
      this.toggleModal('instructions');

    }


    /**
     * This method updates a new budgetversion
     */
    updateBudgetVersion = async ()=>{

        let {updateBudgetVersionForm, allBudgetVersions, editedBudgetVersion} = this.state;
        let isSaving = true;
        let updateMsg = 'Updating';
        this.setState({isSaving, updateMsg})
        this.processingService.updateBudgetVersion(updateBudgetVersionForm, editedBudgetVersion.id).then(
            (updatedBudgetVersion)=>{
                updatedBudgetVersion.temp_flash = true
                isSaving = false;
                updateMsg = 'Update';
                allBudgetVersions.splice(this.state.editedIndex, 1, updatedBudgetVersion)
                this.setState({ allBudgetVersions, isSaving, updateMsg })
                const successNotification = {
                    type:'success',
                    msg:`Budget version ${updatedBudgetVersion.year} successfully updated!`
                }
                new AppNotification(successNotification)
                this.toggleModal('edit');

             setTimeout(async ()=>{
                    updatedBudgetVersion.temp_flash = false
                    allBudgetVersions.splice(this.state.editedIndex, 1, updatedBudgetVersion)
                    await this.setState({ allBudgetVersions, isSaving, updateMsg })
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



    /**
     *
     * This method sets the budgetversion to be edited
     *  and opens the modal for edit
     *
     */
    editBudgetVersion = (editedBudgetVersion) => {
        const updateBudgetVersionForm = {...editedBudgetVersion}
        const {availableYears} = this.state;
        //
        availableYears.push(+editedBudgetVersion.year);
        availableYears.sort();
        //
        const editedIndex = this.state.allBudgetVersions.findIndex(budgetversion => editedBudgetVersion.id == budgetversion.id)
        this.setState({editedBudgetVersion, editedIndex, updateBudgetVersionForm, availableYears});
        this.toggleModal('edit')
    }


    /**
     *
     * @param {*} budgetversion
     * This method toggles a budgetversion's status
     */
    toggleBudgetVersion = (budgetversion)=>{
      return ;
        const toggleMsg = budgetversion.is_current? "Disable":"Enable";
        const gL = budgetversion.is_current? ".":", and notifications will be sent out";


        swal.fire({
            title: `<small>${toggleMsg}&nbsp;<b>${budgetversion.year}</b>?</small>`,
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
                let { allBudgetVersions } = this.state
                const toggleIndex = allBudgetVersions.findIndex(r => r.id == budgetversion.id)
                // budgetversion.status = !budgetversion.status;

              this.processingService.toggleBudgetVersion(budgetversion).then(
                (toggledBudgetVersion)=>{
                    allBudgetVersions.splice(toggleIndex, 1, toggledBudgetVersion)
                    this.setState({ allBudgetVersions })
                    const successNotification = {
                        type:'success',
                        msg:`Budget version ${toggledBudgetVersion.year} successfully ${toggleMsg}d!`
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
     * @param {*} budgetversion
     * This method deletes a budgetversion
     *
     */
    deleteBudgetVersion = (budgetversion)=>{
         swal.fire({
                title: `<small>Delete&nbsp;<b>${budgetversion.year}</b>?</small>`,
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
                let { allBudgetVersions } = this.state
                  this.processingService.deleteBudgetVersion(budgetversion).then(
                    async (deletedBudgetVersion) => {
                        allBudgetVersions = allBudgetVersions.filter(r=> r.id !== budgetversion.id)
                      await this.setState({ allBudgetVersions });
                      this.filterYears();
                        const successNotification = {
                            type:'success',
                            msg:`Budget version ${budgetversion.year} successfully deleted!`
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
        const createBudgetVersionForm = {
            name: "",
            description: "",
          }
          this.setState({createBudgetVersionForm})

    }

    render(){

      const { CAN_VIEW_ALL, CAN_VIEW_DETAIL, CAN_TOGGLE_CAPTURE, CAN_ARCHIVE_VERSION } = this;

        return !CAN_VIEW_ALL ? <ErrorView errorType={VIEW_FORBIDDEN} /> : (

            <>
                <div className="specific">


                                  <Modal show={this.state.showInstructionsModal} onHide={
                                      ()=>{ this.toggleModal('instructions')}
                                      } {...this.props} id='instructions_modal'>
                                      <Modal.Header closeButton>

                                      <Modal.Title>
                                        <img src="/assets/images/logo.png" alt="Logo" className="modal-logo"  />&nbsp;&nbsp;
                                        Instructions for <b>{this.state?.viewedBudgetVersion?.year}</b>
                                    </Modal.Title>
                                      </Modal.Header>

                                               <Modal.Body>

                                                 <div dangerouslySetInnerHTML={{__html: this.state.viewedBudgetVersion.instructions}} />

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

                                                        Update budget version <b>{this.state.editedBudgetVersion.year}</b>
                                                    </Modal.Title>
                                                      </Modal.Header>

                                                      <Formik
                                                      initialValues={this.state.updateBudgetVersionForm}
                                                      validationSchema={this.updateBudgetVersionSchema}
                                                      onSubmit={this.updateBudgetVersion}
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
                                                                      <label htmlFor="budgetversion_name">
                                                                          <b>Year<span className='text-danger'>*</span></b>
                                                                      </label>

                                                                    <select
                                                                      className="form-control"
                                                                      id="budgetversion_name"
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
                                                                      <label htmlFor="budgetversion_name">
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
                                                                      <label htmlFor="budgetversion_name">
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
                                                                      <label htmlFor="budgetversion_name">
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
                                                                      <label htmlFor="edit_budgetversion_description">
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
                                                                          className={`btn btn-${utils.isValid(this.updateBudgetVersionSchema, this.state.editBudgetVersionForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
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

                      Create Budget Version
                    </Modal.Title>
                    </Modal.Header>

                    <Formik
                    initialValues={this.state.createBudgetVersionForm}
                    validationSchema={this.createBudgetVersionSchema}
                    onSubmit={this.createBudgetVersion}
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
                                    <label htmlFor="budgetversion_name">
                                        <b>Year<span className='text-danger'>*</span></b>
                                    </label>

                                  <select
                                    className="form-control"
                                    id="budgetversion_name"
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
                                    <label htmlFor="budgetversion_name">
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
                                    <label htmlFor="budgetversion_name">
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
                                    <label htmlFor="budgetversion_name">
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
                                    <label htmlFor="create_budgetversion_description">
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
                                        className={`btn btn-${utils.isValid(this.createBudgetVersionSchema, this.state.createBudgetVersionForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
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

                {/*
                <div className='float-right'>
                    <Button  variant="secondary_custom" className="ripple m-1 text-capitalize" onClick={ ()=>{ this.toggleModal('create')} } disabled={!this.state.availableYears.length}><i className='i-Add'></i> Budget Version</Button>
                </div>
                */}

                <div className="breadcrumb">
                    <h1>Budget Versions</h1>
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
                                <h4 className="card-title mb-3">Budget Versions</h4>
                                <p>List of budget versions.</p>

                            {/* <div style={{"maxHeight":"500px", "overflowY":"scroll"}}> */}

                            <div className="table-responsive">
                                    <table className="display table table-striped table-hover " id="zero_configuration_table" style={{"width":"100%"}}>
                                        <thead>
                                            <tr className="ul-widget6__tr--sticky-th">
                                                <th>#</th>
                                                <th>Name</th>
                                                <th>Approval Date</th>
                                                <th>Status</th>
                                                <th>Progress</th>
                                                <th>Integration Account</th>
                                                <th className="text-center">Ledger Activity</th>
                                                <th>Date Created</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {
                                          this.state.allBudgetVersions.length ?  this.state.allBudgetVersions.map( (budgetversion, index)=>{
                                            const { budgetcycle, version_code } = budgetversion;
                                                return (
                                                    <tr key={budgetversion.id} className={budgetversion.temp_flash ? 'bg-success text-white':''}>
                                                        <td>
                                                            <b>{index+1}</b>.
                                                        </td>
                                                        <td>
                                                          {
                                                            CAN_VIEW_DETAIL  ? (
                                                              <NavLink className="underline" id={`link_${budgetversion.id}`} to={`/processing/budget-versions/${budgetversion.slug}`}>
                                                              {budgetcycle?.year} {version_code?.name} ({version_code?.code})
                                                            </NavLink>
                                                          ) :
                                                          (
                                                            <span>
                                                              {budgetcycle?.year} {version_code?.name} ({version_code?.code})
                                                            </span>
                                                          )
                                                          }


                                                        </td>
                                                        <td>
                                                          {budgetversion?.approval_date ? utils.formatDate(budgetversion?.approval_date) : 'Pending'}
                                                        </td>

                                                        <td>
                                                          {
                                                            CAN_TOGGLE_CAPTURE ? (
                                                              <Form>

                                                                   <Form.Check
                                                                          checked={budgetversion.is_active}
                                                                          type="switch"
                                                                          id={`custom-switch${budgetversion.id}`}
                                                                          label={budgetversion.is_active ? 'Running' : 'Closed'}
                                                                          className={budgetversion.is_active ? 'text-success' : 'text-danger'}
                                                                          onChange={()=> this.toggleBudgetVersion(budgetversion)}
                                                                      />


                                                                  </Form>
                                                            ) :  null
                                                          }

                                                        </td>

                                                        <td>
                                                          <CustomProgressBar departmentaggregate={{}} budgetVersion={budgetversion} allApprovals={this.state.allApprovals}/>
                                                        </td>

                                                        <td>
                                                          {budgetversion?.account_system}
                                                        </td>

                                                        <td>

                                                          <div className="table-responsive">
                                                            <table className="table table-striped">
                                                              <thead>
                                                                <tr>
                                                                  <th>
                                                                    #
                                                                  </th>
                                                                  <th>
                                                                    Status
                                                                  </th>
                                                                  <th>
                                                                    Log
                                                                  </th>
                                                                  <th>
                                                                    Processed At
                                                                  </th>
                                                                </tr>

                                                              </thead>

                                                              <tbody>
                                                                <tr>
                                                                  <td colSpan="4">

                                                                  </td>
                                                                </tr>
                                                              </tbody>

                                                            </table>

                                                          </div>

                                                        </td>
                                                        <td>
                                                        {utils.formatDate(budgetversion.created_at)}
                                                        </td>


                                                        <td>
                                                        <Dropdown key={budgetversion.id}>
                                                            <Dropdown.Toggle variant='secondary_custom' className="mr-3 mb-3" size="sm">
                                                            Manage
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu>

                                                              {
                                                                CAN_VIEW_DETAIL ? (
                                                                  <Dropdown.Item onClick={()=> {
                                                                      document.getElementById(`link_${budgetversion.id}`).click();
                                                                  }} className='border-bottom'>
                                                                      <i className="nav-icon i-Eye text-primary font-weight-bold"> </i> View
                                                                  </Dropdown.Item>
                                                                ) : null
                                                              }

                                                            {/* <Dropdown.Item className='text-danger' onClick={
                                                                ()=>{this.deleteBudgetVersion(budgetversion);}
                                                            }>
                                                                <i className="i-Close-Window"> </i> Delete
                                                            </Dropdown.Item> */}
                                                            {
                                                              CAN_TOGGLE_CAPTURE ? (
                                                                <Dropdown.Item className='border-bottom'>
                                                                    <i className="i-Money-Bag text-info font-weight-bold"> </i>Disable Capture
                                                                </Dropdown.Item>
                                                              ) : null
                                                            }


                                                            {
                                                              CAN_ARCHIVE_VERSION ? (
                                                                <Dropdown.Item className='border-bottom'>
                                                                    <i className="i-Money-Bag text-warning font-weight-bold"> </i> Archive Version
                                                                </Dropdown.Item>
                                                              ) : null
                                                            }

                                                            </Dropdown.Menu>
                                                        </Dropdown>

                                                        </td>

                                                    </tr>
                                                )


                                            }) :
                                            (
                                                <tr>
                                                    <td className='text-center' colSpan='9'>
                                                    <FetchingRecords isFetching={this.state.isFetching}/>
                                                    </td>
                                                </tr>
                                            )
                                        }

                                        </tbody>
                                        <tfoot>
                                            <tr>
                                              <th>#</th>
                                              <th>Version Name</th>
                                              <th>Approval Date</th>
                                              <th>Status</th>
                                              <th>Progress</th>
                                            <th>Tracking Account</th>
                                            <th className="text-center">Ledger History</th>


                                              <th>Date Created</th>
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

createBudgetVersionSchema = yup.object().shape({
        year: yup.string().required("Year is required"),
        instructions: yup.string().required("instructions is required"),
        start_date: yup.string().required("Start date is required"),
        end_date: yup.string().required("End date is required"),
        currency_conversion_rate: yup.number().required("Conversion rate is required"),
      });


updateBudgetVersionSchema = yup.object().shape({
          year: yup.string().required("Year is required"),
          instructions: yup.string().required("instructions is required"),
          start_date: yup.string().required("Start date is required"),
          end_date: yup.string().required("End date is required"),
          currency_conversion_rate: yup.number().required("Conversion rate is required"),
        });

}




export default BudgetVersionsComponent
