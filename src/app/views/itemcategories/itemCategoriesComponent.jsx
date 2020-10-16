import React, { Component, useState, useEffect } from "react"
import { Dropdown, Row, Col, Button,Form, ButtonToolbar,Modal } from "react-bootstrap";
// import SweetAlert from "sweetalert2-react";
import swal from "sweetalert2";
import AppMainService from "../../services/appMainService";
import * as utils from "@utils";
import { Formik } from "formik";
import * as yup from "yup";
import AppNotification from "../../appNotifications";
import {FetchingRecords, BulkTemplateDownload} from "../../appWidgets";


import LaddaButton, {
    XL,
    EXPAND_LEFT,
    EXPAND_RIGHT,
    EXPAND_UP,

    CONTRACT,
  } from "react-ladda";

export class ItemCategoriesComponent extends Component{

    state = {
        editedIndex:0,
        allItemCategories:[],
        showEditModal:false,
        showCreateModal:false,
        isSaving:false,
        isFetching:true,
        saveMsg:'Save',
        updateMsg:'Update',
        editedItemCategory: {},
        createItemCategoryForm: {
            name: "",
            code: "",
          },
          updateItemCategoryForm: {
            name: "",
            code: "",
          },

    }
    appMainService;



    constructor(props){
        super(props)
        this.appMainService = new AppMainService();
    }

    componentDidMount(){
         this.getAllItemCategories()
    }

    /**
     *
     * @param {*} event
     * @param {*} errors
     * @param {*} form
     */

    handleChange = (event, form='create') => {
        const {createItemCategoryForm, updateItemCategoryForm} = this.state
        if(form=='create'){
            createItemCategoryForm[event.target.name] = event.target.value;
        }else if(form=='edit'){
            updateItemCategoryForm[event.target.name] = event.target.value;
        }
        this.setState({ createItemCategoryForm, updateItemCategoryForm });
    }







    /**
     * This method lists all itemcategories
     */
     getAllItemCategories = async ()=>{
         let isFetching = true;
         this.setState({isFetching})

        this.appMainService.getAllItemCategories().then(
            (itemcategoriesResponse)=>{
                isFetching = false;
                const allItemCategories = itemcategoriesResponse;
                this.setState({ allItemCategories, isFetching })
            }
        ).catch((error)=>{
          isFetching = false;
            this.setState({isFetching})
            const errorNotification = {
                type:'error',
            }
            new AppNotification(errorNotification)
            msg:utils.processErrors(error)
            console.log('Error', error)
        })
    }

    /**
     * This method creates a new itemcategory
     */
    createItemCategory = async ()=>{
        const {createItemCategoryForm, allItemCategories} = this.state;
        let isSaving = true;
        let saveMsg = 'Saving';
        this.setState({isSaving, saveMsg})
        this.appMainService.createItemCategory(createItemCategoryForm).then(
            (itemcategoryData)=>{
                isSaving = false;
                saveMsg = 'Save';
                allItemCategories.unshift(itemcategoryData)
                this.setState({ allItemCategories, isSaving, saveMsg })
                const successNotification = {
                    type:'success',
                    msg:`${itemcategoryData.name} successfully created!`
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
     * This method updates a new itemcategory
     */
    updateItemCategory = async ()=>{



        let {updateItemCategoryForm, allItemCategories, editedItemCategory} = this.state;
        let isSaving = true;
        let updateMsg = 'Updating';
        this.setState({isSaving, updateMsg})
        this.appMainService.updateItemCategory(updateItemCategoryForm, editedItemCategory.id).then(
            (updatedItemCategory)=>{
                updatedItemCategory.temp_flash = true
                isSaving = false;
                updateMsg = 'Update';
                allItemCategories.splice(this.state.editedIndex, 1, updatedItemCategory)
                this.setState({ allItemCategories, isSaving, updateMsg })
                const successNotification = {
                    type:'success',
                    msg:`${updatedItemCategory.name} successfully updated!`
                }
                new AppNotification(successNotification)
                this.toggleModal('edit');

             setTimeout(()=>{
                    updatedItemCategory.temp_flash = false
                    allItemCategories.splice(this.state.editedIndex, 1, updatedItemCategory)
                    this.setState({ allItemCategories, isSaving, updateMsg })
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
     * This method sets the itemcategory to be edited
     *  and opens the modal for edit
     *
     */
    editItemCategory = (editedItemCategory) => {
        const updateItemCategoryForm = {...editedItemCategory}
        const editedIndex = this.state.allItemCategories.findIndex(itemcategory => editedItemCategory.id == itemcategory.id)
        this.setState({editedItemCategory, editedIndex, updateItemCategoryForm});
        this.toggleModal('edit')
    }


    /**
     *
     * @param {*} itemcategory
     * This method toggles a itemcategory's status
     */
    toggleItemCategory = (itemcategory)=>{
        const toggleMsg = itemcategory.status? "Disable":"Enable";
        const gL = itemcategory.status? "lose":"gain"


        swal.fire({
            title: `<small>${toggleMsg}&nbsp;<b>${itemcategory.name}</b>?</small>`,
            text: `${itemcategory.name} members will ${gL} permissions.`,
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
                let { allItemCategories } = this.state
                const toggleIndex = allItemCategories.findIndex(r => r.id == itemcategory.id)
                // itemcategory.status = !itemcategory.status;

              this.appMainService.toggleItemCategory(itemcategory).then(
                (toggledItemCategory)=>{
                    allItemCategories.splice(toggleIndex, 1, toggledItemCategory)
                    this.setState({ allItemCategories })
                    const successNotification = {
                        type:'success',
                        msg:`${toggledItemCategory.name} successfully ${toggleMsg}d!`
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
     * @param {*} itemcategory
     * This method deletes a itemcategory
     *
     */
    deleteItemCategory = (itemcategory)=>{
         swal.fire({
                title: `<small>Delete&nbsp;<b>${itemcategory.name}</b>?</small>`,
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
                let { allItemCategories } = this.state
                  this.appMainService.deleteItemCategory(itemcategory).then(
                    (deletedItemCategory)=>{
                        allItemCategories = allItemCategories.filter(r=> r.id !== itemcategory.id)
                        this.setState({ allItemCategories })
                        const successNotification = {
                            type:'success',
                            msg:`${itemcategory.name} successfully deleted!`
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
        const createItemCategoryForm = {
            name: "",
            description: "",
          }
          this.setState({createItemCategoryForm})

    }

    render(){

        return (

            <>
                <div className="specific">

                <Modal show={this.state.showEditModal} onHide={
                    ()=>{ this.toggleModal('edit')}
                    } {...this.props} id='edit_modal'>
                    <Modal.Header closeButton>
                    <Modal.Title>
                        <img src="/assets/images/logo.png" alt="Logo" className="modal-logo"  />&nbsp;&nbsp;
                      Update {this.state.editedItemCategory.name}
                    </Modal.Title>
                    </Modal.Header>

                    <Formik
                    initialValues={this.state.updateItemCategoryForm}
                    validationSchema={this.updateItemCategorySchema}
                    onSubmit={this.updateItemCategory}
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
                                    <label htmlFor="itemcategory_name">
                                        <b>Name<span className='text-danger'>*</span></b>
                                    </label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    id="itemcategory_name"
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
                                    <label htmlFor="create_itemcategory_description">
                                         <b>Category Code<span className='text-danger'>*</span></b>
                                    </label>

                                    <input
                                    type="text"
                                    className="form-control"
                                    id="itemcategory_code"
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
                                        className={`btn btn-${utils.isValid(this.updateItemCategorySchema, this.state.updateItemCategoryForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
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
                      Create Item Category</Modal.Title>
                    </Modal.Header>

                    <Formik
                    initialValues={this.state.createItemCategoryForm}
                    validationSchema={this.createItemCategorySchema}
                    onSubmit={this.createItemCategory}
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
                                    <label htmlFor="itemcategory_name">
                                        <b>Name<span className='text-danger'>*</span></b>
                                    </label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    id="itemcategory_name"
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
                                        touched.code && !errors.code,
                                    "invalid-field":
                                        touched.code && errors.code
                                    })}
                                >
                                    <label htmlFor="create_itemcategory_description">
                                         <b>Category Code<span className='text-danger'>*</span></b>
                                    </label>

                                    <input
                                    type="text"
                                    className="form-control"
                                    id="itemcategory_code"
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
                                        className={`btn btn-${utils.isValid(this.createItemCategorySchema, this.state.createItemCategoryForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
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
                    <Button  variant="secondary_custom" className="ripple m-1 text-capitalize" onClick={ ()=>{ this.toggleModal('create')} }><i className='i-Add'></i> Create Item Category</Button>
                </div>

                <div className="breadcrumb">
                    <h1>Item Categories</h1>
                    <ul>
                        <li><a href="#">List</a></li>
                        <li>View</li>
                    </ul>

                    <div className="d-inline pl-5">
                      <BulkTemplateDownload caller="itemcategories" refresh={this.getAllItemCategories}/>
                    </div>
                </div>



                <div className="separator-breadcrumb border-top"></div>
                <div className="row mb-4">

                    <div className="col-md-12 mb-4">
                        <div className="card text-left">
                            <div className="card-body">
                                <h4 className="card-title mb-3">Item Categories</h4>
                                <p>List of item categories.</p>

                            {/* <div style={{"maxHeight":"500px", "overflowY":"scroll"}}> */}

                            <div className="table-responsive">
                                    <table className="display table table-striped table-hover " id="zero_configuration_table" style={{"width":"100%"}}>
                                        <thead>
                                            <tr className="ul-widget6__tr--sticky-th">
                                                <th>#</th>
                                                <th>Name</th>
                                                <th>Code</th>
                                                <th>Status</th>
                                                <th>Date Created</th>
                                                <th>Date Updated</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {
                                          this.state.allItemCategories.length ?  this.state.allItemCategories.map( (itemcategory, index)=>{
                                                return (
                                                    <tr key={itemcategory.id} className={itemcategory.temp_flash ? 'bg-success text-white':''}>
                                                        <td>
                                                            <b>{index+1}</b>.
                                                        </td>
                                                        <td>
                                                            {itemcategory.name}
                                                        </td>
                                                        <td>
                                                        {itemcategory.code}
                                                        </td>
                                                        <td>
                                                        <Form>

                                                             <Form.Check
                                                                    checked={itemcategory.status}
                                                                    type="switch"
                                                                    id={`custom-switch${itemcategory.id}`}
                                                                    label={itemcategory.status ? 'Enabled' : 'Disabled'}
                                                                    className={itemcategory.status ? 'text-success' : 'text-danger'}
                                                                    onChange={()=> this.toggleItemCategory(itemcategory)}
                                                                />


                                                            </Form>
                                                        </td>
                                                        <td>
                                                        {utils.formatDate(itemcategory.created_at)}
                                                        </td>
                                                        <td>
                                                        {utils.formatDate(itemcategory.updated_at)}
                                                        </td>

                                                        <td>
                                                        <Dropdown key={itemcategory.id}>
                                                            <Dropdown.Toggle variant='secondary_custom' className="mr-3 mb-3" size="sm">
                                                            Manage
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu>
                                                            <Dropdown.Item onClick={()=> {
                                                                this.editItemCategory(itemcategory);
                                                            }} className='border-bottom'>
                                                                <i className="nav-icon i-Pen-2 text-success font-weight-bold"> </i> Edit
                                                            </Dropdown.Item>
                                                            <Dropdown.Item className='text-danger' onClick={
                                                                ()=>{this.deleteItemCategory(itemcategory);}
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
                                                <th>Code</th>
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

createItemCategorySchema = yup.object().shape({
        name: yup.string().required("Name is required"),
        code: yup.string().required("Code is required"),
      });


updateItemCategorySchema = yup.object().shape({
        name: yup.string().required("Name is required"),
        code: yup.string().required("Code is required"),
        });

}




export default ItemCategoriesComponent;
