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
import { FaCog } from "react-icons/fa";


import LaddaButton, {
    XL,
    EXPAND_LEFT,
    EXPAND_RIGHT,
    EXPAND_UP,

    CONTRACT,
  } from "react-ladda";

export class TasksComponent extends Component{

    state = {
        editedIndex:0,
        allTasks:[],
        showEditModal:false,
        showCreateModal:false,
        isSaving:false,
        isFetching:true,
        saveMsg:'Save',
        updateMsg:'Update',
        editedTask: {},
        createTaskForm: {
            name: "",
            description: "",
          },
          updateTaskForm: {
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
         this.getAllTasks()
    }

    /**
     *
     * @param {*} event
     * @param {*} errors
     * @param {*} form
     */

    handleChange = (event, form='create') => {
        const {createTaskForm, updateTaskForm} = this.state
        if(form=='create'){
            createTaskForm[event.target.name] = event.target.value;
        }else if(form=='edit'){
            updateTaskForm[event.target.name] = event.target.value;
        }
        this.setState({ createTaskForm, updateTaskForm });
    }





    /**
     * This method lists all tasks
     */
     getAllTasks = async ()=>{
         let isFetching = false;

        this.appMainService.getAllTasks().then(
            (tasksResponse)=>{
                const allTasks = tasksResponse;
                this.setState({ allTasks, isFetching })
                console.log('Tasks response', tasksResponse)
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
     * This method creates a new task
     */
    generateSystemTasks = async ()=>{
        let { allTasks} = this.state;
        let isSaving = true;
        let saveMsg = 'generating';
        this.setState({isSaving, saveMsg})
        this.appMainService.generateSystemTasks().then(
            (taskData)=>{
                isSaving = false;
                saveMsg = 'Save';
                allTasks = taskData;
                this.setState({ allTasks, isSaving, saveMsg })
                const successNotification = {
                    type:'success',
                    msg:`System tasks successfully generated!`
                }
                new AppNotification(successNotification)
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

    buildPermissions = (taskViews, isRecursive = false) =>{

      const views = !isRecursive ? JSON.parse(taskViews) : taskViews;
      const viewKeys = Object.keys(views);
    return viewKeys.length ?   viewKeys.map((view)=>{
        const actions = views[view];
        const actions_is_array = actions instanceof Array;
        console.log('Actions is array',actions,actions_is_array)
        if(!actions_is_array){

          return (
          <tr>
            <td colSpan='6'>
              <table>
                <thead>
                  <tr>
                    <th>
                      Module
                    </th>
                    <th className='text-center'>
                      Permissions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <td>
                    {view?.split('_')?.join(' ')}
                  </td>
                  <td >
                    <table>
                      <thead>
                        <tr>
                          <th colSpan='2'>
                            View
                          </th>
                          <th colSpan='4'>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.buildPermissions(actions, isRecursive = true)}
                      </tbody>

                    </table>

                  </td>
                </tbody>
              </table>
            </td>
          </tr>
          )



        }

        return (
          <tr key={view}>
            <td colSpan='2'>
              <code>
                <b>
                  {view?.split('_')?.join(' ')}

                </b>
              </code>

            </td>
            <td colSpan='4'>
              {
                actions.map((action)=>{
                  return (
                    <span className="badge badge-secondary_custom mr-1" key={action}>
                      {action?.split('_')?.join(' ')}
                    </span>
                  )
                })
              }
            </td>

          </tr>
        )

      }) : (
        <tr>
            <td colSpan='6' className='text-center'>No persmissions configured</td>
        </tr>
      )


      console.log("views", views)
    }


    /**
     * This method updates a new task
     */
    updateTask = async ()=>{



        let {updateTaskForm, allTasks, editedTask} = this.state;
        let isSaving = true;
        let updateMsg = 'Updating';
        this.setState({isSaving, updateMsg})
        this.appMainService.updateTask(updateTaskForm, editedTask.id).then(
            (updatedTask)=>{
                updatedTask.temp_flash = true
                isSaving = false;
                updateMsg = 'Update';
                allTasks.splice(this.state.editedIndex, 1, updatedTask)
                this.setState({ allTasks, isSaving, updateMsg })
                const successNotification = {
                    type:'success',
                    msg:`${updatedTask.name} successfully updated!`
                }
                new AppNotification(successNotification)
                this.toggleModal('edit');

             setTimeout(()=>{
                    updatedTask.temp_flash = false
                    allTasks.splice(this.state.editedIndex, 1, updatedTask)
                    this.setState({ allTasks, isSaving, updateMsg })
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
     * This method sets the task to be edited
     *  and opens the modal for edit
     *
     */
    editTask = (editedTask) => {
        const updateTaskForm = {...editedTask}
        const editedIndex = this.state.allTasks.findIndex(task => editedTask.id == task.id)
        this.setState({editedTask, editedIndex, updateTaskForm});
        this.toggleModal('edit')
    }


    /**
     *
     * @param {*} task
     * This method toggles a task's status
     */
    toggleTask = (task)=>{
        const toggleMsg = task.status? "Disable":"Enable";
        const gL = task.status? "lose":"gain"


        swal.fire({
            title: `<small>${toggleMsg}&nbsp;<b>${task.name}</b>?</small>`,
            text: `${task.name} members will ${gL} permissions.`,
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
                let { allTasks } = this.state
                const toggleIndex = allTasks.findIndex(r => r.id == task.id)
                // task.status = !task.status;

              this.appMainService.toggleTask(task).then(
                (toggledTask)=>{
                    allTasks.splice(toggleIndex, 1, toggledTask)
                    this.setState({ allTasks })
                    const successNotification = {
                        type:'success',
                        msg:`${toggledTask.name} successfully ${toggleMsg}d!`
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
     * @param {*} task
     * This method deletes a task
     *
     */
    deleteTask = (task)=>{
         swal.fire({
                title: `<small>Delete&nbsp;<b>${task.name}</b>?</small>`,
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
                let { allTasks } = this.state
                  this.appMainService.deleteTask(task).then(
                    (deletedTask)=>{
                        allTasks = allTasks.filter(r=> r.id !== task.id)
                        this.setState({ allTasks })
                        const successNotification = {
                            type:'success',
                            msg:`${task.name} successfully deleted!`
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
        const createTaskForm = {
            name: "",
            description: "",
          }
          this.setState({createTaskForm})

    }

    render(){

        return (

            <>
                <div className="specific">

                <Modal show={this.state.showEditModal} onHide={
                    ()=>{ this.toggleModal('edit')}
                    } {...this.props} id='edit_modal'>
                    <Modal.Header closeButton>
                    <Modal.Title>Update {this.state.editedTask.name}</Modal.Title>
                    </Modal.Header>

                    <Formik
                    initialValues={this.state.updateTaskForm}
                    validationSchema={this.updateTaskSchema}
                    onSubmit={this.updateTask}
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
                                    <label htmlFor="task_name">
                                        <b>Name<span className='text-danger'>*</span></b>
                                    </label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    id="task_name"
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
                                    <label htmlFor="update_task_description">
                                         <b>Description<span className='text-danger'>*</span></b>
                                    </label>

                                    <textarea className="form-control"
                                    id="update_task_description"  onChange={(event)=>this.handleChange(event,'edit')}
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
                                        className={`btn btn-${utils.isValid(this.updateTaskSchema, this.state.updateTaskForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
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
                    <Modal.Title>Create Task</Modal.Title>
                    </Modal.Header>

                    <Formik
                    initialValues={this.state.createTaskForm}
                    validationSchema={this.createTaskSchema}
                    onSubmit={this.createTask}
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
                                    <label htmlFor="task_name">
                                        <b>Name<span className='text-danger'>*</span></b>
                                    </label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    id="task_name"
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
                                    <label htmlFor="create_task_description">
                                         <b>Description<span className='text-danger'>*</span></b>
                                    </label>

                                    <textarea className="form-control"
                                    id="create_task_description"  onChange={(event)=>this.handleChange(event)}
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
                                        className={`btn btn-${utils.isValid(this.createTaskSchema, this.state.createTaskForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
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
                  this.state?.allTasks?.length || this.state?.isFetching ? (
                    null
                  ):(

                    <div className='float-right'>
                        <Button disabled={this.state.isSaving}  variant="secondary_custom" className="ripple m-1 text-capitalize" onClick={this.generateSystemTasks}><FaCog className={this.state.isSaving ? 'spinner':''}/> Generate System Tasks</Button>
                    </div>

                  )
                }


                <div className="breadcrumb">
                    <h1>System Tasks</h1>
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
                                <h4 className="card-title mb-3">System Tasks</h4>
                              <p>List of system tasks.</p>

                            {/* <div style={{"maxHeight":"500px", "overflowY":"scroll"}}> */}

                            <div className="table-responsive">
                                    <table className="display table  " id="zero_configuration_table" style={{"width":"100%"}}>
                                        <thead>
                                            <tr className="ul-widget6__tr--sticky-th">
                                              <th>#</th>
                                              <th>Module</th>
                                              <th colSpan='3' className='text-center'>Permisions</th>
                                                {/* <th>Status</th> */}
                                                <th>Date Created</th>
                                                <th>Date Updated</th>
                                                {/* <th>Action</th> */}
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {
                                          this.state.allTasks.length ?  this.state.allTasks.map( (task, index)=>{
                                                return (
                                                    <tr key={task.id} className={task.temp_flash ? 'bg-success text-white':''}>
                                                        <td>
                                                            <b>{index+1}</b>.
                                                        </td>
                                                        <td>
                                                            {task.name}
                                                        </td>
                                                        <td colSpan='3'>

                                                          <table className='table table-striped table-hover'>
                                                            <thead>
                                                              <tr>
                                                                <th colSpan='2' className='text-centerx'>
                                                                  View
                                                                </th>
                                                                <th colSpan='4' className='text-centerx'>
                                                                  Actions
                                                                </th>
                                                              </tr>
                                                            </thead>

                                                            <tbody>


                                                              {this.buildPermissions(task.views)}



                                                            </tbody>

                                                          </table>

                                                        </td>
                                                        {/* <td>
                                                        <Form>

                                                             <Form.Check
                                                                    checked={task.status}
                                                                    type="switch"
                                                                    id={`custom-switch${task.id}`}
                                                                    label={task.status ? 'Enabled' : 'Disabled'}
                                                                    className={task.status ? 'text-success' : 'text-danger'}
                                                                    onChange={()=> this.toggleTask(task)}
                                                                />


                                                            </Form>
                                                        </td> */}
                                                        <td>
                                                        {utils.formatDate(task.created_at)}
                                                        </td>
                                                        <td>
                                                        {utils.formatDate(task.updated_at)}
                                                        </td>
{/*
                                                        <td>
                                                        <Dropdown key={task.id}>
                                                            <Dropdown.Toggle variant='secondary_custom' className="mr-3 mb-3" size="sm">
                                                            Manage
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu>
                                                            <Dropdown.Item onClick={()=> {
                                                                this.editTask(task);
                                                            }} className='border-bottom'>
                                                                <i className="nav-icon i-Pen-2 text-success font-weight-bold"> </i> Edit
                                                            </Dropdown.Item>
                                                            <Dropdown.Item className='text-danger' onClick={
                                                                ()=>{this.deleteTask(task);}
                                                            }>
                                                                <i className="i-Close-Window"> </i> Delete
                                                            </Dropdown.Item>
                                                            <Dropdown.Item>
                                                                <i className="i-Money-Bag"> </i> Something else here
                                                            </Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown>

                                                        </td> */}

                                                    </tr>
                                                )


                                            }) :
                                            (
                                                <tr>
                                                    <td className='text-center' colSpan='7'>
                                                    <FetchingRecords isFetching={this.state.isFetching} emptyMsg='System tasks have not been generated.'/>
                                                    </td>
                                                </tr>
                                            )
                                        }

                                        </tbody>
                                        <tfoot>
                                            <tr>
                                              <th>#</th>
                                            <th>Module</th>
                                          <th colSpan='3' className='text-center'>Permisions</th>
                                              {/* <th>Status</th> */}
                                              <th>Date Created</th>
                                              <th>Date Updated</th>
                                              {/* <th>Action</th> */}
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

createTaskSchema = yup.object().shape({
        name: yup.string().required("Name is required"),
        description: yup.string().required("Description is required"),
      });


updateTaskSchema = yup.object().shape({
        name: yup.string().required("Name is required"),
        description: yup.string().required("Description is required"),
        });

}




export default TasksComponent
