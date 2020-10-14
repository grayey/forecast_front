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

export class CostItemsComponent extends Component{

    state = {
        editedIndex:0,
        allCostItems:[],
        allItemCategories:[],
        showEditModal:false,
        showCreateModal:false,
        isSaving:false,
        isFetching:true,
        saveMsg:'Save',
        updateMsg:'Update',
        editedCostItem: {},
        createCostItemForm: {
            name: "",
            code: "",
            category:""
          },
          updateCostItemForm: {
            name: "",
            code: "",
            category:""
          },

    }
    appMainService;



    constructor(props){
        super(props)
        this.appMainService = new AppMainService();
    }

    componentDidMount(){
         this.getAllCostItems();
         this.getAllItemCategories();
    }

    /**
     *
     * @param {*} event
     * @param {*} errors
     * @param {*} form
     */

    handleChange = (event, form='create') => {
        const {createCostItemForm, updateCostItemForm} = this.state
        if(form=='create'){
            createCostItemForm[event.target.name] = event.target.value;
        }else if(form=='edit'){
            updateCostItemForm[event.target.name] = event.target.value;
        }
        this.setState({ createCostItemForm, updateCostItemForm });
    }







    /**
     * This method lists all costitems
     */
     getAllCostItems = async ()=>{
         let isFetching = false;

        this.appMainService.getAllCostItems().then(
            (costitemsResponse)=>{
                const allCostItems = costitemsResponse;
                this.setState({ allCostItems, isFetching })
                console.log('CostItems response', costitemsResponse)
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
     * This method creates a new costitem
     */
    createCostItem = async ()=>{
        const {createCostItemForm, allCostItems} = this.state;
        let isSaving = true;
        let saveMsg = 'Saving';
        this.setState({isSaving, saveMsg})
        this.appMainService.createCostItem(createCostItemForm).then(
            (costitemData)=>{
                isSaving = false;
                saveMsg = 'Save';
                allCostItems.unshift(costitemData)
                this.setState({ allCostItems, isSaving, saveMsg })
                const successNotification = {
                    type:'success',
                    msg:`${costitemData.name} successfully created!`
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
     * This method updates a new costitem
     */
    updateCostItem = async ()=>{



        let {updateCostItemForm, allCostItems, editedCostItem} = this.state;
        let isSaving = true;
        let updateMsg = 'Updating';
        this.setState({isSaving, updateMsg})
        this.appMainService.updateCostItem(updateCostItemForm, editedCostItem.id).then(
            (updatedCostItem)=>{
                updatedCostItem.temp_flash = true
                isSaving = false;
                updateMsg = 'Update';
                allCostItems.splice(this.state.editedIndex, 1, updatedCostItem)
                this.setState({ allCostItems, isSaving, updateMsg })
                const successNotification = {
                    type:'success',
                    msg:`${updatedCostItem.name} successfully updated!`
                }
                new AppNotification(successNotification)
                this.toggleModal('edit');

             setTimeout(()=>{
                    updatedCostItem.temp_flash = false
                    allCostItems.splice(this.state.editedIndex, 1, updatedCostItem)
                    this.setState({ allCostItems, isSaving, updateMsg })
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
     * This method sets the costitem to be edited
     *  and opens the modal for edit
     *
     */
    editCostItem = (editedCostItem) => {
        const updateCostItemForm = {...editedCostItem}
        const editedIndex = this.state.allCostItems.findIndex(costitem => editedCostItem.id == costitem.id)
        this.setState({editedCostItem, editedIndex, updateCostItemForm});
        this.toggleModal('edit')
    }


    /**
     *
     * @param {*} costitem
     * This method toggles a costitem's status
     */
    toggleCostItem = (costitem)=>{
        const toggleMsg = costitem.status? "Disable":"Enable";
        const gL = costitem.status? "lose":"gain"


        swal.fire({
            title: `<small>${toggleMsg}&nbsp;<b>${costitem.name}</b>?</small>`,
            text: `${costitem.name} members will ${gL} permissions.`,
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
                let { allCostItems } = this.state
                const toggleIndex = allCostItems.findIndex(r => r.id == costitem.id)
                // costitem.status = !costitem.status;

              this.appMainService.toggleCostItem(costitem).then(
                (toggledCostItem)=>{
                    allCostItems.splice(toggleIndex, 1, toggledCostItem)
                    this.setState({ allCostItems })
                    const successNotification = {
                        type:'success',
                        msg:`${toggledCostItem.name} successfully ${toggleMsg}d!`
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
     * @param {*} costitem
     * This method deletes a costitem
     *
     */
    deleteCostItem = (costitem)=>{
         swal.fire({
                title: `<small>Delete&nbsp;<b>${costitem.name}</b>?</small>`,
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
                let { allCostItems } = this.state
                  this.appMainService.deleteCostItem(costitem).then(
                    (deletedCostItem)=>{
                        allCostItems = allCostItems.filter(r=> r.id !== costitem.id)
                        this.setState({ allCostItems })
                        const successNotification = {
                            type:'success',
                            msg:`${costitem.name} successfully deleted!`
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
      * This method lists all itemcategories
      */
      getAllItemCategories = async ()=>{
         this.appMainService.getAllItemCategories().then(
             (itemcategoriesResponse)=>{
                 const allItemCategories = itemcategoriesResponse;
                 this.setState({ allItemCategories })
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
     *
     * @param {*} modalName
     */
    resetForm = ()=> {
        const createCostItemForm = {
            name: "",
            category: "",
            code: "",
          }
          this.setState({createCostItemForm})

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
                      Update {this.state.editedCostItem.name}
                    </Modal.Title>
                    </Modal.Header>

                    <Formik
                    initialValues={this.state.updateCostItemForm}
                    validationSchema={this.updateCostItemSchema}
                    onSubmit={this.updateCostItem}
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
                                          !errors.category && touched.category,
                                      "invalid-field":
                                          errors.category && touched.category
                                      })}
                                  >
                                      <label htmlFor="costitem_category">
                                          <b>Category</b>
                                      </label>
                                      <select
                                        className="form-control"
                                        id="costitem_category"
                                        placeholder=""
                                        name="category"
                                        value={values.category}
                                        onChange={(event)=>this.handleChange(event, 'edit')}
                                        onBlur={handleBlur}
                                        required
                                        >
                                        <option value="">Select Category</option>
                                        {
                                          this.state.allItemCategories.map((category)=>{
                                          return  (<option value={category.id} key={category.id}>{category.name}({category.code})</option>)
                                          })
                                        }

                                      </select>

                                      <div className="valid-feedback"></div>
                                      <div className="invalid-feedback">
                                      Category is required
                                      </div>
                                  </div>


                                <div
                                    className={utils.classList({
                                    "col-md-12 mb-2": true,
                                    "valid-field":
                                        !errors.name && touched.name,
                                    "invalid-field":
                                        errors.name && touched.name
                                    })}
                                >
                                    <label htmlFor="costitem_name">
                                        <b>Name<span className='text-danger'>*</span></b>
                                    </label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    id="costitem_name"
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
                                    <label htmlFor="create_costitem_description">
                                         <b>Category Code<span className='text-danger'>*</span></b>
                                    </label>

                                    <input
                                    type="text"
                                    className="form-control"
                                    id="costitem_code"
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
                                        className={`btn btn-${utils.isValid(this.updateCostItemSchema, this.state.updateCostItemForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
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
                      Create Cost Item</Modal.Title>
                    </Modal.Header>

                    <Formik
                    initialValues={this.state.createCostItemForm}
                    validationSchema={this.createCostItemSchema}
                    onSubmit={this.createCostItem}
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
                                          !errors.category && touched.category,
                                      "invalid-field":
                                          errors.category && touched.category
                                      })}
                                  >
                                      <label htmlFor="costitem_category">
                                          <b>Category</b>
                                      </label>
                                      <select
                                        className="form-control"
                                        id="costitem_category"
                                        placeholder=""
                                        name="category"
                                        value={values.category}
                                        onChange={(event)=>this.handleChange(event)}
                                        onBlur={handleBlur}
                                        required
                                        >
                                        <option value="">Select Category</option>
                                        {
                                          this.state.allItemCategories.map((category)=>{
                                          return  (<option value={category.id} key={category.id}>{category.name}({category.code})</option>)
                                          })
                                        }

                                      </select>

                                      <div className="valid-feedback"></div>
                                      <div className="invalid-feedback">
                                      Category is required
                                      </div>
                                  </div>

                                <div
                                    className={utils.classList({
                                    "col-md-12 mb-2": true,
                                    "valid-field":
                                        !errors.name && touched.name,
                                    "invalid-field":
                                        errors.name && touched.name
                                    })}
                                >
                                    <label htmlFor="costitem_name">
                                        <b>Name<span className='text-danger'>*</span></b>
                                    </label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    id="costitem_name"
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
                                    <label htmlFor="create_costitem_description">
                                         <b>Cost Item Code<span className='text-danger'>*</span></b>
                                    </label>

                                    <input
                                    type="text"
                                    className="form-control"
                                    id="costitem_code"
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
                                        className={`btn btn-${utils.isValid(this.createCostItemSchema, this.state.createCostItemForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
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
                    <Button  variant="secondary_custom" className="ripple m-1 text-capitalize" onClick={ ()=>{ this.toggleModal('create')} }><i className='i-Add'></i> Create cost item</Button>
                </div>

                <div className="breadcrumb">
                    <h1>Cost Items</h1>
                    <ul>
                        <li><a href="#">List</a></li>
                        <li>View</li>
                    </ul>

                    <div className="d-inline pl-5">
                      <BulkTemplateDownload caller="costitems"/>
                    </div>
                </div>



                <div className="separator-breadcrumb border-top"></div>
                <div className="row mb-4">

                    <div className="col-md-12 mb-4">
                        <div className="card text-left">
                            <div className="card-body">
                                <h4 className="card-title mb-3">Cost Items</h4>
                                <p>List of cost items.</p>

                            {/* <div style={{"maxHeight":"500px", "overflowY":"scroll"}}> */}

                            <div className="table-responsive">
                                    <table className="display table table-striped table-hover " id="zero_configuration_table" style={{"width":"100%"}}>
                                        <thead>
                                            <tr className="ul-widget6__tr--sticky-th">
                                                <th>#</th>
                                                <th>Name</th>
                                                <th>Code</th>
                                                <th>**Category</th>
                                                <th>Status</th>
                                                <th>Date Created</th>
                                                <th>Date Updated</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {
                                          this.state.allCostItems.length ?  this.state.allCostItems.map( (costitem, index)=>{
                                                return (
                                                    <tr key={costitem.id} className={costitem.temp_flash ? 'bg-success text-white':''}>
                                                        <td>
                                                            <b>{index+1}</b>.
                                                        </td>
                                                        <td>
                                                            {costitem.name}
                                                        </td>
                                                        <td>
                                                        {costitem.code}
                                                        </td>
                                                        <td>
                                                        {costitem.category}
                                                        </td>
                                                        <td>
                                                        <Form>

                                                             <Form.Check
                                                                    checked={costitem.status}
                                                                    type="switch"
                                                                    id={`custom-switch${costitem.id}`}
                                                                    label={costitem.status ? 'Enabled' : 'Disabled'}
                                                                    className={costitem.status ? 'text-success' : 'text-danger'}
                                                                    onChange={()=> this.toggleCostItem(costitem)}
                                                                />


                                                            </Form>
                                                        </td>
                                                        <td>
                                                        {utils.formatDate(costitem.created_at)}
                                                        </td>
                                                        <td>
                                                        {utils.formatDate(costitem.updated_at)}
                                                        </td>

                                                        <td>
                                                        <Dropdown key={costitem.id}>
                                                            <Dropdown.Toggle variant='secondary_custom' className="mr-3 mb-3" size="sm">
                                                            Manage
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu>
                                                            <Dropdown.Item onClick={()=> {
                                                                this.editCostItem(costitem);
                                                            }} className='border-bottom'>
                                                                <i className="nav-icon i-Pen-2 text-success font-weight-bold"> </i> Edit
                                                            </Dropdown.Item>
                                                            <Dropdown.Item className='text-danger' onClick={
                                                                ()=>{this.deleteCostItem(costitem);}
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

createCostItemSchema = yup.object().shape({
        name: yup.string().required("Name is required"),
        code: yup.string().required("Code is required"),
        category:yup.string('Must be a string'),
      });


updateCostItemSchema = yup.object().shape({
        name: yup.string().required("Name is required"),
        code: yup.string().required("Code is required"),
        });

}




export default CostItemsComponent;
