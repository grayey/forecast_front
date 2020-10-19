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
import {FetchingRecords} from "../../../appWidgets";
import moment from "moment";
import { RichTextEditor } from "@gull";
import { Link, Redirect, NavLink } from "react-router-dom";



import LaddaButton, {
    XL,
    EXPAND_LEFT,
    EXPAND_RIGHT,
    EXPAND_UP,

    CONTRACT,
  } from "react-ladda";

export class DepartmentAggregatesComponent extends Component{

    state = {
        navigate: false,
        navigationUrls:{
          create:true,
          view_entries:false
        },
        editedIndex:0,
        allDepartmentAggregates:[],
        showEditModal:false,
        showCreateModal:false,
        showInstructionsModal:false,
        isSaving:false,
        isFetching:true,
        firstVersion:{},
        entryTypes:[
          "PRINCIPAL",

        ], //dummy entry type
        groupedEntries:[],
        saveMsg:'Save',
        updateMsg:'Update',
        editedDepartmentAggregate: {},
        viewedDepartmentAggregate:{},
        createDepartmentAggregateForm: {
            year: "",
            start_date: "",
            end_date: "",
            currency_conversion_rate: "",
            instructions: "",
          },
          updateDepartmentAggregateForm: {
            year: "",
            start_date: "",
            end_date: "",
            currency_conversion_rate: "",
            instructions: "",
          },
          availableYears:[]

    }
    preparationService;



    constructor(props){
        super(props)
        this.preparationService = new PreparationService();
        this.appMainService = new AppMainService();
    }

    componentDidMount(){
         this.getAllDepartmentAggregates();
         this.getAllVersionCodes();
    }

    /**
     *
     * @param {*} event
     * @param {*} errors
     * @param {*} form
     */

    handleChange = (event, form='create') => {
        const {createDepartmentAggregateForm, updateDepartmentAggregateForm} = this.state
        if(form=='create'){
            createDepartmentAggregateForm[event.target.name] = event.target.value;
        }else if(form=='edit'){
            updateDepartmentAggregateForm[event.target.name] = event.target.value;
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





    /**
     * This method lists all departmentaggregates
     */
     getAllDepartmentAggregates = async ()=>{
         let isFetching = false;

        this.preparationService.getAllDepartmentAggregates().then(
            async (departmentaggregatesResponse)=>{
              const allDepartmentAggregates = this.buildGroupedEntries(departmentaggregatesResponse).reverse();
              await  this.setState({ allDepartmentAggregates, isFetching });

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



    buildGroupedEntries = (allDepartmentAggregates) =>{

      const { entryTypes } = this.state;
      allDepartmentAggregates.forEach((aggregate) =>{
        aggregate['summary'] = {};
        const entries = aggregate['entries']
        entryTypes.forEach((entryType)=>{
          aggregate['summary'][entryType] = this.buildEntriesByType(entries, entryType)
        })
      })

      return allDepartmentAggregates;
    }

    buildEntriesByType = (entries, entryType)=>{
      const summaryItem = {
        total_naira_part:0,
        total_currency_part:0,
        total_in_naira:0,
        total_in_currency:0,
      };
      entries.forEach((entry)=>{
        if(entry.entity == entryType){
          summaryItem.total_naira_part += entry.naira_portion
          summaryItem.total_currency_part += entry.currency_portion
          summaryItem.total_in_naira+= entry.total_naira
          summaryItem.total_in_currency += entry.total_currency
        }
      })
      return summaryItem;
    }

    /**
     * Filter years
     * @type {[type]}
     */

    filterYears = async ()=>{
      const { allDepartmentAggregates } = this.state;
      const futureYears = this.getFutureYears(moment().year());
      const budgetYears = allDepartmentAggregates.map(departmentAggregate => +departmentAggregate.year);
      const availableYears = futureYears.filter(yr => !budgetYears.includes(+yr)).sort();
      this.setState({availableYears});
    }

    /**
     * This method creates a new departmentaggregate
     */
    createDepartmentAggregate = async ()=>{
        const {createDepartmentAggregateForm, allDepartmentAggregates, firstVersion} = this.state;
        let isSaving = true;
        let saveMsg = 'Saving';
        this.setState({isSaving, saveMsg})
        this.preparationService.createDepartmentAggregate(createDepartmentAggregateForm).then(
            async (departmentaggregateData) => {
                isSaving = false;
                saveMsg = 'Save';
                departmentaggregateData['active_version'] = firstVersion //making sure
                allDepartmentAggregates.unshift(departmentaggregateData)
              await this.setState({ allDepartmentAggregates, isSaving, saveMsg })

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

        let {updateDepartmentAggregateForm, allDepartmentAggregates, editedDepartmentAggregate} = this.state;
        let isSaving = true;
        let updateMsg = 'Updating';
        this.setState({isSaving, updateMsg})
        this.preparationService.updateDepartmentAggregate(updateDepartmentAggregateForm, editedDepartmentAggregate.id).then(
            (updatedDepartmentAggregate)=>{
                updatedDepartmentAggregate.temp_flash = true
                isSaving = false;
                updateMsg = 'Update';
                allDepartmentAggregates.splice(this.state.editedIndex, 1, updatedDepartmentAggregate)
                this.setState({ allDepartmentAggregates, isSaving, updateMsg })
                const successNotification = {
                    type:'success',
                    msg:`Budget cycle ${updatedDepartmentAggregate.year} successfully updated!`
                }
                new AppNotification(successNotification)
                this.toggleModal('edit');

             setTimeout(async ()=>{
                    updatedDepartmentAggregate.temp_flash = false
                    allDepartmentAggregates.splice(this.state.editedIndex, 1, updatedDepartmentAggregate)
                    await this.setState({ allDepartmentAggregates, isSaving, updateMsg })
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
        const editedIndex = this.state.allDepartmentAggregates.findIndex(departmentaggregate => editedDepartmentAggregate.id == departmentaggregate.id)
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
                let { allDepartmentAggregates } = this.state
                const toggleIndex = allDepartmentAggregates.findIndex(r => r.id == departmentaggregate.id)
                // departmentaggregate.status = !departmentaggregate.status;

              this.preparationService.toggleDepartmentAggregate(departmentaggregate).then(
                (toggledDepartmentAggregate)=>{
                    allDepartmentAggregates.splice(toggleIndex, 1, toggledDepartmentAggregate)
                    this.setState({ allDepartmentAggregates })
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
                let { allDepartmentAggregates } = this.state
                  this.preparationService.deleteDepartmentAggregate(departmentaggregate).then(
                    async (deletedDepartmentAggregate) => {
                        allDepartmentAggregates = allDepartmentAggregates.filter(r=> r.id !== departmentaggregate.id)
                      await this.setState({ allDepartmentAggregates });
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
      const { navigate, navigationUrls } = this.state;
      const { create_entries, view_entries}  = navigationUrls



        return navigate ? <Redirect to="/preparation/budget-entries/create" /> : (

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



                <Modal show={this.state.showEditModal} onHide={
                                                      ()=>{ this.toggleModal('edit')}
                                                      } {...this.props} id='edit_modal'>
                                                      <Modal.Header closeButton>
                                                      <Modal.Title>
                                                        <img src="/assets/images/logo.png" alt="Logo" className="modal-logo"  />&nbsp;&nbsp;

                                                        Update budget cycle <b>{this.state.editedDepartmentAggregate.year}</b>
                                                    </Modal.Title>
                                                      </Modal.Header>

                                                      <Formik
                                                      initialValues={this.state.updateDepartmentAggregateForm}
                                                      validationSchema={this.updateDepartmentAggregateSchema}
                                                      onSubmit={this.updateDepartmentAggregate}
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
                                                                      <label htmlFor="departmentaggregate_name">
                                                                          <b>Year<span className='text-danger'>*</span></b>
                                                                      </label>

                                                                    <select
                                                                      className="form-control"
                                                                      id="departmentaggregate_name"
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
                                                                      <label htmlFor="departmentaggregate_name">
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
                                                                      <label htmlFor="departmentaggregate_name">
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
                                                                      <label htmlFor="departmentaggregate_name">
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
                                                                      <label htmlFor="edit_departmentaggregate_description">
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
                                                                          className={`btn btn-${utils.isValid(this.updateDepartmentAggregateSchema, this.state.editDepartmentAggregateForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
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
                                    <label htmlFor="departmentaggregate_name">
                                        <b>Year<span className='text-danger'>*</span></b>
                                    </label>

                                  <select
                                    className="form-control"
                                    id="departmentaggregate_name"
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
                                    <label htmlFor="departmentaggregate_name">
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
                                    <label htmlFor="departmentaggregate_name">
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
                                    <label htmlFor="departmentaggregate_name">
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
                                    <label htmlFor="create_departmentaggregate_description">
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
                                        className={`btn btn-${utils.isValid(this.createDepartmentAggregateSchema, this.state.createDepartmentAggregateForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
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

                <div className='float-right'>
                    <Button  variant="secondary_custom" className="ripple m-1 text-capitalize" onClick={ ()=>{ this.setState({ navigate:true })} }><i className='i-Add'></i> Budget Entries</Button>
                </div>

                <div className="breadcrumb">
                    <h1>Budget Entries</h1>
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
                                <h4 className="card-title mb-3">Budget Entries</h4>
                                <p>List of budget entries.</p>

                            {/* <div style={{"maxHeight":"500px", "overflowY":"scroll"}}> */}

                            <div className="table-responsive">
                                    <table className="display table tabel-lg table-striped " id="zero_configuration_table" style={{"width":"100%"}}>
                                        <thead>
                                            <tr className="ul-widget6__tr--sticky-th">
                                                <th>#</th>

                                              <th >Version</th>
                                                <th>Department</th>
                                              <th colSpan="3" className="text-center">Summary</th>
                                                <th>Progress</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {
                                          this.state.allDepartmentAggregates.length ?  this.state.allDepartmentAggregates.map( (departmentaggregate, index)=>{
                                                return (
                                                    <tr key={departmentaggregate.id} className={departmentaggregate.temp_flash ? 'bg-success text-white divide_row':'divide_row'}>
                                                        <td>
                                                            <b>{index+1}</b>.
                                                        </td>
                                                        <td>
                                                          <NavLink to={`/preparation/budget-entries/${departmentaggregate?.slug}`}>
                                                            {departmentaggregate?.budgetcycle?.year} &nbsp; {departmentaggregate?.budgetcycle?.active_version?.name} ({departmentaggregate?.budgetcycle?.active_version?.code})
                                                          </NavLink>
                                                        </td>
                                                        <td>
                                                          {departmentaggregate?.department?.name} ({departmentaggregate?.department?.code})

                                                        </td>
                                                        <td colSpan="3" className="no_padding">
                                                          <table className="w-100">
                                                            <thead>
                                                              <tr className="no_top">
                                                                <th>
                                                                  Entry Type
                                                                </th>
                                                                <th className="text-right">
                                                                   Naira part (&#x20a6;)
                                                                </th>
                                                                <th className="text-right">
                                                                   USD part ($)
                                                                </th>
                                                                <th className="text-right">
                                                                   Total in Naira (&#x20a6;)
                                                                </th>
                                                                <th className="text-right">
                                                                   Total in USD ($)
                                                                </th>
                                                              </tr>
                                                            </thead>

                                                            <tbody>
                                                              {
                                                                Object.keys(departmentaggregate?.summary).map((key)=>{
                                                                  const summary = departmentaggregate.summary[key]
                                                                return  (
                                                                  <tr key={`${key}${index}`}>
                                                                    <td>
                                                                      {key}
                                                                    </td>

                                                                    <td className="text-right">
                                                                      {
                                                                        utils.formatNumber(summary?.total_naira_part)
                                                                      }
                                                                    </td>

                                                                    <td className="text-right">
                                                                      {
                                                                        utils.formatNumber(summary?.total_currency_part)
                                                                      }
                                                                    </td>
                                                                    <td className="text-right">
                                                                      {
                                                                        utils.formatNumber(summary?.total_in_naira)
                                                                      }
                                                                    </td>
                                                                    <td className="text-right">
                                                                      {
                                                                        utils.formatNumber(summary?.total_in_currency)
                                                                      }
                                                                    </td>
                                                                  </tr>
                                                                );

                                                                })
                                                              }

                                                            </tbody>
                                                            <tfoot>
                                                              <tr>
                                                                <th>
                                                                  Totals:
                                                                </th>
                                                                <th className="text-right">
                                                                  {utils.formatNumber(departmentaggregate?.total_naira_portion)}
                                                                </th>
                                                                <th className="text-right">
                                                                    {
                                                                      utils.formatNumber(departmentaggregate?.total_currency_portion)
                                                                    }
                                                                </th>
                                                                <th className="text-right">
                                                                    {
                                                                      utils.formatNumber(departmentaggregate?.total_functional_naira)
                                                                    }
                                                                </th>
                                                                <th className="text-right">
                                                                  {
                                                                    utils.formatNumber(departmentaggregate?.total_functional_currency)
                                                                  }

                                                                </th>
                                                              </tr>
                                                            </tfoot>

                                                          </table>

                                                        </td>
                                                        <td>

                                                        PROGRESS

                                                        </td>
                                                        <td>
                                                          <span className={`badge badge-${departmentaggregate?.entries_status == 0 ?
                                                               'secondary_custom' : departmentaggregate?.entries_status == 1 ? "info_custom":"success" }`}>

                                                               {`${departmentaggregate?.entries_status == 0 ?
                                                                    'DRAFT' : departmentaggregate?.entries_status == 1 ? "SUBMITTED":"APPROVED" }`}
                                                          </span>

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
                                                    <td className='text-center' colSpan='10'>
                                                    <FetchingRecords isFetching={this.state.isFetching}/>
                                                    </td>
                                                </tr>
                                            )
                                        }

                                        </tbody>
                                        <tfoot>
                                            <tr>
                                              <th>#</th>
                                            <th>Description</th>
                                              <th>Department</th>
                                            <th colSpan="3" className="text-center">Summary</th>
                                              <th>Progress</th>
                                              <th>Status</th>
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

createDepartmentAggregateSchema = yup.object().shape({
        year: yup.string().required("Year is required"),
        instructions: yup.string().required("instructions is required"),
        start_date: yup.string().required("Start date is required"),
        end_date: yup.string().required("End date is required"),
        currency_conversion_rate: yup.number().required("Conversion rate is required"),
      });


updateDepartmentAggregateSchema = yup.object().shape({
          year: yup.string().required("Year is required"),
          instructions: yup.string().required("instructions is required"),
          start_date: yup.string().required("Start date is required"),
          end_date: yup.string().required("End date is required"),
          currency_conversion_rate: yup.number().required("Conversion rate is required"),
        });

}




export default DepartmentAggregatesComponent
