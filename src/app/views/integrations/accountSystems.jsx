import React, { Component, useState, useEffect } from "react"
import { Dropdown, ProgressBar, Row, Col, Button,Form, ButtonToolbar,Modal } from "react-bootstrap";

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



const LOGO_URL="/assets/images/products";



export class AccountSystemsComponent extends Component{

    state = {
        editedIndex:0,
        allAccountSystems:[],
        showEditModal:false,
        showCreateModal:false,
        isSaving:false,
        isFetching:true,
        saveMsg:'Save',
        updateMsg:'Update',
        editedAccountSystem: {},
        installedAccountSystem:{},
        createAccountSystemForm: {
            name: "",
            code: "",
          },
          updateAccountSystemForm: {
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
         this.getAllAccountSystems()
    }


    setSystemLogo = (systemCode) => {
      const logos = {
        quickbooks:`quickbooks.png`,
        xero:`xero.jpg`,
        sage:`sage.jpg`,
        salesforce:`salesforce.png`,
        odoo:`odoo.jpg`,
      }
      return `${LOGO_URL}/${logos[systemCode]}`;
    }

    /**
     *
     * @param {*} event
     * @param {*} errors
     * @param {*} form
     */

    handleChange = (event, form='create') => {
        const {createAccountSystemForm, updateAccountSystemForm} = this.state
        if(form=='create'){
            createAccountSystemForm[event.target.name] = event.target.value;
        }else if(form=='edit'){
            updateAccountSystemForm[event.target.name] = event.target.value;
        }
        this.setState({ createAccountSystemForm, updateAccountSystemForm });
    }







    /**
     * This method lists all itemcategories
     */
     getAllAccountSystems = async ()=>{
         let isFetching = true;
         this.setState({isFetching})

        this.appMainService.getAllAccountSystems().then(
            (itemcategoriesResponse)=>{
                isFetching = false;
                const allAccountSystems = itemcategoriesResponse;
                let installedAccountSystem = allAccountSystems.filter(system => system.is_installed)[0] || {}

                console.log("installedAccountSystem",installedAccountSystem)
                this.setState({ allAccountSystems, isFetching, installedAccountSystem})
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
     * This method creates a new accountsystem
     */
    createAccountSystem = async ()=>{
        const {createAccountSystemForm, allAccountSystems} = this.state;
        let isSaving = true;
        let saveMsg = 'Saving';
        this.setState({isSaving, saveMsg})
        this.appMainService.createAccountSystem(createAccountSystemForm).then(
            (accountsystemData)=>{
                isSaving = false;
                saveMsg = 'Save';
                allAccountSystems.unshift(accountsystemData)
                this.setState({ allAccountSystems, isSaving, saveMsg })
                const successNotification = {
                    type:'success',
                    msg:`${accountsystemData.name} successfully created!`
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
     * This method updates a new accountsystem
     */
    updateAccountSystem = async ()=>{



        let {updateAccountSystemForm, allAccountSystems, editedAccountSystem} = this.state;
        let isSaving = true;
        let updateMsg = 'Updating';
        this.setState({isSaving, updateMsg})
        this.appMainService.updateAccountSystem(updateAccountSystemForm, editedAccountSystem.id).then(
            (updatedAccountSystem)=>{
                updatedAccountSystem.temp_flash = true
                isSaving = false;
                updateMsg = 'Update';
                allAccountSystems.splice(this.state.editedIndex, 1, updatedAccountSystem)
                this.setState({ allAccountSystems, isSaving, updateMsg })
                const successNotification = {
                    type:'success',
                    msg:`${updatedAccountSystem.name} successfully updated!`
                }
                new AppNotification(successNotification)
                this.toggleModal('edit');

             setTimeout(()=>{
                    updatedAccountSystem.temp_flash = false
                    allAccountSystems.splice(this.state.editedIndex, 1, updatedAccountSystem)
                    this.setState({ allAccountSystems, isSaving, updateMsg })
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
     * This method sets the accountsystem to be edited
     *  and opens the modal for edit
     *
     */
    editAccountSystem = (editedAccountSystem) => {
        const updateAccountSystemForm = {...editedAccountSystem}
        const editedIndex = this.state.allAccountSystems.findIndex(accountsystem => editedAccountSystem.id == accountsystem.id)
        this.setState({editedAccountSystem, editedIndex, updateAccountSystemForm});
        this.toggleModal('edit')
    }


    /**
     *
     * @param {*} accountsystem
     * This method toggles a accountsystem's status
     */
    toggleAccountSystem = (accountsystem)=>{
        const toggleMsg = accountsystem.status? "Disable":"Install";
        const gL = accountsystem.status? "not":""


        swal.fire({
            title: `<small>${toggleMsg}&nbsp;<b>${accountsystem.name}</b>?</small>`,
            text: `Subsequent budgets will ${gL} be able to be posted to ${accountsystem.name}.`,
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
                let { allAccountSystems } = this.state
                const toggleIndex = allAccountSystems.findIndex(r => r.id == accountsystem.id)
                // accountsystem.status = !accountsystem.status;

              this.appMainService.toggleAccountSystem(accountsystem).then(
                (toggledAccountSystem)=>{
                    allAccountSystems.splice(toggleIndex, 1, toggledAccountSystem)
                    this.setState({ allAccountSystems })
                    const successNotification = {
                        type:'success',
                        msg:`${toggledAccountSystem.name} successfully ${toggleMsg}d!`
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
     * @param {*} accountsystem
     * This method deletes a accountsystem
     *
     */
    deleteAccountSystem = (accountsystem)=>{
         swal.fire({
                title: `<small>Delete&nbsp;<b>${accountsystem.name}</b>?</small>`,
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
                let { allAccountSystems } = this.state
                  this.appMainService.deleteAccountSystem(accountsystem).then(
                    (deletedAccountSystem)=>{
                        allAccountSystems = allAccountSystems.filter(r=> r.id !== accountsystem.id)
                        this.setState({ allAccountSystems })
                        const successNotification = {
                            type:'success',
                            msg:`${accountsystem.name} successfully deleted!`
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
        const createAccountSystemForm = {
            name: "",
            description: "",
          }
          this.setState({createAccountSystemForm})

    }

    render(){

      const { installedAccountSystem } = this.state;

        return (

            <>
                <div className="specific">


                <div className="breadcrumb">
                    <h1>Integrations</h1>
                    <ul>
                        <li><a href="#">List</a></li>
                      <li>Account Systems</li>
                    </ul>

                    {
                      installedAccountSystem.code ? (
                        <div className="d-inline ml-5 pl-5 text-center">
                          <span className="badge badge-success"><b>{installedAccountSystem.name} <em>installed.</em></b></span> &nbsp;<img
                            className=" rounded-circle m-2 avatar-sm "
                            src={this.setSystemLogo(installedAccountSystem.code)}
                            alt=""
                          />
                        </div>
                      ): null
                    }


                </div>



                <div className="separator-breadcrumb border-top"></div>
                <div className="row mb-4">

                    <div className="col-md-12 mb-4">
                        <div className="card text-left">
                            <div className="card-body">
                                <h4 className="card-title mb-3">Account Systems</h4>
                              <p>List of available account systems integrations. Only a one-time setup.</p>

                            {/* <div style={{"maxHeight":"500px", "overflowY":"scroll"}}> */}

                            <div className="table-responsive">
                                    <table className="display table  table-hover " id="user_table" style={{"width":"100%"}}>
                                        <thead>
                                            <tr className="ul-widget6__tr--sticky-th">
                                              <th>#</th>
                                                <th></th>
                                                <th>Name</th>
                                                <th>Code</th>
                                                <th>Date Created</th>
                                                <th>Date Updated</th>
                                                <th>Status</th>

                                            </tr>
                                        </thead>
                                        <tbody>
                                        {
                                          this.state.allAccountSystems.length ?  this.state.allAccountSystems.map( (accountsystem, index)=>{
                                                return (
                                                    <tr key={accountsystem.id} className={accountsystem.temp_flash ? 'bg-success text-white':''}>
                                                        <td>
                                                            <b>{index+1}</b>.
                                                        </td>
                                                        <td>
                                                          <img
                                                            className="rounded-circle m-2 avatar-sm rounded-circle "
                                                            src={this.setSystemLogo(accountsystem.code)}
                                                            alt=""
                                                          />
                                                        </td>
                                                        <td>
                                                            {accountsystem.name}
                                                        </td>
                                                        <td>
                                                        <code>{accountsystem.code}</code>
                                                        </td>

                                                        <td>
                                                        {utils.formatDate(accountsystem.created_at)}
                                                        </td>
                                                        <td>
                                                        {utils.formatDate(accountsystem.updated_at)}
                                                        </td>
                                                        <td>
                                                          {
                                                            accountsystem.is_installed ? (
                                                              <>
                                                              <ProgressBar
                                                                key={100}
                                                                now={100}
                                                                variant="success"
                                                                label="Installed"

                                                              ></ProgressBar>

                                                            <div className='text-center mt-2'>
                                                              <Form>

                                                                   <Form.Check
                                                                          checked={accountsystem.is_installed}
                                                                          type="switch"
                                                                          id={`custom-switch${accountsystem.id}`}
                                                                          label={accountsystem.is_installed ? '' : ''}
                                                                          className={accountsystem.is_installed ? 'text-success' : 'text-danger'}
                                                                          onChange={()=> this.toggleAccountSystem(accountsystem)}
                                                                      />

                                                                  </Form>
                                                            </div>
                                                              </>

                                                            ): (
                                                              <ProgressBar
                                                                key={100}
                                                                now={100}
                                                                variant="danger"
                                                                label="Disabled"

                                                              ></ProgressBar>
                                                            )
                                                          }

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
                                                <th></th>
                                                <th>Name</th>
                                                <th>Code</th>
                                                <th>Date Created</th>
                                                <th>Date Updated</th>
                                                <th>Status</th>

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

createAccountSystemSchema = yup.object().shape({
        name: yup.string().required("Name is required"),
        code: yup.string().required("Code is required"),
      });


updateAccountSystemSchema = yup.object().shape({
        name: yup.string().required("Name is required"),
        code: yup.string().required("Code is required"),
        });

}




export default AccountSystemsComponent;
