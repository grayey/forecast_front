import React, { Component, useState, useEffect } from "react"
import { Dropdown, Row, Col, Button,Form, ButtonToolbar,Modal, OverlayTrigger, Tooltip, } from "react-bootstrap";

// import SweetAlert from "sweetalert2-react";
import swal from "sweetalert2";
import AppMainService from "../../services/appMainService";
import * as utils from "@utils";
import { Formik } from "formik";
import * as yup from "yup";
import AppNotification from "../../appNotifications";
import {FetchingRecords, ErrorView} from "../../appWidgets";

import jwtAuthService  from "../../services/jwtAuthService";

import { VIEW_FORBIDDEN } from "app/appConstants";
import { AppCustomPagination } from "app/dataTableWidgets";


import LaddaButton, {
    XL,
    EXPAND_LEFT,
    EXPAND_RIGHT,
    EXPAND_UP,

    CONTRACT,
  } from "react-ladda";

export class DepartmentsComponent extends Component{

  userPermissions = [];
  CAN_VIEW_ALL = false;
  CAN_CREATE  = false;
  CAN_EDIT  = false;
  CAN_TOGGLE_STATUS  = false;
  appMainService;


    state = {
        editedIndex:0,
        allDepartments:[],
        showEditModal:false,
        showCreateModal:false,
        isSaving:false,
        isFetching:true,
        saveMsg:'Save',
        updateMsg:'Update',
        editedDepartment: {},
        createDepartmentForm: {
            name: "",
            description: "",
            code:"",
            is_budgeting:true,
          },
          updateDepartmentForm: {
            name: "",
            description: "",
            code:"",
            is_budgeting:true,


          },

          paginationOptions:{
            rowsDisplayed:2,
            totalNumRows:0,
            startIndex:1,
            stopIndex:5,
          }





    }


    columns = [
      {
        dataField: "index",
        text: "#"
      },
      {
        dataField: "name",
        text: "Name"
      },
      {
        dataField: "code",
        text: "Code"
      },
      {
        dataField: "description",
        text: "Description"
      },
      {
        dataField: "status",
        text: "Status",
      },
      {
        dataField: "created_at",
        text: "Date Created",
        align: "center",
        headerAlign: "center"
      },
      {
        dataField: "updated_at",
        text: "Date Updated",
      }
    ];





    constructor(props){
        super(props)
        this.appMainService = new AppMainService();

        const componentName = "Administration___Departments";
        const componentPermissions = utils.getComponentPermissions(componentName, props.route.auth);
        this.userPermissions = utils.comparePermissions(jwtAuthService.getUserTasks(), componentPermissions);
        this.CAN_VIEW_ALL = this.userPermissions.includes(`${componentName}__CAN_VIEW_ALL`);
        this.CAN_CREATE = this.userPermissions.includes(`${componentName}__CAN_CREATE`);
        this.CAN_EDIT = this.userPermissions.includes(`${componentName}__CAN_EDIT`);
        this.CAN_TOGGLE_STATUS = this.userPermissions.includes(`${componentName}__CAN_TOGGLE_STATUS`);
    }

    componentDidMount(){
         this.getAllDepartments()
    }

    /**
     *
     * @param {*} event
     * @param {*} errors
     * @param {*} form
     */

    handleChange = (event, form='create') => {
        const {createDepartmentForm, updateDepartmentForm} = this.state
        let {name, value} = event.target;

        if(form=='create'){
          if(name == 'is_budgeting'){
            const { is_budgeting } = createDepartmentForm;
            value = !is_budgeting;
          }
            createDepartmentForm[name] = value;
        }else if(form=='edit'){
          if(name == 'is_budgeting'){
            const { is_budgeting } = updateDepartmentForm;
            value = !is_budgeting;
          }
            updateDepartmentForm[name] = value;
        }
        this.setState({ createDepartmentForm, updateDepartmentForm });
    }


    paginateData = (pageIndex) =>{

      let { paginationOptions, allDepartments } = this.state;
      const { rowsDisplayed } = paginationOptions;
      const start_pos = pageIndex+1;
      const start_chunk = Math.ceil(allDepartments.length / start_pos);
      const end_chunk = start_chunk + rowsDisplayed;
      console.log('Page Index', pageIndex, 'Start:',start_chunk,'End:', end_chunk, 'rows displayed', rowsDisplayed);
      allDepartments.forEach((department, index)=>{
        if(start_chunk <= index && index < end_chunk ){
          department.show_ = true;
        }else{
          department.show_ = false;
        }
      })

      // allDepartments = allDepartments.slice(start_chunk, end_chunk);
      this.setState({allDepartments});



    }





    /**
     * This method lists all departments
     */
     getAllDepartments = async ()=>{
         let isFetching = false;

        this.appMainService.getAllDepartments().then(
            (departmentsResponse)=>{
                const allDepartments = departmentsResponse.map((d)=>{
                  d.show_ = true;
                  return d;
                });

                this.setState({ allDepartments, isFetching})
                console.log('Departments response', departmentsResponse)
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
     * This method creates a new department
     */
    createDepartment = async ()=>{
        const {createDepartmentForm, allDepartments} = this.state;
        let isSaving = true;
        let saveMsg = 'Saving';
        this.setState({isSaving, saveMsg})
        this.appMainService.createDepartment(createDepartmentForm).then(
            (departmentData)=>{
                isSaving = false;
                saveMsg = 'Save';
                allDepartments.unshift(departmentData)
                this.setState({ allDepartments, isSaving, saveMsg })
                const successNotification = {
                    type:'success',
                    msg:`${departmentData.name} successfully created!`
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


    /**
     * This method updates a new department
     */
    updateDepartment = async ()=>{



        let {updateDepartmentForm, allDepartments, editedDepartment} = this.state;
        let isSaving = true;
        let updateMsg = 'Updating';
        this.setState({isSaving, updateMsg})
        this.appMainService.updateDepartment(updateDepartmentForm, editedDepartment.id).then(
            (updatedDepartment)=>{
                updatedDepartment.temp_flash = true
                isSaving = false;
                updateMsg = 'Update';
                allDepartments.splice(this.state.editedIndex, 1, updatedDepartment)
                this.setState({ allDepartments, isSaving, updateMsg })
                const successNotification = {
                    type:'success',
                    msg:`${updatedDepartment.name} successfully updated!`
                }
                new AppNotification(successNotification)
                this.toggleModal('edit');

             setTimeout(()=>{
                    updatedDepartment.temp_flash = false
                    allDepartments.splice(this.state.editedIndex, 1, updatedDepartment)
                    this.setState({ allDepartments, isSaving, updateMsg })
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
        let {showEditModal, showCreateModal } = this.state;
        if(modalName == 'create'){
            showCreateModal = !showCreateModal;
        }else if(modalName == 'edit'){
            showEditModal = !showEditModal
        }

        this.setState({ showEditModal, showCreateModal })
    }



    /**
     *
     * This method sets the department to be edited
     *  and opens the modal for edit
     *
     */
    editDepartment = (editedDepartment) => {
        const updateDepartmentForm = {...editedDepartment}
        const editedIndex = this.state.allDepartments.findIndex(department => editedDepartment.id == department.id)
        this.setState({editedDepartment, editedIndex, updateDepartmentForm});
        this.toggleModal('edit')
    }


    /**
     *
     * @param {*} department
     * This method toggles a department's status
     */
    toggleDepartment = (department)=>{
        const toggleMsg = department.status? "Disable":"Enable";
        const gL = department.status? "lose":"gain"


        swal.fire({
            title: `<small>${toggleMsg}&nbsp;<b>${department.name}</b>?</small>`,
            text: `${department.name} members will ${gL} permissions.`,
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
                let { allDepartments } = this.state
                const toggleIndex = allDepartments.findIndex(r => r.id == department.id)
                // department.status = !department.status;

              this.appMainService.toggleDepartment(department).then(
                (toggledDepartment)=>{
                    allDepartments.splice(toggleIndex, 1, toggledDepartment)
                    this.setState({ allDepartments })
                    const successNotification = {
                        type:'success',
                        msg:`${toggledDepartment.name} successfully ${toggleMsg}d!`
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
     * @param {*} department
     * This method deletes a department
     *
     */
    deleteDepartment = (department)=>{
         swal.fire({
                title: `<small>Delete&nbsp;<b>${department.name}</b>?</small>`,
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
                let { allDepartments } = this.state
                  this.appMainService.deleteDepartment(department).then(
                    (deletedDepartment)=>{
                        allDepartments = allDepartments.filter(r=> r.id !== department.id)
                        this.setState({ allDepartments })
                        const successNotification = {
                            type:'success',
                            msg:`${department.name} successfully deleted!`
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
        const createDepartmentForm = {
            name: "",
            description: "",
          }
          this.setState({createDepartmentForm})

    }

    render(){

      const { CAN_VIEW_ALL, CAN_CREATE, CAN_EDIT, CAN_TOGGLE_STATUS, state} = this;

      const { paginationOptions, allDepartments } = state;
      const { rowsDisplayed, startIndex, stopIndex } = paginationOptions;
      const pagination_props = { rowsDisplayed, totalNumRows:allDepartments.length };

        return !CAN_VIEW_ALL ? <ErrorView errorType={VIEW_FORBIDDEN} /> :  (

            <>
                <div className="specific">

                <Modal show={this.state.showEditModal} onHide={
                    ()=>{ this.toggleModal('edit')}
                    } {...this.props} id='edit_modal'>
                    <Modal.Header closeButton>
                    <Modal.Title>Update {this.state.editedDepartment.name}</Modal.Title>
                    </Modal.Header>

                    <Formik
                    initialValues={this.state.updateDepartmentForm}
                    validationSchema={this.updateDepartmentSchema}
                    onSubmit={this.updateDepartment}
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
                                    "col-md-12 mb-2": true,
                                    "valid-field":
                                        !errors.name && touched.name,
                                    "invalid-field":
                                        errors.name && touched.name
                                    })}
                                >
                                    <label htmlFor="department_name">
                                        <b>Name<span className='text-danger'>*</span></b>
                                    </label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    id="department_name"
                                    placeholder=""
                                    name="name"
                                    value={values.name}
                                    onChange={(event)=>this.handleChange(event, 'edit')}
                                    onBlur={handleBlur}
                                    required
                                    />
                                    <div className="valid-feedback"></div>
                                    <div className="invalid-feedback">
                                    Name is required
                                    </div>
                                </div>

                                <div
                                    className={utils.classList({
                                    "col-md-12 mb-2": true,
                                    "valid-field":
                                        !errors.code && touched.code,
                                    "invalid-field":
                                        errors.code && touched.code
                                    })}
                                >
                                    <label htmlFor="department_code">
                                        <b>Code<span className='text-danger'>*</span></b>
                                    </label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    id="department_code"
                                    placeholder=""
                                    name="code"
                                    value={values.code}
                                    onChange={(event)=>this.handleChange(event, 'edit')}
                                    onBlur={handleBlur}
                                    required
                                    />
                                    <div className="valid-feedback"></div>
                                    <div className="invalid-feedback">
                                    Code is required
                                    </div>
                                </div>

                                <div
                                    className={utils.classList({
                                    "col-md-12 mb-2": true,
                                    "valid-field":
                                        touched.description && !errors.description,
                                    "invalid-field":
                                        touched.description && errors.description
                                    })}
                                >
                                    <label htmlFor="update_department_description">
                                         <b>Description<span className='text-danger'>*</span></b>
                                    </label>

                                    <textarea className="form-control"
                                    id="update_department_description"  onChange={(event)=>this.handleChange(event,'edit')}
                                    name="description"
                                    defaultValue={values.description}
                                   />
                                    <div className="valid-feedback"></div>
                                    <div className="invalid-feedback">
                                    Description is required
                                    </div>
                                </div>

                                <div   className={utils.classList({
                                  "col-md-12 mb-2": true,
                                  "valid-field":
                                      touched.is_budgeting && !errors.is_budgeting,
                                  "invalid-field":
                                      touched.is_budgeting && errors.is_budgeting
                                  })}>

                                  <div className='form-group row mt-2'>

                                    <div className="col-sm-6"><b>Is this a budgeting department?</b></div>
                                  <div className="col-sm-6">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          id="is_budgeting_update"
                                          name="is_budgeting"
                                          checked={values.is_budgeting}
                                          onChange={(event)=>this.handleChange(event,'edit')}

                                        />
                                        <label
                                          className="form-check-label ml-3"
                                          htmlFor="is_budgeting_update"
                                        >
                                          {
                                              values.is_budgeting ? (
                                                <b className='text-success'>
                                                  Yes
                                                </b>
                                              ):(
                                                <b className='text-danger'>
                                                  No
                                                </b>
                                              )
                                          }
                                        </label>
                                      </div>
                                    </div>

                                  </div>
                                  {
                                    !values.is_budgeting ? (
                                      <div className='jumbotron animated fadeInDown dwarf'>
                                        This department will be <b className='text-danger'><em><u>excluded from</u></em></b>  budgeting.
                                      </div>
                                    ): null
                                  }

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
                                        className={`btn btn-${utils.isValid(this.updateDepartmentSchema, this.state.updateDepartmentForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
                                        loading={this.state.isSaving}
                                        progress={0.5}
                                        type='submit'
                                        data-style={EXPAND_RIGHT}
                                        >
                                        {this.state.updateMsg}
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
                    <Modal.Title>Create Department</Modal.Title>
                    </Modal.Header>

                    <Formik
                    initialValues={this.state.createDepartmentForm}
                    validationSchema={this.createDepartmentSchema}
                    onSubmit={this.createDepartment}
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
                                    "col-md-12 mb-2": true,
                                    "valid-field":
                                        !errors.name && touched.name,
                                    "invalid-field":
                                        errors.name && touched.name
                                    })}
                                >
                                    <label htmlFor="department_name">
                                        <b>Name<span className='text-danger'>*</span></b>
                                    </label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    id="department_name"
                                    placeholder=""
                                    name="name"
                                    value={values.name}
                                    onChange={(event)=>this.handleChange(event)}
                                    onBlur={handleBlur}
                                    required
                                    />
                                    <div className="valid-feedback"></div>
                                    <div className="invalid-feedback">
                                    Name is required
                                    </div>
                                </div>

                                <div
                                    className={utils.classList({
                                    "col-md-12 mb-2": true,
                                    "valid-field":
                                        !errors.code && touched.code,
                                    "invalid-field":
                                        errors.code && touched.code
                                    })}
                                >
                                    <label htmlFor="department_code">
                                        <b>Code<span className='text-danger'>*</span></b>
                                    </label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    id="department_code"
                                    placeholder=""
                                    name="code"
                                    value={values.code}
                                    onChange={(event)=>this.handleChange(event)}
                                    onBlur={handleBlur}
                                    required
                                    />
                                    <div className="valid-feedback"></div>
                                    <div className="invalid-feedback">
                                    Code is required
                                    </div>
                                </div>

                                <div
                                    className={utils.classList({
                                    "col-md-12 mb-2": true,
                                    "valid-field":
                                        touched.description && !errors.description,
                                    "invalid-field":
                                        touched.description && errors.description
                                    })}
                                >
                                    <label htmlFor="create_department_description">
                                         <b>Description<span className='text-danger'>*</span></b>
                                    </label>

                                    <textarea className="form-control"
                                    id="create_department_description"  onChange={(event)=>this.handleChange(event)}
                                    name="description"
                                    defaultValue={values.description}
                                   />
                                    <div className="valid-feedback"></div>
                                    <div className="invalid-feedback">
                                    Description is required
                                    </div>
                                </div>

                                <div   className={utils.classList({
                                  "col-md-12 mb-2": true,
                                  "valid-field":
                                      touched.is_budgeting && !errors.is_budgeting,
                                  "invalid-field":
                                      touched.is_budgeting && errors.is_budgeting
                                  })}>

                                  <div className='form-group row mt-2'>

                                    <div className="col-sm-6"><b>Is this a budgeting department?</b></div>
                                  <div className="col-sm-6">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          id="is_budgeting_create"
                                          name="is_budgeting"
                                          checked={values.is_budgeting}
                                          onChange={(event)=>this.handleChange(event)}

                                        />
                                        <label
                                          className="form-check-label ml-3"
                                          htmlFor="is_budgeting_create"
                                        >
                                          {
                                              values.is_budgeting ? (
                                                <b className='text-success'>
                                                  Yes
                                                </b>
                                              ):(
                                                <b className='text-danger'>
                                                  No
                                                </b>
                                              )
                                          }
                                        </label>
                                      </div>
                                    </div>

                                  </div>
                                  {
                                    !values.is_budgeting ? (
                                      <div className='jumbotron animated fadeInDown dwarf'>
                                        This department will be <b className='text-danger'><em><u>excluded from</u></em></b>  budgeting.
                                      </div>
                                    ): null
                                  }

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
                                        className={`btn btn-${utils.isValid(this.createDepartmentSchema, this.state.createDepartmentForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
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
                        <Button  variant="secondary_custom" className="ripple m-1 text-capitalize" onClick={ ()=>{ this.toggleModal('create')} }><i className='i-Add'></i> Create Department</Button>
                    </div>
                  ) : null
                }


                <div className="breadcrumb">
                    <h1>Departments</h1>
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
                                <h4 className="card-title mb-3">Departments</h4>
                                <p>List of departments.</p>

                            {/* <div style={{"maxHeight":"500px", "overflowY":"scroll"}}> */}

                            <div className="table-responsive">
                                    <table className="display table table-striped table-hover " id="zero_configuration_table" style={{"width":"100%"}}>
                                        <thead>
                                            <tr className="ul-widget6__tr--sticky-th">
                                                <th>#</th>
                                                <th>Name</th>
                                                <th>Code</th>
                                                <th>Description</th>
                                                <th>Status</th>
                                                <th>Date Created</th>
                                                <th>Date Updated</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {
                                          this.state.allDepartments.length ?  this.state.allDepartments.map( (department, index)=>{
                                            const { show_ } = department;
                                            if(show_){
                                              return (
                                                  <tr key={department.id} className={department.temp_flash ? 'bg-success text-white':''}>
                                                      <td>
                                                          <b>{index+1}</b>.
                                                          {
                                                            department?.is_budgeting ? null :(

                                                              <OverlayTrigger
                                                                placement={'top'}
                                                                overlay={
                                                                  <Tooltip id={`tooltip-${department.code}`}>
                                                                    Non-budgeting.
                                                                  </Tooltip>
                                                                }
                                                              >
                                                              <b>
                                                                <sup className='text-danger'>
                                                                    <i className='i-Delete-File'></i>
                                                                </sup>
                                                            </b>
                                                          </OverlayTrigger>

                                                            )
                                                          }
                                                      </td>
                                                      <td>
                                                          {department.name}
                                                      </td>
                                                      <td>
                                                          <code>{department.code}</code>
                                                      </td>
                                                      <td>
                                                      {department.description}
                                                      </td>
                                                      <td>
                                                        {
                                                          CAN_TOGGLE_STATUS ? (

                                                            <Form>

                                                                 <Form.Check
                                                                        checked={department.status}
                                                                        type="switch"
                                                                        id={`custom-switch${department.id}`}
                                                                        label={department.status ? 'Enabled' : 'Disabled'}
                                                                        className={department.status ? 'text-success' : 'text-danger'}
                                                                        onChange={()=> this.toggleDepartment(department)}
                                                                    />


                                                                </Form>
                                                          ) : (
                                                            <span className={department.status ? `badge  badge-success`: `badge  badge-danger`}>
                                                              {department.status ? 'Enabled' : 'Disabled'}
                                                            </span>
                                                          )
                                                        }

                                                      </td>
                                                      <td>
                                                      {utils.formatDate(department.created_at)}
                                                      </td>
                                                      <td>
                                                      {utils.formatDate(department.updated_at)}
                                                      </td>

                                                      <td>
                                                      <Dropdown key={department.id}>
                                                          <Dropdown.Toggle variant='secondary_custom' className="mr-3 mb-3" size="sm">
                                                          Manage
                                                          </Dropdown.Toggle>
                                                          <Dropdown.Menu>
                                                            {
                                                              CAN_EDIT ? (

                                                                <Dropdown.Item onClick={()=> {
                                                                    this.editDepartment(department);
                                                                }} className='border-bottomx'>
                                                                    <i className="nav-icon i-Pen-2 text-success font-weight-bold"> </i> Edit
                                                                </Dropdown.Item>

                                                              ) : null
                                                            }

                                                          {/* <Dropdown.Item className='text-danger' onClick={
                                                              ()=>{this.deleteDepartment(department);}
                                                          }>
                                                              <i className="i-Close-Window"> </i> Delete
                                                          </Dropdown.Item> */}
                                                          {/* <Dropdown.Item>
                                                              <i className="i-Money-Bag"> </i> Something else here
                                                          </Dropdown.Item> */}
                                                          </Dropdown.Menu>
                                                      </Dropdown>

                                                      </td>

                                                  </tr>
                                              )
                                            }



                                            }) :
                                            (
                                                <tr>
                                                    <td className='text-center' colSpan='8'>
                                                    <FetchingRecords isFetching={this.state.isFetching}/>
                                                    </td>
                                                </tr>
                                            )
                                        }

                                        </tbody>
                                        <tfoot>
                                            <tr>
                                              <th>#</th>
                                              <th>Name</th>
                                              <th>Code</th>
                                              <th>Description</th>
                                              <th>Status</th>
                                              <th>Date Created</th>
                                              <th>Date Updated</th>
                                              <th>Action</th>
                                            </tr>
                                        </tfoot>
                                    </table>


                                </div>
                              <AppCustomPagination onPaginate={(pageIndex) => this.paginateData(pageIndex)} {...pagination_props}/>
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

createDepartmentSchema = yup.object().shape({
        name: yup.string().required("Name is required"),
        description: yup.string().required("Description is required"),
        code: yup.string().required("Code is required"),

      });


updateDepartmentSchema = yup.object().shape({
        name: yup.string().required("Name is required"),
        description: yup.string().required("Description is required"),
        code: yup.string().required("Code is required"),

        });

}




export default DepartmentsComponent;
