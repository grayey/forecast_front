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

  
import LaddaButton, {
    XL,
    EXPAND_LEFT,
    EXPAND_RIGHT,
    EXPAND_UP,

    CONTRACT,
  } from "react-ladda";

export class RolesComponent extends Component{

    state = {
        editedIndex:0,
        allRoles:[],
        showEditModal:false,
        showCreateModal:false,
        isSaving:false,
        isFetching:true,
        saveMsg:'Save',
        updateMsg:'Update',
        editedRole: {},
        createRoleForm: {
            name: "",
            description: "",
          },
          updateRoleForm: {
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
         this.getAllRoles()
    }

    /**
     * 
     * @param {*} event 
     * @param {*} errors 
     * @param {*} form 
     */

    handleChange = (event, form='create') => {
        const {createRoleForm, updateRoleForm} = this.state
        if(form=='create'){
            createRoleForm[event.target.name] = event.target.value;
        }else if(form=='edit'){
            updateRoleForm[event.target.name] = event.target.value;
        }
        this.setState({ createRoleForm, updateRoleForm });
    }

    



    /**
     * This method lists all roles
     */
     getAllRoles = async ()=>{
         let isFetching = false;

        this.appMainService.getAllRoles().then(
            (rolesResponse)=>{
                const allRoles = rolesResponse;
                this.setState({ allRoles, isFetching })
                console.log('Roles response', rolesResponse)
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
     * This method creates a new role
     */
    createRole = async ()=>{
        const {createRoleForm, allRoles} = this.state; 
        let isSaving = true;
        let saveMsg = 'Saving';
        this.setState({isSaving, saveMsg})
        this.appMainService.createRole(createRoleForm).then(
            (roleData)=>{
                isSaving = false;
                saveMsg = 'Save';
                allRoles.unshift(roleData)
                this.setState({ allRoles, isSaving, saveMsg })
                const successNotification = {
                    type:'success',
                    msg:`${roleData.name} successfully created!`
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
     * This method updates a new role
     */
    updateRole = async ()=>{

        

        let {updateRoleForm, allRoles, editedRole} = this.state; 
        let isSaving = true;
        let updateMsg = 'Updating';
        this.setState({isSaving, updateMsg})
        this.appMainService.updateRole(updateRoleForm, editedRole.id).then(
            (updatedRole)=>{
                updatedRole.temp_flash = true
                isSaving = false;
                updateMsg = 'Update';
                allRoles.splice(this.state.editedIndex, 1, updatedRole)
                this.setState({ allRoles, isSaving, updateMsg })
                const successNotification = {
                    type:'success',
                    msg:`${updatedRole.name} successfully updated!`
                }
                new AppNotification(successNotification)
                this.toggleModal('edit');

             setTimeout(()=>{
                    updatedRole.temp_flash = false
                    allRoles.splice(this.state.editedIndex, 1, updatedRole)
                    this.setState({ allRoles, isSaving, updateMsg })
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
     * This method sets the role to be edited
     *  and opens the modal for edit
     * 
     */
    editRole = (editedRole) => {
        const updateRoleForm = {...editedRole}
        const editedIndex = this.state.allRoles.findIndex(role => editedRole.id == role.id)
        this.setState({editedRole, editedIndex, updateRoleForm});
        this.toggleModal('edit')
    }


    /**
     * 
     * @param {*} role
     * This method toggles a role's status 
     */
    toggleRole = (role)=>{
        const toggleMsg = role.status? "Disable":"Enable";
        const gL = role.status? "lose":"gain"
       

        swal.fire({
            title: `<small>${toggleMsg}&nbsp;<b>${role.name}</b>?</small>`,
            text: `${role.name} members will ${gL} permissions.`,
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
                let { allRoles } = this.state
                const toggleIndex = allRoles.findIndex(r => r.id == role.id)
                // role.status = !role.status;

              this.appMainService.toggleRole(role).then(
                (toggledRole)=>{
                    allRoles.splice(toggleIndex, 1, toggledRole)
                    this.setState({ allRoles })
                    const successNotification = {
                        type:'success',
                        msg:`${toggledRole.name} successfully ${toggleMsg}d!`
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
     * @param {*} role 
     * This method deletes a role
     * 
     */
    deleteRole = (role)=>{
         swal.fire({
                title: `<small>Delete&nbsp;<b>${role.name}</b>?</small>`,
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
                let { allRoles } = this.state
                  this.appMainService.deleteRole(role).then(
                    (deletedRole)=>{
                        allRoles = allRoles.filter(r=> r.id !== role.id)
                        this.setState({ allRoles })
                        const successNotification = {
                            type:'success',
                            msg:`${role.name} successfully deleted!`
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
        const createRoleForm = {
            name: "",
            description: "",
          }
          this.setState({createRoleForm})

    }

    render(){
        
        return (

            <>
                <div className="specific">
        
                <Modal show={this.state.showEditModal} onHide={
                    ()=>{ this.toggleModal('edit')}
                    } {...this.props} id='edit_modal'>
                    <Modal.Header closeButton>
                    <Modal.Title>Update {this.state.editedRole.name}</Modal.Title>
                    </Modal.Header>
                  
                    <Formik
                    initialValues={this.state.updateRoleForm}
                    validationSchema={this.updateRoleSchema}
                    onSubmit={this.updateRole}
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
                                    <label htmlFor="role_name">
                                        <b>Name<span className='text-danger'>*</span></b>
                                    </label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    id="role_name"
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
                                    <label htmlFor="update_role_description">
                                         <b>Description<span className='text-danger'>*</span></b>
                                    </label>

                                    <textarea className="form-control"
                                    id="update_role_description"  onChange={(event)=>this.handleChange(event,'edit')}
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
                                        className={`btn btn-${utils.isValid(this.updateRoleSchema, this.state.updateRoleForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
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
                    <Modal.Title>Create Role</Modal.Title>
                    </Modal.Header>

                    <Formik
                    initialValues={this.state.createRoleForm}
                    validationSchema={this.createRoleSchema}
                    onSubmit={this.createRole}
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
                                    <label htmlFor="role_name">
                                        <b>Name<span className='text-danger'>*</span></b>
                                    </label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    id="role_name"
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
                                    <label htmlFor="create_role_description">
                                         <b>Description<span className='text-danger'>*</span></b>
                                    </label>

                                    <textarea className="form-control"
                                    id="create_role_description"  onChange={(event)=>this.handleChange(event)}
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
                                        className={`btn btn-${utils.isValid(this.createRoleSchema, this.state.createRoleForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
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
                    <Button  variant="secondary_custom" className="ripple m-1 text-capitalize" onClick={ ()=>{ this.toggleModal('create')} }><i className='i-Add'></i> Create Role</Button>
                </div>
        
                <div className="breadcrumb">
                    <h1>Roles</h1>
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
                                <h4 className="card-title mb-3">Roles</h4>
                                <p>List of roles.</p>
                            
                            {/* <div style={{"maxHeight":"500px", "overflowY":"scroll"}}> */}

                            <div className="table-responsive">
                                    <table className="display table table-striped table-hover " id="zero_configuration_table" style={{"width":"100%"}}>
                                        <thead>
                                            <tr className="ul-widget6__tr--sticky-th">
                                                <th>#</th>
                                                <th>Name</th>
                                                <th>Description</th>
                                                <th>Status</th>
                                                <th>Date Created</th>
                                                <th>Date Updated</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {
                                          this.state.allRoles.length ?  this.state.allRoles.map( (role, index)=>{
                                                return (
                                                    <tr key={role.id} className={role.temp_flash ? 'bg-success text-white':''}>
                                                        <td>
                                                            <b>{index+1}</b>.
                                                        </td>
                                                        <td>
                                                            {role.name}
                                                        </td>
                                                        <td>
                                                        {role.description}
                                                        </td>
                                                        <td>
                                                        <Form>

                                                             <Form.Check
                                                                    checked={role.status}
                                                                    type="switch"
                                                                    id={`custom-switch${role.id}`}
                                                                    label={role.status ? 'Enabled' : 'Disabled'}
                                                                    className={role.status ? 'text-success' : 'text-danger'}
                                                                    onChange={()=> this.toggleRole(role)} 
                                                                />
                                                               

                                                            </Form> 
                                                        </td>
                                                        <td>
                                                        {utils.formatDate(role.created_at)}
                                                        </td>
                                                        <td>
                                                        {utils.formatDate(role.updated_at)}
                                                        </td>
                                                        
                                                        <td>
                                                        <Dropdown key={role.id}>
                                                            <Dropdown.Toggle variant='secondary_custom' className="mr-3 mb-3" size="sm"> 
                                                            Manage
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu>
                                                            <Dropdown.Item onClick={()=> {
                                                                this.editRole(role);
                                                            }} className='border-bottom'>
                                                                <i className="nav-icon i-Pen-2 text-success font-weight-bold"> </i> Edit
                                                            </Dropdown.Item>
                                                            <Dropdown.Item className='text-danger' onClick={
                                                                ()=>{this.deleteRole(role);}
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
                                                <th>Description</th>
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

createRoleSchema = yup.object().shape({
        name: yup.string().required("Name is required"),
        description: yup.string().required("Description is required"),
      });


updateRoleSchema = yup.object().shape({
        name: yup.string().required("Name is required"),
        description: yup.string().required("Description is required"),
        });

}




export default RolesComponent


