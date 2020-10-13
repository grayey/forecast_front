import React, { Component, useState, useEffect } from "react"
import { Dropdown, Row, Col, Button,Form, ButtonToolbar,Modal } from "react-bootstrap";
// import SweetAlert from "sweetalert2-react";
import swal from "sweetalert2";
import ProcessingService from "../../../services/processing.service";
import * as utils from "@utils";
import { Formik } from "formik";
import * as yup from "yup";
import AppNotification from "../../../appNotifications";
import {FetchingRecords} from "../../../appWidgets";


import LaddaButton, {
    XL,
    EXPAND_LEFT,
    EXPAND_RIGHT,
    EXPAND_UP,

    CONTRACT,
  } from "react-ladda";

export class BudgetCyclesComponent extends Component{

    state = {
        editedIndex:0,
        allBudgetCycles:[],
        showEditModal:false,
        showCreateModal:false,
        isSaving:false,
        isFetching:true,
        saveMsg:'Save',
        updateMsg:'Update',
        editedBudgetCycle: {},
        createBudgetCycleForm: {
            name: "",
            description: "",
          },
          updateBudgetCycleForm: {
            name: "",
            description: "",
          },

    }
    processingService;



    constructor(props){
        super(props)
        this.processingService = new ProcessingService();
    }

    componentDidMount(){
         this.getAllBudgetCycles()
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





    /**
     * This method lists all budgetcycles
     */
     getAllBudgetCycles = async ()=>{
         let isFetching = false;

        this.processingService.getAllBudgetCycles().then(
            (budgetcyclesResponse)=>{
                const allBudgetCycles = budgetcyclesResponse;
                this.setState({ allBudgetCycles, isFetching })
                console.log('BudgetCycles response', budgetcyclesResponse)
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
     * This method creates a new budgetcycle
     */
    createBudgetCycle = async ()=>{
        const {createBudgetCycleForm, allBudgetCycles} = this.state;
        let isSaving = true;
        let saveMsg = 'Saving';
        this.setState({isSaving, saveMsg})
        this.processingService.createBudgetCycle(createBudgetCycleForm).then(
            (budgetcycleData)=>{
                isSaving = false;
                saveMsg = 'Save';
                allBudgetCycles.unshift(budgetcycleData)
                this.setState({ allBudgetCycles, isSaving, saveMsg })
                const successNotification = {
                    type:'success',
                    msg:`${budgetcycleData.name} successfully created!`
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
     * This method updates a new budgetcycle
     */
    updateBudgetCycle = async ()=>{



        let {updateBudgetCycleForm, allBudgetCycles, editedBudgetCycle} = this.state;
        let isSaving = true;
        let updateMsg = 'Updating';
        this.setState({isSaving, updateMsg})
        this.processingService.updateBudgetCycle(updateBudgetCycleForm, editedBudgetCycle.id).then(
            (updatedBudgetCycle)=>{
                updatedBudgetCycle.temp_flash = true
                isSaving = false;
                updateMsg = 'Update';
                allBudgetCycles.splice(this.state.editedIndex, 1, updatedBudgetCycle)
                this.setState({ allBudgetCycles, isSaving, updateMsg })
                const successNotification = {
                    type:'success',
                    msg:`${updatedBudgetCycle.name} successfully updated!`
                }
                new AppNotification(successNotification)
                this.toggleModal('edit');

             setTimeout(()=>{
                    updatedBudgetCycle.temp_flash = false
                    allBudgetCycles.splice(this.state.editedIndex, 1, updatedBudgetCycle)
                    this.setState({ allBudgetCycles, isSaving, updateMsg })
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
     * This method sets the budgetcycle to be edited
     *  and opens the modal for edit
     *
     */
    editBudgetCycle = (editedBudgetCycle) => {
        const updateBudgetCycleForm = {...editedBudgetCycle}
        const editedIndex = this.state.allBudgetCycles.findIndex(budgetcycle => editedBudgetCycle.id == budgetcycle.id)
        this.setState({editedBudgetCycle, editedIndex, updateBudgetCycleForm});
        this.toggleModal('edit')
    }


    /**
     *
     * @param {*} budgetcycle
     * This method toggles a budgetcycle's status
     */
    toggleBudgetCycle = (budgetcycle)=>{
        const toggleMsg = budgetcycle.status? "Disable":"Enable";
        const gL = budgetcycle.status? "lose":"gain"


        swal.fire({
            title: `<small>${toggleMsg}&nbsp;<b>${budgetcycle.name}</b>?</small>`,
            text: `${budgetcycle.name} members will ${gL} permissions.`,
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
                    allBudgetCycles.splice(toggleIndex, 1, toggledBudgetCycle)
                    this.setState({ allBudgetCycles })
                    const successNotification = {
                        type:'success',
                        msg:`${toggledBudgetCycle.name} successfully ${toggleMsg}d!`
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
                title: `<small>Delete&nbsp;<b>${budgetcycle.name}</b>?</small>`,
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
                    (deletedBudgetCycle)=>{
                        allBudgetCycles = allBudgetCycles.filter(r=> r.id !== budgetcycle.id)
                        this.setState({ allBudgetCycles })
                        const successNotification = {
                            type:'success',
                            msg:`${budgetcycle.name} successfully deleted!`
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

        return (

            <>
                <div className="specific">

                <Modal show={this.state.showEditModal} onHide={
                    ()=>{ this.toggleModal('edit')}
                    } {...this.props} id='edit_modal'>
                    <Modal.Header closeButton>
                    <Modal.Title>Update {this.state.editedBudgetCycle.name}</Modal.Title>
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
                                    "col-md-12 mb-2": true,
                                    "valid-field":
                                        !errors.name && touched.name,
                                    "invalid-field":
                                        errors.name && touched.name
                                    })}
                                >
                                    <label htmlFor="budgetcycle_name">
                                        <b>Name<span className='text-danger'>*</span></b>
                                    </label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    id="budgetcycle_name"
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
                                        touched.description && !errors.description,
                                    "invalid-field":
                                        touched.description && errors.description
                                    })}
                                >
                                    <label htmlFor="update_budgetcycle_description">
                                         <b>Description<span className='text-danger'>*</span></b>
                                    </label>

                                    <textarea className="form-control"
                                    id="update_budgetcycle_description"  onChange={(event)=>this.handleChange(event,'edit')}
                                    name="description"
                                    defaultValue={values.description}
                                   />
                                    <div className="valid-feedback"></div>
                                    <div className="invalid-feedback">
                                    Description is required
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
                                        className={`btn btn-${utils.isValid(this.updateBudgetCycleSchema, this.state.updateBudgetCycleForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
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
                    <Modal.Title>Create BudgetCycle</Modal.Title>
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
                                    "col-md-12 mb-2": true,
                                    "valid-field":
                                        !errors.name && touched.name,
                                    "invalid-field":
                                        errors.name && touched.name
                                    })}
                                >
                                    <label htmlFor="budgetcycle_name">
                                        <b>Name<span className='text-danger'>*</span></b>
                                    </label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    id="budgetcycle_name"
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
                                        touched.description && !errors.description,
                                    "invalid-field":
                                        touched.description && errors.description
                                    })}
                                >
                                    <label htmlFor="create_budgetcycle_description">
                                         <b>Description<span className='text-danger'>*</span></b>
                                    </label>

                                    <textarea className="form-control"
                                    id="create_budgetcycle_description"  onChange={(event)=>this.handleChange(event)}
                                    name="description"
                                    defaultValue={values.description}
                                   />
                                    <div className="valid-feedback"></div>
                                    <div className="invalid-feedback">
                                    Description is required
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

                <div className='float-right'>
                    <Button  variant="secondary_custom" className="ripple m-1 text-capitalize" onClick={ ()=>{ this.toggleModal('create')} }><i className='i-Add'></i> Budget Cycle</Button>
                </div>

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

                            <div className="table-responsive">
                                    <table className="display table table-striped table-hover " id="zero_configuration_table" style={{"width":"100%"}}>
                                        <thead>
                                            <tr className="ul-widget6__tr--sticky-th">
                                                <th>#</th>
                                                <th>Year</th>
                                                <th>Description</th>
                                                <th>USD Rate</th>
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
                                                return (
                                                    <tr key={budgetcycle.id} className={budgetcycle.temp_flash ? 'bg-success text-white':''}>
                                                        <td>
                                                            <b>{index+1}</b>.
                                                        </td>
                                                        <td>
                                                            {budgetcycle.name}
                                                        </td>
                                                        <td>
                                                        {budgetcycle.description}
                                                        </td>
                                                        <td>
                                                        <Form>

                                                             <Form.Check
                                                                    checked={budgetcycle.status}
                                                                    type="switch"
                                                                    id={`custom-switch${budgetcycle.id}`}
                                                                    label={budgetcycle.status ? 'Enabled' : 'Disabled'}
                                                                    className={budgetcycle.status ? 'text-success' : 'text-danger'}
                                                                    onChange={()=> this.toggleBudgetCycle(budgetcycle)}
                                                                />


                                                            </Form>
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
                                                            <Dropdown.Item onClick={()=> {
                                                                this.editBudgetCycle(budgetcycle);
                                                            }} className='border-bottom'>
                                                                <i className="nav-icon i-Pen-2 text-success font-weight-bold"> </i> Edit
                                                            </Dropdown.Item>
                                                            <Dropdown.Item className='text-danger' onClick={
                                                                ()=>{this.deleteBudgetCycle(budgetcycle);}
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
                                              <th>Year</th>
                                              <th>Description</th>
                                              <th>USD Rate</th>
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
        name: yup.string().required("Name is required"),
        description: yup.string().required("Description is required"),
      });


updateBudgetCycleSchema = yup.object().shape({
        name: yup.string().required("Name is required"),
        description: yup.string().required("Description is required"),
        });

}




export default BudgetCyclesComponent
