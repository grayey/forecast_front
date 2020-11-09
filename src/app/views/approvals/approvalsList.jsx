import React, {Component} from 'react';
import {render} from 'react-dom';
import { Dropdown, Row, Col, Button,Form, ButtonToolbar,Modal } from "react-bootstrap";
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import arrayMove from 'array-move';
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


const SortableItem = SortableElement(({approval}) => <li className="list-group-item drag shadow-lg">


    <div className="row">
      <div className="col-md-2">
        <p><b>Description</b></p>
        <p>{approval.description}</p>
      </div>
      <div className="col-md-2">
        <p><b>Type</b></p>
      <p>{approval.approval_type}</p>
      </div>
      <div className="col-md-2">
        <p><b>Role</b></p>
      <p>{approval?.role?.name}</p>
      </div>
      <div className="col-md-2">
        <p><b>Stage</b></p>
      <p><span className="badge badge-primary">Step {approval.stage}</span></p>
      </div>
      <div className="col-md-2">
        <p><b>Date updated</b></p>
      <p>{utils.formatDate(approval.updated_at)}</p>
      </div>
      <div className="col-md-2">
        <p><b>Action</b></p>
      <p>{approval.updated_at}</p>
      </div>

    </div>



</li>);


const SortableList = SortableContainer(({allApprovals, fetching}) => {
  return (

    <div className="card bg-info_custom">
      <div className="card-header ">
        <p className="card-text text-white">
          This interface allows you to rearrange approval stages by dragging and dropping them in new positions.<br/>
        <b> NOTE:</b> This affects the individual stages of running cycles and departments' budgets.
        </p>
      {/* <p className="card-text text-warning"><b>NOTE:</b>This affects the stages of running cycles and budget entries.</p> */}
      </div>

      <ul className="w-100 list-group">
        {
        allApprovals.length ?  allApprovals.map((approval, index) => (
           <SortableItem key={`item-${approval.id}`} index={index} approval={approval} />
        )) :
        (
          <li className="list-group-item drag shadow-lg text-center">
            <FetchingRecords isFetching={fetching} emptyMsg="No approval stages configured"/>
          </li>
        )
      }
      </ul>

    </div>




  );
});

class ApprovalsList extends Component {

  appMainService;

  state = {
    items: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6'],
    editedIndex:0,
    allApprovals:[],
    allRoles:[],
    approvalIds:[],
   showEditModal:false,
   showCreateModal:false,
   isSaving:false,
   isFetching:true,
   saveMsg:'Save',
   updateMsg:'Update',
   editedApproval: {},
   createApprovalForm: {
       type: "",
       role: "",
     },
     updateApprovalForm: {
       type: "",
       role: "",
     },


  };

  constructor(props){
    super(props);
    this.appMainService = new AppMainService();
  }

  componentDidMount = async() => {
    this.getAllRoles();
    this.getAllApprovals();
  }

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
     * This method lists all approvals
     */
     getAllApprovals = async ()=>{
         let isFetching = false;

        this.appMainService.getAllApprovals().then(
            (approvalsResponse)=>{
                const allApprovals = approvalsResponse.sort((a, b) => (a.stage > b.stage) ? 1 : -1);
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
        const {createApprovalForm, allApprovals, allRoles} = this.state;
        const { role, type } = createApprovalForm;
        const selectedRole = allRoles.find(r => r.id == role );
        let isSaving = true;
        let saveMsg = 'Saving';
        this.setState({isSaving, saveMsg})
        createApprovalForm['approval_type'] = type;
        // createApprovalForm['role_id'] = role;
        createApprovalForm['description'] = `${selectedRole.name} Approval`;
        delete  createApprovalForm['type']; // type is a keyword on the backend, so did not setup the db column with the name
        // delete  createApprovalForm['role'];
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


  onSortEnd = async ({oldIndex, newIndex}) => {
    let { allApprovals } = this.state;
    const oldApprovals = [...allApprovals];
    const approvalIds = [];
    allApprovals = arrayMove(allApprovals, oldIndex, newIndex);
    allApprovals.map((apr, index)=>{
      apr.stage = index + 1;
      approvalIds.push(apr.id);
      return apr;
    })
      this.setState({ allApprovals });
      await this.appMainService.bulkUpdateApprovalStages(approvalIds).then(
      (updateResponse)=>{
      //silent update
    }).catch((error)=>{
      const errorNotification = {
          type:'error',
          msg:utils.processErrors(error)
      }

      this.setState({ allApprovals : oldApprovals });
      new AppNotification(errorNotification)
      setTimeout(()=>{
        window.location.reload();
      }, 1000)
    })


    // make backed call, then

  };

  render() {

    return (
      <>

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
                                      !errors.type && touched.type,
                                  "invalid-field":
                                      errors.type && touched.type
                                  })}
                              >
                                  <label htmlFor="approval_type">
                                      <b>Type<span className='text-danger'>*</span></b>
                                  </label>

                                  <select   className="form-control"
                                    id="approval_type"
                                    placeholder=""
                                    name="type"
                                    value={values.type}
                                    onChange={(event)=>this.handleChange(event)}
                                    onBlur={handleBlur}
                                    required>
                                    <option value="">Select</option>
                                  <option value="DEPARTMENTAL">By Department</option>
                                  <option value="OVERALL">Overall</option>


                                  </select>

                                  <div className="valid-feedback"></div>
                                  <div className="invalid-feedback">
                                  Approval type is required
                                  </div>
                              </div>
                              <div
                                  className={utils.classList({
                                  "col-md-12 mb-2": true,
                                  "valid-field":
                                      touched.role && !errors.role,
                                  "invalid-field":
                                      touched.role && errors.role
                                  })}
                              >
                                  <label htmlFor="create_approval_role">
                                       <b>Role<span className='text-danger'>*</span></b>
                                  </label>


                               <select
                                 className="form-control"
                                 id="create_approval_role"  onChange={(event)=>this.handleChange(event)}
                                 name="role"
                               >
                                 <option value="">Select</option>
                                 {
                                   this.state.allRoles.map((role)=>{
                                 return  (<option key={role.id} value={role.id}>{role?.name}</option>)

                                   })
                                 }

                               </select>
                                  <div className="valid-feedback"></div>
                                  <div className="invalid-feedback">
                                  Role is required
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
            <Button  variant="secondary_custom" className="ripple m-1 text-capitalize" onClick={ ()=>{ this.toggleModal('create')} }><i className='i-Add'></i> Approval stage</Button>
        </div>

        <div className="breadcrumb">
            <h1>Approval Stages</h1>
          <ul >
                <li><a href="#">List</a></li>
                <li>View</li>
            </ul>
        </div>

        <div className="separator-breadcrumb border-top"></div>

      <SortableList fetching={this.state.isFetching} allApprovals={this.state.allApprovals} onSortEnd={this.onSortEnd} />
</>)
;

  }

  createApprovalSchema = yup.object().shape({
        type: yup.string().required("Approval type is required"),
        role: yup.string().required("role is required"),
      });


updateApprovalSchema = yup.object().shape({
        type: yup.string().required("Approval type is required"),
        role: yup.string().required("role is required"),
        });



}


export default ApprovalsList;
