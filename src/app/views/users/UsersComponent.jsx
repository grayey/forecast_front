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
import { FaArrowDown } from "react-icons/fa";


import LaddaButton, {
    XL,
    EXPAND_LEFT,
    EXPAND_RIGHT,
    EXPAND_UP,

    CONTRACT,
  } from "react-ladda";

export class UsersComponent extends Component{

    state = {
        editedIndex:0,
        allUsers:[],
        allRoles:[],
        allDepartments:[],
        allRolesCopy:[],
        allDepartmentsCopy:[],
        departmentRoles:[],
        addDepartmentRoleForm:{
          role_id:"",
          department_id:"",
        },
        showEditModal:false,
        showCreateModal:false,
        isSaving:false,
        isFetching:true,
        saveMsg:'Save',
        updateMsg:'Update',
        editedUser: {},
        createUserForm: {
            first_name: "",
            last_name: "",
            email: "",
          },
          updateUserForm: {
            first_name: "",
            last_name: "",
            email: "",
          },

    }
    appMainService;



    constructor(props){
        super(props)
        this.appMainService = new AppMainService();
    }

    componentDidMount(){
         this.getAllUsers();
         this.getAllDepartments();
         this.getAllRoles();
    }

    /**
     *
     * @param {*} event
     * @param {*} errors
     * @param {*} form
     */

    handleChange = (event, form='create') => {
        const {createUserForm, updateUserForm} = this.state
        if(form=='create'){
            createUserForm[event.target.name] = event.target.value;
        }else if(form=='edit'){
            updateUserForm[event.target.name] = event.target.value;
        }
        this.setState({ createUserForm, updateUserForm });
    }

    handleDepartmentRoleChange =  (event, form='create') => {

      const { addDepartmentRoleForm } = this.state;
      addDepartmentRoleForm[event.target.name] = event.target.value;
      this.setState({ addDepartmentRoleForm });
    }




    /**
     * This method lists all users
     */
     getAllUsers = async ()=>{
         let isFetching = false;

        this.appMainService.getAllUsers().then(
            (usersResponse)=>{
                const allUsers = usersResponse;
                this.setState({ allUsers, isFetching })
                console.log('Users response', usersResponse)
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
     * This method lists all roles
     */
     getAllRoles = async ()=>{

        this.appMainService.getAllRoles().then(
            (rolesResponse)=>{
                const allRoles = rolesResponse;
                const allRolesCopy = [...allRoles];
                this.setState({ allRoles, allRolesCopy })
                console.log('Roles response', rolesResponse)
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
     * This method lists all departments
     */
     getAllDepartments = async ()=>{

      this.appMainService.getAllDepartments().then(
            (departmentsResponse)=>{
                const allDepartments = departmentsResponse;
                const allDepartmentsCopy = [...allDepartments];

                this.setState({ allDepartments, allDepartmentsCopy })
                console.log('Departments response', departmentsResponse)
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
     * This method creates a new user
     */
    createUser = async ()=>{
        let {isSaving, saveMsg, createUserForm, allUsers, departmentRoles } = this.state;
         isSaving = true;
         saveMsg = 'Saving';
        const department_roles = departmentRoles.map((dr)=>{
          const {role, department } = dr;
          return {
            role_id:role.id,
            department_id:department.id
          }
        });
        this.setState({isSaving, saveMsg})
        const user_data = {
          ...createUserForm,
          department_roles
        }
        this.appMainService.createUser(user_data).then(
            (userData)=>{
                isSaving = false;
                saveMsg = 'Save';
                allUsers.unshift(userData)
                departmentRoles = [];
                this.setState({ allUsers, isSaving, saveMsg, departmentRoles })
                const successNotification = {
                    type:'success',
                    msg:`${createUserForm.first_name} successfully created!`
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
                console.log("ERROR", error)
                new AppNotification(errorNotification)
        })
    }


    /**
     * This method updates a new user
     */
    updateUser = async ()=>{



        let {updateUserForm, allUsers, editedUser} = this.state;
        let isSaving = true;
        let updateMsg = 'Updating';
        this.setState({isSaving, updateMsg})
        this.appMainService.updateUser(updateUserForm, editedUser.id).then(
            (updatedUser)=>{
                updatedUser.temp_flash = true
                isSaving = false;
                updateMsg = 'Update';
                allUsers.splice(this.state.editedIndex, 1, updatedUser)
                this.setState({ allUsers, isSaving, updateMsg })
                const successNotification = {
                    type:'success',
                    msg:`${updatedUser.name} successfully updated!`
                }
                new AppNotification(successNotification)
                this.toggleModal('edit');

             setTimeout(()=>{
                    updatedUser.temp_flash = false
                    allUsers.splice(this.state.editedIndex, 1, updatedUser)
                    this.setState({ allUsers, isSaving, updateMsg })
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
     * This method sets the user to be edited
     *  and opens the modal for edit
     *
     */
    editUser = (editedUser) => {
        const updateUserForm = {...editedUser}
        const editedIndex = this.state.allUsers.findIndex(user => editedUser.id == user.id)
        this.setState({editedUser, editedIndex, updateUserForm});
        this.toggleModal('edit')
    }

    addDepartmentRoles = () =>{
      let { addDepartmentRoleForm, allRolesCopy, allDepartmentsCopy, departmentRoles } = this.state;
      const role_index = allRolesCopy.findIndex(r => r.id == addDepartmentRoleForm.role_id);
      const department_index = allDepartmentsCopy.findIndex(d => d.id == addDepartmentRoleForm.department_id);
      const role = allRolesCopy[role_index];
      const department = allDepartmentsCopy[department_index];
      departmentRoles.unshift({ role, department });
      // allRolesCopy.splice(role_index, 1); # A user can have the same role in different departments so don't remove roles
      allDepartmentsCopy.splice(department_index, 1);
      addDepartmentRoleForm = {
        department_id:"",
        role_id:""
      };
      this.setState({ departmentRoles, addDepartmentRoleForm, allDepartmentsCopy, allRolesCopy });
    }


    /**
     *
     * @param {*} user
     * This method toggles a user's status
     */
    toggleUser = (user)=>{
        const toggleMsg = user.status? "Disable":"Enable";
        const gL = user.status? "lose":"gain"


        swal.fire({
            title: `<small>${toggleMsg}&nbsp;<b>${user.name}</b>?</small>`,
            text: `${user.name} members will ${gL} permissions.`,
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
                let { allUsers } = this.state
                const toggleIndex = allUsers.findIndex(r => r.id == user.id)
                // user.status = !user.status;

              this.appMainService.toggleUser(user).then(
                (toggledUser)=>{
                    allUsers.splice(toggleIndex, 1, toggledUser)
                    this.setState({ allUsers })
                    const successNotification = {
                        type:'success',
                        msg:`${toggledUser.name} successfully ${toggleMsg}d!`
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

    deletedepartmentRole = (index)=>{
      const { departmentRoles, allDepartmentsCopy, allRolesCopy } = this.state;
      const departmentRole = departmentRoles[index];
      const { role, department } = departmentRole;
      // allRolesCopy.unshift(role);
      allDepartmentsCopy.unshift(department);
      departmentRoles.splice(index, 1);
      this.setState({ departmentRoles, allDepartmentsCopy, allRolesCopy });

    }

    /**
     *
     * @param {*} user
     * This method deletes a user
     *
     */
    deleteUser = (user)=>{
         swal.fire({
                title: `<small>Delete&nbsp;<b>${user.name}</b>?</small>`,
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
                let { allUsers } = this.state
                  this.appMainService.deleteUser(user).then(
                    (deletedUser)=>{
                        allUsers = allUsers.filter(r=> r.id !== user.id)
                        this.setState({ allUsers })
                        const successNotification = {
                            type:'success',
                            msg:`${user.name} successfully deleted!`
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
        const createUserForm = {
          first_name: "",
          last_name: "",
          email: "",
          }
          this.setState({createUserForm})

    }

    render(){

        return (

            <>
                <div className="specific">

                <Modal show={this.state.showEditModal} onHide={
                    ()=>{ this.toggleModal('edit')}
                    } {...this.props} id='edit_modal'>
                    <Modal.Header closeButton>
                    <Modal.Title>Update {this.state.editedUser.name}</Modal.Title>
                    </Modal.Header>

                    <Formik
                    initialValues={this.state.updateUserForm}
                    validationSchema={this.updateUserSchema}
                    onSubmit={this.updateUser}
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
                                    <label htmlFor="user_name">
                                        <b>Name<span className='text-danger'>*</span></b>
                                    </label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    id="user_name"
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
                                    <label htmlFor="update_user_description">
                                         <b>Description<span className='text-danger'>*</span></b>
                                    </label>

                                    <textarea className="form-control"
                                    id="update_user_description"  onChange={(event)=>this.handleChange(event,'edit')}
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
                                        className={`btn btn-${utils.isValid(this.updateUserSchema, this.state.updateUserForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
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
                    <Modal.Title>Create User</Modal.Title>
                    </Modal.Header>

                    <Formik
                    initialValues={this.state.createUserForm}
                    validationSchema={this.createUserSchema}
                    onSubmit={this.createUser}
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
                                        !errors.first_name && touched.first_name,
                                    "invalid-field":
                                        errors.first_name && touched.first_name
                                    })}
                                >
                                    <label htmlFor="first_name">
                                        <b>First Name<span className='text-danger'>*</span></b>
                                    </label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    id="first_name"
                                    placeholder=""
                                    name="first_name"
                                    value={values.first_name}
                                    onChange={(event)=>this.handleChange(event)}
                                    onBlur={handleBlur}
                                    required
                                    />
                                    <div className="valid-feedback"></div>
                                    <div className="invalid-feedback">
                                    First name is required
                                    </div>
                                </div>
                                <div
                                    className={utils.classList({
                                    "col-md-6 mb-2": true,
                                    "valid-field":
                                        touched.last_name && !errors.last_name,
                                    "invalid-field":
                                        touched.last_name && errors.last_name
                                    })}
                                >
                                    <label htmlFor="last_name">
                                         <b>Last Name<span className='text-danger'>*</span></b>
                                    </label>

                                    <input
                                    type="text"
                                    className="form-control"
                                    id="last_name"
                                    placeholder=""
                                    name="last_name"
                                    value={values.last_name}
                                    onChange={(event)=>this.handleChange(event)}
                                    onBlur={handleBlur}
                                    required
                                    />
                                    <div className="valid-feedback"></div>
                                    <div className="invalid-feedback">
                                    Last name is required
                                    </div>
                                </div>

                                <div
                                    className={utils.classList({
                                    "col-md-12 mb-2": true,
                                    "valid-field":
                                        touched.email && !errors.email,
                                    "invalid-field":
                                        touched.email && errors.email
                                    })}
                                >
                                    <label htmlFor="email">
                                         <b>Email<span className='text-danger'>*</span></b>
                                    </label>

                                    <input
                                    type="text"
                                    className="form-control"
                                    id="email"
                                    placeholder=""
                                    name="email"
                                    value={values.email}
                                    onChange={(event)=>this.handleChange(event)}
                                    onBlur={handleBlur}
                                    required
                                    />
                                    <div className="valid-feedback"></div>
                                    <div className="invalid-feedback">
                                    Email is required
                                    </div>
                                </div>

                                <div className="col-md-12 ">
                                  <div className="card-header border-bottom">
                                    <h4 className="text-center">Assign department & role</h4>
                                  </div>
                                  <div className="card-body">
                                    <div className="form-row pb-2">
                                      <div className="col-md-5">
                                        <label>Department</label>
                                      <select className="form-control" name="department_id"
                                        value={this.state.addDepartmentRoleForm.department_id}
                                        onChange={this.handleDepartmentRoleChange}
                                        >
                                          <option>Select</option>
                                          {
                                            this.state.allDepartmentsCopy.map((department)=>{
                                              return (<option key={department.id} value={department.id}>{department?.name}</option>)

                                            })
                                          }
                                        </select>
                                      </div>
                                      <div className="col-md-5">
                                        <label>Role</label>
                                      <select className="form-control" name="role_id"
                                        value={this.state.addDepartmentRoleForm.role_id}
                                        onChange={this.handleDepartmentRoleChange}>
                                        <option>Select</option>
                                      {
                                        this.state.allRolesCopy.map((role)=>{
                                      return  (<option key={role.id} value={role.id}>{role?.name}</option>)

                                        })
                                      }

                                      </select>

                                      </div>
                                    <div className="col-md-2 mt-2">
                                      <button type="button" className="btn float-right mt-4 btn-sm btn-primary" onClick={this.addDepartmentRoles}>Add <FaArrowDown/></button>
                                    </div>
                                    </div>
                                    <div className="form-row">
                                      <table className="table table-hover table-striped">
                                        <thead>
                                          <tr>
                                            <th>Department</th>
                                            <th>Role</th>
                                            <th>Action</th>
                                          </tr>
                                        </thead>
                                        <tbody>


                                          {
                                            this.state.departmentRoles.length ? (
                                              this.state.departmentRoles.map((dR, index)=>{

                                                return(
                                                  <tr key={index}>
                                                    <td>{dR?.department?.name} </td>
                                                    <td>{dR?.role?.name} </td>
                                                    <td>
                                                      <span className="cursor-pointer text-danger mr-2" onClick={()=>{
                                                          this.deletedepartmentRole(index)}
                                                        }>
                                                        <i className="nav-icon i-Close-Window font-weight-bold"></i>
                                                      </span>
                                                    </td>
                                                  </tr>
                                                )

                                              })
                                            ) : (
                                              <tr>
                                                <td colSpan="3" className="text-center"> No department | roles assigned </td>
                                              </tr>
                                            )
                                          }




                                        </tbody>

                                      </table>

                                    </div>
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
                                        className={`btn btn-${utils.isValid(this.createUserSchema, this.state.createUserForm) && this.state.departmentRoles.length > 0
                                           ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
                                        loading={this.state.isSaving}
                                        progress={0.5}
                                        type='submit'
                                        data-style={EXPAND_RIGHT}
                                        disabled={this.state.departmentRoles.length == 0}
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
                    <Button  variant="secondary_custom" className="ripple m-1 text-capitalize" onClick={ ()=>{ this.toggleModal('create')} }><i className='i-Add'></i> Create User</Button>
                </div>

                <div className="breadcrumb">
                    <h1>Users</h1>
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
                                <h4 className="card-title mb-3">Users</h4>
                                <p>List of users.</p>

                            {/* <div style={{"maxHeight":"500px", "overflowY":"scroll"}}> */}

                            <div className="table-responsive">
                                    <table className="display table table-striped table-hover " id="zero_configuration_table" style={{"width":"100%"}}>
                                        <thead>
                                            <tr className="ul-widget6__tr--sticky-th">
                                                <th>#</th>
                                                <th>First Name</th>
                                                <th>Last Name</th>
                                                <th>Email</th>
                                              <th>Department | Roles</th>
                                                <th>Status</th>
                                                <th>Date Created</th>
                                                <th>Date Updated</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {
                                          this.state.allUsers.length ?  this.state.allUsers.map( (userProfile, index)=>{
                                                return (
                                                    <tr key={userProfile.id} className={userProfile.temp_flash ? 'bg-success text-white':''}>
                                                        <td>
                                                            <b>{index+1}</b>.
                                                        </td>
                                                        <td>
                                                            {userProfile?.user?.first_name}
                                                        </td>
                                                        <td>
                                                        {userProfile?.user?.last_name}
                                                        </td>
                                                        <td>
                                                        {userProfile?.user?.email}
                                                        </td>
                                                        <td className="text-centerx">

                                                          <a className="underline">View</a>

                                                        </td>
                                                        <td>
                                                        <Form>

                                                             <Form.Check
                                                                    checked={userProfile.status}
                                                                    type="switch"
                                                                    id={`custom-switch${userProfile.id}`}
                                                                    label={userProfile.status ? 'Enabled' : 'Disabled'}
                                                                    className={userProfile.status ? 'text-success' : 'text-danger'}
                                                                    onChange={()=> this.toggleUser(userProfile)}
                                                                />


                                                            </Form>
                                                        </td>
                                                        <td>
                                                        {utils.formatDate(userProfile.created_at)}
                                                        </td>
                                                        <td>
                                                        {utils.formatDate(userProfile.updated_at)}
                                                        </td>

                                                        <td>
                                                        <Dropdown key={userProfile.id}>
                                                            <Dropdown.Toggle variant='secondary_custom' className="mr-3 mb-3" size="sm">
                                                            Manage
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu>
                                                            <Dropdown.Item onClick={()=> {
                                                                this.editUser(userProfile);
                                                            }} className='border-bottom'>
                                                                <i className="nav-icon i-Pen-2 text-success font-weight-bold"> </i> Edit
                                                            </Dropdown.Item>
                                                            <Dropdown.Item className='text-danger' onClick={
                                                                ()=>{this.deleteUser(userProfile);}
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
                                              <th>First Name</th>
                                              <th>Last Name</th>
                                              <th>Email</th>
                                              <th>Department | Roles</th>
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

createUserSchema = yup.object().shape({
        first_name: yup.string().required("First name is required"),
        last_name: yup.string().required("Last name is required"),
        email: yup.string("Invalid email").required("Email is required"),
      });


updateUserSchema = yup.object().shape({
        first_name: yup.string().required("First name is required"),
        last_name: yup.string().required("Last name is required"),
        email: yup.string("Invalid email").required("Email is required"),
        });

}




export default UsersComponent
