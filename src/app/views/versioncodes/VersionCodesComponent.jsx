import React, { Component, useState, useEffect } from "react"
import { Dropdown, Row, Col, Button,Form, ButtonToolbar,Modal } from "react-bootstrap";
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



import LaddaButton, {
    XL,
    EXPAND_LEFT,
    EXPAND_RIGHT,
    EXPAND_UP,

    CONTRACT,
  } from "react-ladda";

export class VersionCodesComponent extends Component{

  userPermissions = [];
  CAN_VIEW_ALL = false;
  CAN_CREATE  = false;
  CAN_EDIT  = false;

    state = {
        editedIndex:0,
        allVersionCodes:[],
        showEditModal:false,
        showCreateModal:false,
        isSaving:false,
        isFetching:true,
        saveMsg:'Save',
        updateMsg:'Update',
        editedVersionCode: {},
        createVersionCodeForm: {
            name: "",
            code: "",
            step: "",
          },
          updateVersionCodeForm: {
            name: "",
            code: "",
            step:""
          },

    }
    appMainService;



    constructor(props){
        super(props)
        this.appMainService = new AppMainService();

        const componentName = "Administration___Versioning";
        const componentPermissions = utils.getComponentPermissions(componentName, props.route.auth);
        this.userPermissions = utils.comparePermissions(jwtAuthService.getUserTasks(), componentPermissions);
        this.CAN_VIEW_ALL = this.userPermissions.includes(`${componentName}__CAN_VIEW_ALL`);
        this.CAN_CREATE = this.userPermissions.includes(`${componentName}__CAN_CREATE`);
        this.CAN_EDIT = this.userPermissions.includes(`${componentName}__CAN_EDIT`);
    }

    componentDidMount(){
         this.getAllVersionCodes()
    }

    /**
     *
     * @param {*} event
     * @param {*} errors
     * @param {*} form
     */

    handleChange = (event, form='create') => {
        const {createVersionCodeForm, updateVersionCodeForm} = this.state
        if(form=='create'){
            createVersionCodeForm[event.target.name] = event.target.value;
        }else if(form=='edit'){
            updateVersionCodeForm[event.target.name] = event.target.value;
        }
        this.setState({ createVersionCodeForm, updateVersionCodeForm });
    }


    sortVersionioning = ()=>{
      const {allVersionCodes} = this.state
      allVersionCodes.sort((a, b) => (a.step > b.step) ? 1 : -1); // ascending
      this.setState({allVersionCodes})
    }



    /**
     * This method lists all versioncodes
     */

     getAllVersionCodes = async ()=>{
       let isFetching = false;

       this.appMainService.getAllVersionCodes().then(
         async(versioncodesResponse)=>{
           const allVersionCodes = versioncodesResponse;
           await this.setState({ allVersionCodes, isFetching })
           this.sortVersionioning();
           console.log('VersionCodes response', versioncodesResponse)
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
     * This method creates a new versioncode
     */
    createVersionCode = async ()=>{
        const {createVersionCodeForm, allVersionCodes} = this.state;
        if(!allVersionCodes.length){
          if(createVersionCodeForm.step != 1){
            new AppNotification({
              type:"info",
              msg:`First version must have a step of 1.`
            })
          }
          createVersionCodeForm.step = 1; // first version must be one
        }else{
          const previousStep = allVersionCodes[allVersionCodes.length - 1].step;
          if(previousStep && previousStep + 1 !== parseInt( createVersionCodeForm.step)){
            return new AppNotification({
              type:"warning",
              msg:`You have not created step ${(previousStep + 1).toString()}`
            })

          }
        }

        let isSaving = true;
        let saveMsg = 'Saving';
        this.setState({isSaving, saveMsg})
        this.appMainService.createVersionCode(createVersionCodeForm).then(
            (versioncodeData)=>{
                isSaving = false;
                saveMsg = 'Save';
                allVersionCodes.push(versioncodeData)
                this.setState({ allVersionCodes, isSaving, saveMsg })
                const successNotification = {
                    type:'success',
                    msg:`${versioncodeData.name} successfully created!`
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
     * This method updates a new versioncode
     */
    updateVersionCode = async ()=>{



        let {updateVersionCodeForm, allVersionCodes, editedVersionCode} = this.state;
        let isSaving = true;
        let updateMsg = 'Updating';
        this.setState({isSaving, updateMsg})
        this.appMainService.updateVersionCode(updateVersionCodeForm, editedVersionCode.id).then(
            (updatedVersionCode)=>{
                updatedVersionCode.temp_flash = true
                isSaving = false;
                updateMsg = 'Update';
                allVersionCodes.splice(this.state.editedIndex, 1, updatedVersionCode)
                this.setState({ allVersionCodes, isSaving, updateMsg })
                const successNotification = {
                    type:'success',
                    msg:`${updatedVersionCode.name} successfully updated!`
                }
                new AppNotification(successNotification)
                this.toggleModal('edit');

             setTimeout(()=>{
                    updatedVersionCode.temp_flash = false
                    allVersionCodes.splice(this.state.editedIndex, 1, updatedVersionCode)
                    this.setState({ allVersionCodes, isSaving, updateMsg })
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
     * This method sets the versioncode to be edited
     *  and opens the modal for edit
     *
     */
    editVersionCode = (editedVersionCode) => {
        const updateVersionCodeForm = {...editedVersionCode}
        const editedIndex = this.state.allVersionCodes.findIndex(versioncode => editedVersionCode.id == versioncode.id)
        this.setState({editedVersionCode, editedIndex, updateVersionCodeForm});
        this.toggleModal('edit')
    }


    /**
     *
     * @param {*} versioncode
     * This method toggles a versioncode's status
     */
    toggleVersionCode = (versioncode)=>{
        const toggleMsg = versioncode.status? "Disable":"Enable";
        const gL = versioncode.status? "lose":"gain"


        swal.fire({
            title: `<small>${toggleMsg}&nbsp;<b>${versioncode.name}</b>?</small>`,
            text: `${versioncode.name} members will ${gL} permissions.`,
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
                let { allVersionCodes } = this.state
                const toggleIndex = allVersionCodes.findIndex(r => r.id == versioncode.id)
                // versioncode.status = !versioncode.status;

              this.appMainService.toggleVersionCode(versioncode).then(
                (toggledVersionCode)=>{
                    allVersionCodes.splice(toggleIndex, 1, toggledVersionCode)
                    this.setState({ allVersionCodes })
                    const successNotification = {
                        type:'success',
                        msg:`${toggledVersionCode.name} successfully ${toggleMsg}d!`
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
     * @param {*} versioncode
     * This method deletes a versioncode
     *
     */
    deleteVersionCode = (versioncode)=>{
         swal.fire({
                title: `<small>Delete&nbsp;<b>${versioncode.name}</b>?</small>`,
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
                let { allVersionCodes } = this.state
                  this.appMainService.deleteVersionCode(versioncode).then(
                    (deletedVersionCode)=>{
                        allVersionCodes = allVersionCodes.filter(r=> r.id !== versioncode.id)
                        this.setState({ allVersionCodes })
                        const successNotification = {
                            type:'success',
                            msg:`${versioncode.name} successfully deleted!`
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
        const createVersionCodeForm = {
            name: "",
            description: "",
          }
          this.setState({createVersionCodeForm})

    }

    render(){

      const { CAN_VIEW_ALL, CAN_CREATE, CAN_EDIT} = this;

        return !CAN_VIEW_ALL ? <ErrorView errorType={VIEW_FORBIDDEN} /> : (

            <>
                <div className="specific">

                <Modal show={this.state.showEditModal} onHide={
                    ()=>{ this.toggleModal('edit')}
                    } {...this.props} id='edit_modal'>
                    <Modal.Header closeButton>
                    <Modal.Title>
                      <img src="/assets/images/logo.png" alt="Logo" className="modal-logo"  />&nbsp;&nbsp;
                      Update {this.state.editedVersionCode.name}
                    </Modal.Title>
                    </Modal.Header>

                    <Formik
                    initialValues={this.state.updateVersionCodeForm}
                    validationSchema={this.updateVersionCodeSchema}
                    onSubmit={this.updateVersionCode}
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
                                    <label htmlFor="versioncode_name">
                                        <b>Name<span className='text-danger'>*</span></b>
                                    </label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    id="versioncode_name"
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
                                        touched.code && !errors.code,
                                    "invalid-field":
                                        touched.code && errors.code
                                    })}
                                >
                                    <label htmlFor="create_version_code">
                                         <b>Category Code<span className='text-danger'>*</span></b>
                                    </label>

                                    <input
                                    type="text"
                                    className="form-control"
                                    id="version_code"
                                    placeholder=""
                                    name="code"
                                    value={values.code}
                                    onChange={(event)=>this.handleChange(event, 'edit')}
                                    onBlur={handleBlur}
                                    required
                                    />
                                    <div className="valid-feedback"></div>
                                    <div className="invalid-feedback">
                                    Version Code is required
                                    </div>
                                </div>

                                <div
                                    className={utils.classList({
                                    "col-md-12 mb-2": true,
                                    "valid-field":
                                        touched.step && !errors.step,
                                    "invalid-field":
                                        touched.step && errors.step
                                    })}
                                >
                                    <label htmlFor="create_version_code_step">
                                         <b>Step (No.)<span className='text-danger'>*</span></b>
                                    </label>

                                    <input
                                    type="number"
                                    className="form-control"
                                    id="update_version_code_step"
                                    placeholder=""
                                    name="step"
                                    value={values.step}
                                    onChange={(event)=>this.handleChange(event, "edit")}
                                    onBlur={handleBlur}
                                    required
                                    />
                                    <div className="valid-feedback"></div>
                                    <div className="invalid-feedback">
                                    Step (No.) is required
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
                                        className={`btn btn-${utils.isValid(this.updateVersionCodeSchema, this.state.updateVersionCodeForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
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
                    <Modal.Title>
                      <img src="/assets/images/logo.png" alt="Logo" className="modal-logo"  />&nbsp;&nbsp;
                      Create Versioning
                    </Modal.Title>
                    </Modal.Header>

                    <Formik
                    initialValues={this.state.createVersionCodeForm}
                    validationSchema={this.createVersionCodeSchema}
                    onSubmit={this.createVersionCode}
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
                                    <label htmlFor="versioncode_name">
                                        <b>Name<span className='text-danger'>*</span></b>
                                    </label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    id="versioncode_name"
                                    placeholder="eg. Version 1"
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
                                        touched.code && !errors.code,
                                    "invalid-field":
                                        touched.code && errors.code
                                    })}
                                >
                                    <label htmlFor="create_version_code">
                                         <b>Version Code<span className='text-danger'>*</span></b>
                                    </label>

                                    <input
                                    type="text"
                                    className="form-control"
                                    id="version_code"
                                    placeholder="e.g BV1"
                                    name="code"
                                    value={values.code}
                                    onChange={(event)=>this.handleChange(event)}
                                    onBlur={handleBlur}
                                    required
                                    />
                                    <div className="valid-feedback"></div>
                                    <div className="invalid-feedback">
                                    Version Code is required
                                    </div>
                                </div>

                                <div
                                    className={utils.classList({
                                    "col-md-12 mb-2": true,
                                    "valid-field":
                                        touched.step && !errors.step,
                                    "invalid-field":
                                        touched.step && errors.step
                                    })}
                                >
                                    <label htmlFor="create_version_code_step">
                                         <b>Step (No.)<span className='text-danger'>*</span></b>
                                    </label>

                                    <input
                                    type="number"
                                    className="form-control"
                                    id="create_version_code_step"
                                    placeholder="e.g 1"
                                    name="step"
                                    value={values.step}
                                    onChange={(event)=>this.handleChange(event)}
                                    onBlur={handleBlur}
                                    required
                                    />
                                    <div className="valid-feedback"></div>
                                    <div className="invalid-feedback">
                                    Step (No.) is required
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
                                        className={`btn btn-${utils.isValid(this.createVersionCodeSchema, this.state.createVersionCodeForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
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
                        <Button  variant="secondary_custom" className="ripple m-1 text-capitalize" onClick={ ()=>{ this.toggleModal('create')} }><i className='i-Add'></i> Create Versioning</Button>
                    </div>
                  ) : null
                }



                <div className="breadcrumb">
                    <h1>Versioning</h1>
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
                                <h4 className="card-title mb-3">Versioning</h4>
                                <p>List of possible budget cycle versions.</p>

                            {/* <div style={{"maxHeight":"500px", "overflowY":"scroll"}}> */}

                            <div className="table-responsive">
                                    <table className="display table table-striped table-hover " id="zero_configuration_table" style={{"width":"100%"}}>
                                        <thead>
                                            <tr className="ul-widget6__tr--sticky-th">
                                                <th>#</th>
                                                <th>Name</th>
                                                  <th>Code</th>
                                                <th>Step</th>
                                                {/* <th>Status</th> */}
                                                <th>Date Created</th>
                                                <th>Date Updated</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {
                                          this.state.allVersionCodes.length ?  this.state.allVersionCodes.map( (versioncode, index)=>{
                                                return (
                                                    <tr key={versioncode.id} className={versioncode.temp_flash ? 'bg-success text-white':''}>
                                                        <td>
                                                            <b>{index+1}</b>.
                                                        </td>
                                                        <td>
                                                            {versioncode?.name}
                                                        </td>
                                                        <td>
                                                          <code>{versioncode?.code}</code>
                                                        </td>
                                                        <td>
                                                          <b>
                                                            {versioncode?.step}
                                                          </b>
                                                        </td>
                                                        {/* <td>
                                                        <Form>

                                                             <Form.Check
                                                                    checked={versioncode.status}
                                                                    type="switch"
                                                                    id={`custom-switch${versioncode.id}`}
                                                                    label={versioncode.status ? 'Enabled' : 'Disabled'}
                                                                    className={versioncode.status ? 'text-success' : 'text-danger'}
                                                                    onChange={()=> this.toggleVersionCode(versioncode)}
                                                                />


                                                            </Form>
                                                        </td> */}
                                                        <td>
                                                        {utils.formatDate(versioncode.created_at)}
                                                        </td>
                                                        <td>
                                                        {utils.formatDate(versioncode.updated_at)}
                                                        </td>

                                                        <td>
                                                        <Dropdown key={versioncode.id}>
                                                            <Dropdown.Toggle variant='secondary_custom' className="mr-3 mb-3" size="sm">
                                                            Manage
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu>

                                                              {
                                                                CAN_EDIT ? (
                                                                  <Dropdown.Item onClick={()=> {
                                                                      this.editVersionCode(versioncode);
                                                                  }} className='border-bottomx'>
                                                                      <i className="nav-icon i-Pen-2 text-success font-weight-bold"> </i> Edit
                                                                  </Dropdown.Item>
                                                                ) : null
                                                              }

                                                            {/*  <Dropdown.Item className='text-danger' onClick={
                                                                ()=>{this.deleteVersionCode(versioncode);}
                                                            }>
                                                                <i className="i-Close-Window"> </i> Delete
                                                            </Dropdown.Item>  */}
                                                            </Dropdown.Menu>
                                                        </Dropdown>

                                                        </td>

                                                    </tr>
                                                )


                                            }) :
                                            (
                                                <tr>
                                                    <td className='text-center' colSpan='7'>
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
                                                <th>Step</th>
                                                {/* <th>Status</th> */}
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

createVersionCodeSchema = yup.object().shape({
        name: yup.string().required("Vaersion name is required"),
        code: yup.string().required("Code is required"),
        step: yup.string().required("Step is required"),
      });


updateVersionCodeSchema = yup.object().shape({
    name: yup.string().required("Version name is required"),
    code: yup.string().required("Code is required"),
    step: yup.string().required("Step is required"),
        });

}




export default VersionCodesComponent
