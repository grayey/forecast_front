import React, { Component, useState, useEffect } from "react"
import { Dropdown, Row, Col, Button,Form, ButtonToolbar,Modal, OverlayTrigger, Tooltip, } from "react-bootstrap";
// import SweetAlert from "sweetalert2-react";
import swal from "sweetalert2";
import AppMainService from "../../services/appMainService";
import * as utils from "@utils";
import { Formik } from "formik";
import * as yup from "yup";
import AppNotification from "../../appNotifications";
import {FetchingRecords, BulkTemplateDownload} from "../../appWidgets";

import  { FaPlus, FaList, FaClone, FaSpinner } from "react-icons/fa";
import { RichTextEditor } from "@gull";


import LaddaButton, {
    XL,
    EXPAND_LEFT,
    EXPAND_RIGHT,
    EXPAND_UP,

    CONTRACT,
  } from "react-ladda";

export class EmailTemplatesComponent extends Component{



    state = {
        editedIndex:0,
        allEmailTemplates:[],
        showEditModal:false,
        showCreateModal:false,
        isSaving:false,
        isFetching:true,
        isViewMode:true,
        saveMsg:'Save',
        updateMsg:'Update',
        editedEmailTemplate: {},
        selectedTemplateType:{},
        createEmailTemplateForm: {
            name: "",
            code: "",
          },
          updateEmailTemplateForm: {
            name: "",
            code: "",
          },
          templatePreview:"",
          allTemplateTypes:[

          ],
          allEmailTemplates:[

          ],

          createOrUpdateEmailTemplateForm:{
            mail_body:"",
            template_type:"",
            subject:""
          },

          emaillVariables:[
            {
              name:'~employee~',
              pref:'Copy',
              suf:'~employee~'
            },
            {
              name:'~user~',
              pref:'Copy',
              suf:'~user~'
            },
            {
              name:'~budgetyear~',
              pref:'Copy',
              suf:'~budgetyear~'
            },
            {
              name:'~department~',
              pref:'Copy',
              suf:'~department~'
            },
            {
              name:'~version~',
              pref:'Copy',
              suf:'~version~'
            },
            {
              name:'~action~',
              pref:'Copy',
              suf:'~action~'
            },

          ]

    }
    appMainService;



    constructor(props){
        super(props)
        this.appMainService = new AppMainService();
    }

    componentDidMount(){
         this.getAllEmailTemplates();
         this.getAllTemplateTypes();
    }

    /**
     *
     * @param {*} event
     * @param {*} errors
     * @param {*} form
     */
    //
    // handleChange = (event, form='create') => {
    //     const {createEmailTemplateForm, updateEmailTemplateForm} = this.state
    //     if(form=='create'){
    //         createEmailTemplateForm[event.target.name] = event.target.value;
    //     }else if(form=='edit'){
    //         updateEmailTemplateForm[event.target.name] = event.target.value;
    //     }
    //     this.setState({ createEmailTemplateForm, updateEmailTemplateForm });
    // }







    /**
     * This method lists all emailtemplates
     */
     getAllEmailTemplates = async ()=>{
         let isFetching = true;
         this.setState({isFetching})

        this.appMainService.getAllEmailTemplates().then(
            (emailtemplatesResponse)=>{
                isFetching = false;
                const allEmailTemplates = emailtemplatesResponse;
                this.setState({ allEmailTemplates, isFetching })
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
     * [getAllTemplateTypes description]
     * @return {Promise} [description]
     */
    getAllTemplateTypes = async ()=>{
            this.appMainService.getAllTemplateTypes().then(
                (templatetypesResponse)=>{
                    const allTemplateTypes = templatetypesResponse;
                    this.setState({ allTemplateTypes })
                }
            ).catch((error)=>{
                const errorNotification = {
                    type:'error',
                    msg:utils.processErrors(error)
                }
                new AppNotification(errorNotification)
                // console.log('Error', error)
            })
        }


        /**
         * [getTemplateTypeById description]
         * @return {Promise} [description]
         */
        getTemplateTypeById = async (typeId)=>{
          this.setState({isFetching:true})
                this.appMainService.getTemplateTypeById(typeId).then(
                    (templatetypesResponse)=>{
                      this.setState({isViewMode: true}); //initiate light-speed rerender
                        const selectedTemplateType = templatetypesResponse;
                        delete selectedTemplateType.id;
                        const { mailtemplate } = selectedTemplateType;
                        const updateObject = mailtemplate ? mailtemplate : {
                          mail_body:"",
                          template_type:typeId,
                          subject:""
                        }
                        const templatePreview =this.getTemplatePreview(updateObject.mail_body);
                        const createOrUpdateEmailTemplateForm = Object.assign(selectedTemplateType, updateObject); //
                        this.setState({ selectedTemplateType, createOrUpdateEmailTemplateForm, templatePreview,  isViewMode:false, isFetching:false  });
                    }
                ).catch((error)=>{
                  this.setState({isFetching:false})

                    const errorNotification = {
                        type:'error',
                        msg:utils.processErrors(error)
                    }
                    new AppNotification(errorNotification)
                    // console.log('Error', error)
                })
            }

    /**
     * This method saves an emailtemplate
     */
    saveEmailTemplate = async ()=>{
        let {createOrUpdateEmailTemplateForm, allEmailTemplates, selectedTemplateType } = this.state;
        let isSaving = true;
        let saveMsg = 'Saving';
        this.setState({isSaving, saveMsg});
        // createOrUpdateEmailTemplateForm['template_type_id'] = createOrUpdateEmailTemplateForm['template_type']
        // delete createOrUpdateEmailTemplateForm['template_type'];
        const { id } = createOrUpdateEmailTemplateForm;
        this.appMainService.saveEmailTemplate(createOrUpdateEmailTemplateForm,id).then(
            (emailtemplateData)=>{
                isSaving = false;
                saveMsg = 'Save';
                let suffix = 'created';
                if(id){
                  suffix = 'updated';
                  const editedIndex = allEmailTemplates.findIndex(em => em.id == id);
                  allEmailTemplates.splice(editedIndex, 1, emailtemplateData);
                }else{
                  allEmailTemplates.unshift(emailtemplateData);
                  this.resetForm();

                }
                const successNotification = {
                    type:'success',
                    msg:`${selectedTemplateType.name} template successfully ${suffix}!`
                }
                this.setState({ allEmailTemplates, isSaving, saveMsg, isViewMode:true });

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


    /**
     * This method updates a new emailtemplate
     */
    updateEmailTemplate = async ()=>{



        let {updateEmailTemplateForm, allEmailTemplates, editedEmailTemplate} = this.state;
        let isSaving = true;
        let updateMsg = 'Updating';
        this.setState({isSaving, updateMsg})
        this.appMainService.updateEmailTemplate(updateEmailTemplateForm, editedEmailTemplate.id).then(
            (updatedEmailTemplate)=>{
                updatedEmailTemplate.temp_flash = true
                isSaving = false;
                updateMsg = 'Update';
                allEmailTemplates.splice(this.state.editedIndex, 1, updatedEmailTemplate)
                this.setState({ allEmailTemplates, isSaving, updateMsg })
                const successNotification = {
                    type:'success',
                    msg:`${updatedEmailTemplate.name} successfully updated!`
                }
                new AppNotification(successNotification)
                this.toggleModal('edit');

             setTimeout(()=>{
                    updatedEmailTemplate.temp_flash = false
                    allEmailTemplates.splice(this.state.editedIndex, 1, updatedEmailTemplate)
                    this.setState({ allEmailTemplates, isSaving, updateMsg })
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
 * [copyToClipBoard description]
 * @param  {[type]} variableName [description]
 * @return {[type]}          [description]
 * THis method copies a clicked variable to clipboard
 */
  copyToClipBoard = (variableName)=>{

    const textField = document.createElement('textarea');
     textField.innerText = variableName;
     document.body.appendChild(textField);
     textField.select();
     document.execCommand('copy');
     textField.remove();

    let { emaillVariables } = this.state;
    const selectedVariableIndex = emaillVariables.findIndex(ev => ev.name == variableName);
    const selectedVariable = emaillVariables[selectedVariableIndex];
    selectedVariable.pref = `${selectedVariable.suf}` ;
    selectedVariable.suf = 'Copied!';
    emaillVariables.splice(selectedVariableIndex, 1, selectedVariable); //replace

    this.setState({emaillVariables});

   // Revert back
   setTimeout(()=>{
     selectedVariable.pref = 'Copy';
     selectedVariable.suf = `${selectedVariable.name}`;
     emaillVariables.splice(selectedVariableIndex, 1, selectedVariable); //replace
     this.setState({emaillVariables});
   }, 1500)
  }

  handleChange = async (event) => {
      const { createOrUpdateEmailTemplateForm } = this.state
      const { name, value }= event.target;
      if(name == 'template_type'){
        await this.getTemplateTypeById(value);
      }
      createOrUpdateEmailTemplateForm[name] = value;
      this.setState({ createOrUpdateEmailTemplateForm });
  }

  handleRichEditorChange = async (html) => {
        const { createOrUpdateEmailTemplateForm } = this.state
        createOrUpdateEmailTemplateForm['mail_body'] = html;
        const templatePreview = await this.getTemplatePreview(html);
        this.setState({ createOrUpdateEmailTemplateForm, templatePreview });

      }

  /**
   * [setPreview description]
   * @param {[type]} html [description]
   * This method sets the email preview
   */
      getTemplatePreview = (html) =>{
        let templatePreview = html;

          const mirror = {
            '~employee~': 'John Doe',
            '~user~': 'Budget Owner',
            '~department~': 'Finance',
            '~budgetyear~': '2021',
            '~version~': 'Version 1 (BV1)',
            '~action~': 'approved',
          };
          for(let key in mirror){
            const search_string = new RegExp(key, 'g'); //g for all appearances
            templatePreview = templatePreview.replace(search_string, mirror[key]);
          }
          return templatePreview;

      }



    /**
     *
     * This method sets the emailtemplate to be edited
     *  and opens the modal for edit
     *
     */
    editEmailTemplate = (editedEmailTemplate) => {
        const createOrUpdateEmailTemplateForm = {...editedEmailTemplate}
        createOrUpdateEmailTemplateForm['template_type'] = createOrUpdateEmailTemplateForm['template_type'].id;
        const templatePreview = this.getTemplatePreview(createOrUpdateEmailTemplateForm['mail_body']);
        const selectedTemplateType =  this.state.allTemplateTypes.find(tt => tt.id == createOrUpdateEmailTemplateForm['template_type']);
        this.setState({createOrUpdateEmailTemplateForm, templatePreview, isViewMode:false, selectedTemplateType});
    }

    switchView = async(view = 'list') => {
        this.setState({ isViewMode:true });

      const isViewMode = view == 'list';
      await this.resetForm();
      this.setState({ isViewMode, templatePreview:"" });
    }

    /**
     *
     * @param {*} emailtemplate
     * This method toggles a emailtemplate's status
     */
    toggleEmailTemplate = (emailtemplate)=>{
        const toggleMsg = emailtemplate.status? "Disable":"Enable";
        const gL = emailtemplate.status? "lose":"gain"


        swal.fire({
            title: `<small>${toggleMsg}&nbsp;<b>${emailtemplate.name}</b>?</small>`,
            text: `${emailtemplate.name} members will ${gL} permissions.`,
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
                let { allEmailTemplates } = this.state
                const toggleIndex = allEmailTemplates.findIndex(r => r.id == emailtemplate.id)
                // emailtemplate.status = !emailtemplate.status;

              this.appMainService.toggleEmailTemplate(emailtemplate).then(
                (toggledEmailTemplate)=>{
                    allEmailTemplates.splice(toggleIndex, 1, toggledEmailTemplate)
                    this.setState({ allEmailTemplates })
                    const successNotification = {
                        type:'success',
                        msg:`${toggledEmailTemplate.name} successfully ${toggleMsg}d!`
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
     * @param {*} emailtemplate
     * This method deletes a emailtemplate
     *
     */
    deleteEmailTemplate = (emailtemplate)=>{
         swal.fire({
                title: `<small>Delete&nbsp;<b>${emailtemplate.template_type.name}</b> template?</small>`,
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
                let { allEmailTemplates } = this.state
                  this.appMainService.deleteEmailTemplate(emailtemplate).then(
                    (deletedEmailTemplate)=>{
                        allEmailTemplates = allEmailTemplates.filter(r=> r.id !== emailtemplate.id)
                        this.setState({ allEmailTemplates })
                        const successNotification = {
                            type:'success',
                            msg:`${emailtemplate.template_type.name} template successfully deleted!`
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
        const createOrUpdateEmailTemplateForm ={
          mail_body:"",
          template_type:"",
          subject:""
        }
          this.setState({createOrUpdateEmailTemplateForm})

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
                      Update {this.state.editedEmailTemplate.name}
                    </Modal.Title>
                    </Modal.Header>

                    <Formik
                    initialValues={this.state.updateEmailTemplateForm}
                    validationSchema={this.updateEmailTemplateSchema}
                    onSubmit={this.updateEmailTemplate}
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
                                    <label htmlFor="emailtemplate_name">
                                        <b>Name<span className='text-danger'>*</span></b>
                                    </label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    id="emailtemplate_name"
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
                                    <label htmlFor="create_emailtemplate_description">
                                         <b>Category Code<span className='text-danger'>*</span></b>
                                    </label>

                                    <input
                                    type="text"
                                    className="form-control"
                                    id="emailtemplate_code"
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
                                        className={`btn btn-${utils.isValid(this.updateEmailTemplateSchema, this.state.updateEmailTemplateForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
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
                    initialValues={this.state.createEmailTemplateForm}
                    validationSchema={this.createEmailTemplateSchema}
                    onSubmit={this.createEmailTemplate}
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
                                    <label htmlFor="emailtemplate_name">
                                        <b>Name<span className='text-danger'>*</span></b>
                                    </label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    id="emailtemplate_name"
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
                                    <label htmlFor="create_emailtemplate_description">
                                         <b>Category Code<span className='text-danger'>*</span></b>
                                    </label>

                                    <input
                                    type="text"
                                    className="form-control"
                                    id="emailtemplate_code"
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
                                        className={`btn btn-${utils.isValid(this.createEmailTemplateSchema, this.state.createEmailTemplateForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
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
                  <div className="btn-group">
                    <button className={`btn btn-info${this.state.isViewMode ? '_custom shadow-lg' :''}`} onClick={()=> this.switchView()}><FaList/> View Templates</button>

                  <button className={`btn btn-info${this.state.isViewMode ? '' :'_custom shadow-lg'}`} onClick={()=> this.switchView('create')}><FaPlus/> Create | Update Template</button>

                  </div>
                </div>

                <div className="breadcrumb">
                    <h1>Email Templates</h1>
                    <ul>
                        <li><a href="#">List</a></li>
                        <li>View</li>
                    </ul>



                </div>



                <div className="separator-breadcrumb border-top"></div>
                <div className="row mb-4">

                  {
                    this.state.isViewMode ? (

                                          <div className="col-md-12 mb-4">
                                              <div className="card text-left">
                                                  <div className="card-body">
                                                      <h4 className="card-title mb-3">Templates List</h4>


                                                  {/* <div style={{"maxHeight":"500px", "overflowY":"scroll"}}> */}

                                                  <div className="table-responsive">
                                                          <table className="display table table-striped table-hover " id="zero_configuration_table" style={{"width":"100%"}}>
                                                              <thead>
                                                                  <tr className="ul-widget6__tr--sticky-th">
                                                                      <th>#</th>
                                                                      <th>Name</th>
                                                                      <th>Sort Code</th>
                                                                      <th>Subject</th>
                                                                      <th>Date Created</th>
                                                                      <th>Date Updated</th>
                                                                      <th>Action</th>
                                                                  </tr>
                                                              </thead>
                                                              <tbody>
                                                              {
                                                                this.state.allEmailTemplates.length ?  this.state.allEmailTemplates.map( (emailtemplate, index)=>{
                                                                      return (
                                                                          <tr key={emailtemplate.id} className={emailtemplate.temp_flash ? 'bg-success text-white':''}>
                                                                              <td>
                                                                                  <b>{index+1}</b>.
                                                                              </td>
                                                                              <td>
                                                                                  {emailtemplate?.template_type?.name}
                                                                              </td>
                                                                              <td>
                                                                              <code>{emailtemplate?.template_type?.sort_code}</code>
                                                                              </td>
                                                                              <td>
                                                                                {emailtemplate?.subject}

                                                                              </td>
                                                                              <td>
                                                                              {utils.formatDate(emailtemplate.created_at)}
                                                                              </td>
                                                                              <td>
                                                                              {utils.formatDate(emailtemplate.updated_at)}
                                                                              </td>

                                                                              <td>
                                                                              <Dropdown key={emailtemplate.id}>
                                                                                  <Dropdown.Toggle variant='secondary_custom' className="mr-3 mb-3" size="sm">
                                                                                  Manage
                                                                                  </Dropdown.Toggle>
                                                                                  <Dropdown.Menu>
                                                                                  <Dropdown.Item onClick={()=> {
                                                                                      this.editEmailTemplate(emailtemplate);
                                                                                  }} className='border-bottom'>
                                                                                      <i className="nav-icon i-Gear text-success font-weight-bold"> </i>View | Edit
                                                                                  </Dropdown.Item>
                                                                                  <Dropdown.Item className='text-danger' onClick={
                                                                                      ()=>{this.deleteEmailTemplate(emailtemplate);}
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
                                                                          <FetchingRecords isFetching={this.state.isFetching} emptyMsg='No templates found.'/>
                                                                          </td>
                                                                      </tr>
                                                                  )
                                                              }

                                                              </tbody>
                                                              <tfoot>
                                                                  <tr>
                                                                    <th>#</th>
                                                                    <th>Name</th>
                                                                    <th>Sort Code</th>
                                                                    <th>Subject</th>
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



                    ) : (

                      <Formik
                      initialValues={this.state.createOrUpdateEmailTemplateForm}
                      validationSchema={this.createOrUpdateEmailTemplateFormSchema}
                      onSubmit={this.saveEmailTemplate}
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
                          <div className="col-md-12 mb-4">
                              <div className="card text-left">
                                  <div className="card-body">
                                      <h4 className="card-title mb-3">Create | Update Template</h4>


                                  {/* <div style={{"maxHeight":"500px", "overflowY":"scroll"}}> */}

                                  <div className="row">
                                    <div className="col-md-3 p-4 border-right">
                                      <label><b>Template:</b> {this.state.isFetching ? <FaSpinner className='spin'/> : null}</label>
                                      <div className="form-row mb-3">
                                      <select className='form-control'
                                        name="template_type"
                                        value={values.template_type}
                                        onChange={this.handleChange}
                                        onBlur={handleBlur}
                                        required>
                                        <option value=''>Select</option>
                                        {
                                          this.state.allTemplateTypes.map((templateType)=>{
                                          return  (<option value={templateType.id} key={templateType.id}>{templateType.name}</option>)
                                          })
                                        }

                                      </select>

                                      </div>

                                      <div className="form-row mb-3">
                                        <label><b>Subject:</b></label>

                                      <input className='form-control' type='text' placeholder='Email subject'
                                        name="subject"
                                        value={values.subject}
                                        onChange={this.handleChange}
                                        onBlur={handleBlur}
                                        required
                                      />
                                      </div>


                                    <div className="form-row mb-3">
                                      <label><b>Other Recipients:</b> (optional)</label>

                                    <input className='form-control' type='text' disabled placeholder='Email subject' value=''/>
                                    </div>

                                      <div className="row">
                                        <div className="col-md-12 p-2">
                                          <h4 className='card-header'>Email Variables <small>(optional)</small></h4>
                                        </div>
                                        {
                                          this.state.emaillVariables.map((variable, index)=>{
                                            return(
                                              <div className="col-md-4 col-sm-6 pb-2 text-center" key={variable.name}>

                                                <OverlayTrigger
                                                  placement={'top'}
                                                  overlay={
                                                    <Tooltip id={`tooltip-${variable.name}`}>
                                                      {variable?.pref} <strong>{variable?.suf}</strong>.
                                                    </Tooltip>
                                                  }
                                                >

                                                <span className='pointer' onClick={()=> this.copyToClipBoard(variable.name)}>
                                                  <span className="shadow email_variables badge badge-secondary_custom">
                                                    {variable.name}
                                                  </span>
                                                  <span><FaClone/></span>
                                                </span>

                                              </OverlayTrigger>

                                              </div>
                                            )
                                          })
                                        }

                                      </div>

                                    </div>

                                    <div className="col-md-6 border-right">
                                      <h4 className='card-header'>Content </h4>

                                      <RichTextEditor
                                        theme="snow"

                                        content={values.mail_body}
                                        handleContentChange={html =>
                                          this.handleRichEditorChange(html)
                                        }
                                        placeholder="insert text here..."
                                      />
                                    </div>

                                    <div className="col-md-3">
                                      <h4 className='card-header'>Sample content preview</h4>
                                    <div className="preview_body card-body">
                                        <div dangerouslySetInnerHTML={{__html: this.state.templatePreview}}></div>
                                      </div>

                                    </div>

                                      </div>


                                  </div>

                                  <div className='card-footer' >
                                    <div className="float-right">
                                      <LaddaButton
                                          className={`btn btn-${utils.isValid(this.createOrUpdateEmailTemplateFormSchema, this.state.createOrUpdateEmailTemplateForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
                                          loading={this.state.isSaving}
                                          progress={0.5}
                                          type='submit'
                                          data-style={EXPAND_RIGHT}
                                          >
                                          {this.state.saveMsg}
                                      </LaddaButton>
                                    </div>

                                  </div>
                                  </div>
                              </div>


                            </form>
                            );
                        }}

                        </Formik>

                    )
                  }


                </div>

                </div>

            </>
        )



    }

createEmailTemplateSchema = yup.object().shape({
        name: yup.string().required("Name is required"),
        code: yup.string().required("Code is required"),
      });


updateEmailTemplateSchema = yup.object().shape({
        name: yup.string().required("Name is required"),
        code: yup.string().required("Code is required"),
        });

createOrUpdateEmailTemplateFormSchema = yup.object().shape({
        mail_body: yup.string().required("Mail Content is required"),
        subject: yup.string().required("Subject is required"),
        template_type: yup.string().required("Template type is required"),
        });

}





export default EmailTemplatesComponent;
