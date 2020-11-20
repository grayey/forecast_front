import React, { Component, useState, useEffect } from "react"
import { Dropdown, Row, Col, Button,Form, ButtonToolbar,Modal } from "react-bootstrap";
// import SweetAlert from "sweetalert2-react";
import swal from "sweetalert2";
import AppMainService from "../../services/appMainService";
import * as utils from "@utils";
import { Formik } from "formik";
import * as yup from "yup";
import AppNotification from "../../appNotifications";
import {FetchingRecords} from "../../appWidgets";
import jwtAuthService from "../../services/jwtAuthService";
import DepartmentAggregatesApprovalComponent from "./aggregates";
import ConsolidatedApproval from "./consolidatedApproval";




import LaddaButton, {
    XL,
    EXPAND_LEFT,
    EXPAND_RIGHT,
    EXPAND_UP,

    CONTRACT,
  } from "react-ladda";

export class ApprovalsComponent extends Component{

    state = {
        editedIndex:0,
        allApprovals:[],
        showEditModal:false,
        showCreateModal:false,
        activeBudgetCycle:{},
        activeDepartmentRole:{},
        department:{},
        role:{},
        active_version:{},
        isSaving:false,
        isFetching:true,
        saveMsg:'Save',
        updateMsg:'Update',
        editedApproval: {},
        createApprovalForm: {
            name: "",
            description: "",
          },
          updateApprovalForm: {
            name: "",
            description: "",
          },

    }
    appMainService;



    constructor(props){
        super(props)
        this.appMainService = new AppMainService();

    }

    componentDidMount(){
         this.getAllApprovals();
         const activeBudgetCycle = JSON.parse(localStorage.getItem('ACTIVE_BUDGET_CYCLE'));
         const activeDepartmentRole = jwtAuthService.getActiveDepartmentRole();
         const { department, role } = activeDepartmentRole;
         const { active_version } = activeBudgetCycle;
         console.log("ACTTIVE OAA",active_version)
         this.setState({ activeBudgetCycle,activeDepartmentRole, department, role, active_version })
    }

    /**
     *
     * @param {*} event
     * @param {*} errors
     * @param {*} form
     */

    handleChange = (event, form='create') => {
        const {createApprovalForm, updateApprovalForm} = this.state
        if(form=='create'){
            createApprovalForm[event.target.name] = event.target.value;
        }else if(form=='edit'){
            updateApprovalForm[event.target.name] = event.target.value;
        }
        this.setState({ createApprovalForm, updateApprovalForm });
    }





    /**
     * This method lists all approvals
     */
     getAllApprovals = async ()=>{
         let isFetching = false;

        this.appMainService.getAllApprovals().then(
            (approvalsResponse)=>{
                const allApprovals = approvalsResponse;
                this.setState({ allApprovals, isFetching })
                console.log('Approvals response', approvalsResponse)
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
     * This method creates a new approval
     */
    createApproval = async ()=>{
        const {createApprovalForm, allApprovals} = this.state;
        let isSaving = true;
        let saveMsg = 'Saving';
        this.setState({isSaving, saveMsg})
        this.appMainService.createApproval(createApprovalForm).then(
            (approvalData)=>{
                isSaving = false;
                saveMsg = 'Save';
                allApprovals.unshift(approvalData)
                this.setState({ allApprovals, isSaving, saveMsg })
                const successNotification = {
                    type:'success',
                    msg:`${approvalData.name} successfully created!`
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
     * This method updates a new approval
     */
    updateApproval = async ()=>{



        let {updateApprovalForm, allApprovals, editedApproval} = this.state;
        let isSaving = true;
        let updateMsg = 'Updating';
        this.setState({isSaving, updateMsg})
        this.appMainService.updateApproval(updateApprovalForm, editedApproval.id).then(
            (updatedApproval)=>{
                updatedApproval.temp_flash = true
                isSaving = false;
                updateMsg = 'Update';
                allApprovals.splice(this.state.editedIndex, 1, updatedApproval)
                this.setState({ allApprovals, isSaving, updateMsg })
                const successNotification = {
                    type:'success',
                    msg:`${updatedApproval.name} successfully updated!`
                }
                new AppNotification(successNotification)
                this.toggleModal('edit');

             setTimeout(()=>{
                    updatedApproval.temp_flash = false
                    allApprovals.splice(this.state.editedIndex, 1, updatedApproval)
                    this.setState({ allApprovals, isSaving, updateMsg })
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
     * This method sets the approval to be edited
     *  and opens the modal for edit
     *
     */
    editApproval = (editedApproval) => {
        const updateApprovalForm = {...editedApproval}
        const editedIndex = this.state.allApprovals.findIndex(approval => editedApproval.id == approval.id)
        this.setState({editedApproval, editedIndex, updateApprovalForm});
        this.toggleModal('edit')
    }


    /**
     *
     * @param {*} approval
     * This method toggles a approval's status
     */
    toggleApproval = (approval)=>{
        const toggleMsg = approval.status? "Disable":"Enable";
        const gL = approval.status? "lose":"gain"


        swal.fire({
            title: `<small>${toggleMsg}&nbsp;<b>${approval.name}</b>?</small>`,
            text: `${approval.name} members will ${gL} permissions.`,
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
                let { allApprovals } = this.state
                const toggleIndex = allApprovals.findIndex(r => r.id == approval.id)
                // approval.status = !approval.status;

              this.appMainService.toggleApproval(approval).then(
                (toggledApproval)=>{
                    allApprovals.splice(toggleIndex, 1, toggledApproval)
                    this.setState({ allApprovals })
                    const successNotification = {
                        type:'success',
                        msg:`${toggledApproval.name} successfully ${toggleMsg}d!`
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
     * @param {*} approval
     * This method deletes a approval
     *
     */
    deleteApproval = (approval)=>{
         swal.fire({
                title: `<small>Delete&nbsp;<b>${approval.name}</b>?</small>`,
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
                let { allApprovals } = this.state
                  this.appMainService.deleteApproval(approval).then(
                    (deletedApproval)=>{
                        allApprovals = allApprovals.filter(r=> r.id !== approval.id)
                        this.setState({ allApprovals })
                        const successNotification = {
                            type:'success',
                            msg:`${approval.name} successfully deleted!`
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
        const createApprovalForm = {
            name: "",
            description: "",
          }
          this.setState({createApprovalForm})

    }

    render(){

        const { department, role } = this.state.activeDepartmentRole

        return (

            <>
                <div className="specific">

                <Modal show={this.state.showEditModal} onHide={
                    ()=>{ this.toggleModal('edit')}
                    } {...this.props} id='edit_modal'>
                    <Modal.Header closeButton>
                    <Modal.Title>Update {this.state.editedApproval.name}</Modal.Title>
                    </Modal.Header>

                    <Formik
                    initialValues={this.state.updateApprovalForm}
                    validationSchema={this.updateApprovalSchema}
                    onSubmit={this.updateApproval}
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
                                    <label htmlFor="approval_name">
                                        <b>Name<span className='text-danger'>*</span></b>
                                    </label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    id="approval_name"
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
                                    <label htmlFor="update_approval_description">
                                         <b>Description<span className='text-danger'>*</span></b>
                                    </label>

                                    <textarea className="form-control"
                                    id="update_approval_description"  onChange={(event)=>this.handleChange(event,'edit')}
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
                                        className={`btn btn-${utils.isValid(this.updateApprovalSchema, this.state.updateApprovalForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
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
                    <Modal.Title>Create Approval</Modal.Title>
                    </Modal.Header>

                    <Formik
                    initialValues={this.state.createApprovalForm}
                    validationSchema={this.createApprovalSchema}
                    onSubmit={this.createApproval}
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
                                    <label htmlFor="approval_name">
                                        <b>Name<span className='text-danger'>*</span></b>
                                    </label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    id="approval_name"
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
                                    <label htmlFor="create_approval_description">
                                         <b>Description<span className='text-danger'>*</span></b>
                                    </label>

                                    <textarea className="form-control"
                                    id="create_approval_description"  onChange={(event)=>this.handleChange(event)}
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
                                        className={`btn btn-${utils.isValid(this.createApprovalSchema, this.state.createApprovalForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
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
                    {/* <Button  variant="secondary_custom" className="ripple m-1 text-capitalize" onClick={ ()=>{ this.toggleModal('create')} }><i className='i-Add'></i> Create Approval</Button> */}
                </div>

                <div className="breadcrumb">
                    <h1>{this.state?.role?.name} Approval</h1>
                    <ul>
                        <li><a href="#">View</a></li>
                      <li>Approve</li>
                    </ul>
                </div>

                <div className="separator-breadcrumb border-top"></div>
                <div className="row mb-4">

                    <div className="col-md-12 mb-4">
                      <>

                      {
                        role?.approval?.approval_type == 'VERSION' ? <ConsolidatedApproval/> : <DepartmentAggregatesApprovalComponent activeVersion={this.state.active_version} approvalSlug={`${this.state.role?.name?.toLowerCase()?.split(' ')?.join('')}-approval`} />


                      }
                      </>
                    </div>
                    {/* </div> */}
                    {/* <!-- end of col--> */}



                </div>

                </div>

            </>
        )



    }

createApprovalSchema = yup.object().shape({
        name: yup.string().required("Name is required"),
        description: yup.string().required("Description is required"),
      });


updateApprovalSchema = yup.object().shape({
        name: yup.string().required("Name is required"),
        description: yup.string().required("Description is required"),
        });

}




export default ApprovalsComponent
