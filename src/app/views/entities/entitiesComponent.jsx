import React, { Component, useState, useEffect } from "react"
import { Dropdown, Row, Col, Button,Form, ButtonToolbar,Modal } from "react-bootstrap";
// import SweetAlert from "sweetalert2-react";
import swal from "sweetalert2";
import AppMainService from "../../services/appMainService";
import * as utils from "@utils";
import { Formik } from "formik";
import * as yup from "yup";
import AppNotification from "../../appNotifications";
import {FetchingRecords, BulkTemplateDownload, ErrorView} from "../../appWidgets";

import jwtAuthService  from "../../services/jwtAuthService";

import { VIEW_FORBIDDEN } from "app/appConstants";


import LaddaButton, {
    XL,
    EXPAND_LEFT,
    EXPAND_RIGHT,
    EXPAND_UP,

    CONTRACT,
  } from "react-ladda";

export class EntitiesComponent extends Component{

  userPermissions = [];
  CAN_VIEW_ALL = false;
  CAN_CREATE  = false;
  CAN_EDIT  = false;
  CAN_TOGGLE_STATUS  = false;

    state = {
        editedIndex:0,
        allEntities:[],
        showEditModal:false,
        showCreateModal:false,
        isSaving:false,
        isFetching:true,
        saveMsg:'Save',
        updateMsg:'Update',
        editedEntity: {},
        createEntityForm: {
            name: "",
          },
          updateEntityForm: {
            name: "",
          },

    }
    appMainService;



    constructor(props){
        super(props)
        this.appMainService = new AppMainService();

        const componentName = "Administration___Entry_Types";
        const componentPermissions = utils.getComponentPermissions(componentName, props.route.auth);
        this.userPermissions = utils.comparePermissions(jwtAuthService.getUserTasks(), componentPermissions);
        this.CAN_VIEW_ALL = this.userPermissions.includes(`${componentName}__CAN_VIEW_ALL`);
        this.CAN_CREATE = this.userPermissions.includes(`${componentName}__CAN_CREATE`);
        this.CAN_EDIT = this.userPermissions.includes(`${componentName}__CAN_EDIT`);
        this.CAN_TOGGLE_STATUS = this.userPermissions.includes(`${componentName}__CAN_TOGGLE_STATUS`);
    }

    componentDidMount(){
         this.getAllEntities();
    }

    /**
     *
     * @param {*} event
     * @param {*} errors
     * @param {*} form
     */

    handleChange = (event, form='create') => {
        const {createEntityForm, updateEntityForm} = this.state
        if(form=='create'){
            createEntityForm[event.target.name] = event.target.value;
        }else if(form=='edit'){
            updateEntityForm[event.target.name] = event.target.value;
        }
        this.setState({ createEntityForm, updateEntityForm });
    }







    /**
     * This method lists all entities
     */
     getAllEntities = async ()=>{
         let isFetching = false;

        this.appMainService.getAllEntities().then(
            (entitiesResponse)=>{
                const allEntities = entitiesResponse;
                this.setState({ allEntities, isFetching })
                console.log('Entities response', entitiesResponse)
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
     * This method creates a new entity
     */
    createEntity = async ()=>{
        const {createEntityForm, allEntities} = this.state;
        let isSaving = true;
        let saveMsg = 'Saving';
        this.setState({isSaving, saveMsg})
        this.appMainService.createEntity(createEntityForm).then(
            (entityData)=>{
                isSaving = false;
                saveMsg = 'Save';
                allEntities.unshift(entityData)
                this.setState({ allEntities, isSaving, saveMsg })
                const successNotification = {
                    type:'success',
                    msg:`${entityData.name} successfully created!`
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
     * This method updates a new entity
     */
    updateEntity = async ()=>{



        let {updateEntityForm, allEntities, editedEntity} = this.state;
        let isSaving = true;
        let updateMsg = 'Updating';
        this.setState({isSaving, updateMsg})
        this.appMainService.updateEntity(updateEntityForm, editedEntity.id).then(
            (updatedEntity)=>{
                updatedEntity.temp_flash = true
                isSaving = false;
                updateMsg = 'Update';
                allEntities.splice(this.state.editedIndex, 1, updatedEntity)
                this.setState({ allEntities, isSaving, updateMsg })
                const successNotification = {
                    type:'success',
                    msg:`${updatedEntity.name} successfully updated!`
                }
                new AppNotification(successNotification)
                this.toggleModal('edit');

             setTimeout(()=>{
                    updatedEntity.temp_flash = false
                    allEntities.splice(this.state.editedIndex, 1, updatedEntity)
                    this.setState({ allEntities, isSaving, updateMsg })
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
     * This method sets the entity to be edited
     *  and opens the modal for edit
     *
     */
    editEntity = (editedEntity) => {
        const updateEntityForm = {...editedEntity}
        const editedIndex = this.state.allEntities.findIndex(entity => editedEntity.id == entity.id)
        this.setState({editedEntity, editedIndex, updateEntityForm});
        this.toggleModal('edit')
    }


    /**
     *
     * @param {*} entity
     * This method toggles a entity's status
     */
    toggleEntity = (entity)=>{
        const toggleMsg = entity.status? "Disable":"Enable";
        const gL = entity.status ? "not":""


        swal.fire({
            title: `<small>${toggleMsg}&nbsp;<b>${entity.name}</b>?</small>`,
            text: `${entity.name} will ${gL} be available as an entry type during capture.`,
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
                let { allEntities } = this.state
                const toggleIndex = allEntities.findIndex(r => r.id == entity.id)
                // entity.status = !entity.status;

              this.appMainService.toggleEntity(entity).then(
                (toggledEntity)=>{
                    allEntities.splice(toggleIndex, 1, toggledEntity)
                    this.setState({ allEntities })
                    const successNotification = {
                        type:'success',
                        msg:`${toggledEntity.name} successfully ${toggleMsg}d!`
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
     * @param {*} entity
     * This method deletes a entity
     *
     */
    deleteEntity = (entity)=>{
         swal.fire({
                title: `<small>Delete&nbsp;<b>${entity.name}</b>?</small>`,
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
                let { allEntities } = this.state
                  this.appMainService.deleteEntity(entity).then(
                    (deletedEntity)=>{
                        allEntities = allEntities.filter(r=> r.id !== entity.id)
                        this.setState({ allEntities })
                        const successNotification = {
                            type:'success',
                            msg:`${entity.name} successfully deleted!`
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
        const createEntityForm = {
            name: "",
            category: "",
            code: "",
          }
          this.setState({createEntityForm})

    }

    render(){
      const { CAN_VIEW_ALL, CAN_CREATE, CAN_EDIT, CAN_TOGGLE_STATUS} = this;

        return !CAN_VIEW_ALL ? <ErrorView errorType={VIEW_FORBIDDEN} /> : (

            <>
                <div className="specific">

                <Modal show={this.state.showEditModal} onHide={ ()=>{ this.toggleModal('edit')} } {...this.props} id='edit_modal'>
                    <Modal.Header closeButton>
                    <Modal.Title>
                        <img src="/assets/images/logo.png" alt="Logo" className="modal-logo"  />&nbsp;&nbsp;
                      Update {this.state.editedEntity.name}
                    </Modal.Title>
                    </Modal.Header>

                    <Formik
                    initialValues={this.state.updateEntityForm}
                    validationSchema={this.updateEntitySchema}
                    onSubmit={this.updateEntity}
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
                                    <label htmlFor="entity_name">
                                        <b>Name<span className='text-danger'>*</span></b>
                                    </label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    id="entity_name"
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
                                        className={`btn btn-${utils.isValid(this.updateEntitySchema, this.state.updateEntityForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
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
                      Create Entry Type</Modal.Title>
                    </Modal.Header>

                    <Formik
                    initialValues={this.state.createEntityForm}
                    validationSchema={this.createEntitySchema}
                    onSubmit={this.createEntity}
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
                                    <label htmlFor="entity_name">
                                        <b>Name<span className='text-danger'>*</span></b>
                                    </label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    id="entity_name"
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
                                        className={`btn btn-${utils.isValid(this.createEntitySchema, this.state.createEntityForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
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
                        <Button  variant="secondary_custom" className="ripple m-1 text-capitalize" onClick={ ()=>{ this.toggleModal('create')} }><i className='i-Add'></i> Create entry type</Button>
                    </div>

                  ) : null
                }


                <div className="breadcrumb">
                    <h1>Entry Types</h1>
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
                                <h4 className="card-title mb-3">Entry Types</h4>
                              <p>List of entry types.</p>

                            {/* <div style={{"maxHeight":"500px", "overflowY":"scroll"}}> */}

                            <div className="table-responsive">
                                    <table className="display table table-striped table-hover " id="zero_configuration_table" style={{"width":"100%"}}>
                                        <thead>
                                            <tr className="ul-widget6__tr--sticky-th">
                                                <th>#</th>
                                                <th>Name</th>

                                                <th>Status</th>
                                                <th>Date Created</th>
                                                <th>Date Updated</th>
                                                {/* <th>Action</th> */}
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {
                                          this.state.allEntities.length ?  this.state.allEntities.map( (entity, index)=>{
                                                return (
                                                    <tr key={entity.id} className={entity.temp_flash ? 'bg-success text-white':''}>
                                                        <td>
                                                            <b>{index+1}</b>.
                                                        </td>
                                                        <td>
                                                            {entity.name}
                                                        </td>

                                                        <td>
                                                          {
                                                            CAN_TOGGLE_STATUS ? (
                                                              <Form>

                                                                   <Form.Check
                                                                          checked={entity.status}
                                                                          type="switch"
                                                                          id={`custom-switch${entity.id}`}
                                                                          label={entity.status ? 'Enabled' : 'Disabled'}
                                                                          className={entity.status ? 'text-success' : 'text-danger'}
                                                                          onChange={()=> this.toggleEntity(entity)}
                                                                      />


                                                                  </Form>
                                                            ): (
                                                              <span className={entity.status ? `badge  badge-success`: `badge  badge-danger`}>
                                                                {entity.status ? 'Enabled' : 'Disabled'}
                                                              </span>
                                                            )
                                                          }

                                                        </td>
                                                        <td>
                                                        {utils.formatDate(entity.created_at)}
                                                        </td>
                                                        <td>
                                                        {utils.formatDate(entity.updated_at)}
                                                        </td>

                                                        {/* <td>
                                                        <Dropdown key={entity.id}>
                                                            <Dropdown.Toggle variant='secondary_custom' className="mr-3 mb-3" size="sm">
                                                            Manage
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu>
                                                            <Dropdown.Item onClick={()=> {
                                                                this.editEntity(entity);
                                                            }} className='border-bottom'>
                                                                <i className="nav-icon i-Pen-2 text-success font-weight-bold"> </i> Edit
                                                            </Dropdown.Item>
                                                            <Dropdown.Item className='text-danger' onClick={
                                                                ()=>{this.deleteEntity(entity);}
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
                                                    <td className='text-center' colSpan='6'>
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
                                                <th>Status</th>
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

createEntitySchema = yup.object().shape({
        name: yup.string().required("Name is required"),
      });


updateEntitySchema = yup.object().shape({
        name: yup.string().required("Name is required"),
        });

}




export default EntitiesComponent;
