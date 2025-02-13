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
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { FaArrowRight, FaTimes, FaExclamation, FaRecycle } from "react-icons/fa";

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

const animatedComponents = makeAnimated();
const approvalTypes = {
  VERSION:{
    label:"Version (overview)",
    desc:"Approves the OVERVIEW a budget version"
  },
  SINGLE_DEPARTMENTAL:{
    label:"Single Department",
    desc:"Approves ONLY their department's budget"
  },
  DEPARTMENTAL:{
    label:"Mulitiple Departments",
    desc:"Approves the overall version of a budget"

  },
  MULTIPLE_DEPARTMENTAL:{
    label:"Mulitiple Departments",
    desc:"Approves MULTIPLE departments' budgets"
  }
}

const setApprovalType = (a_type)=>{

  return approvalTypes[a_type].label
}

const SortableItem = SortableElement(({approval, is_faulty}) => <li className={`list-group-item drag shadow-lg ${is_faulty ? 'faulty':''}`}>


    <div className="row">
      <div className="col-md-2">
        {
          is_faulty ? (<FaExclamation className='text-danger'/>) : null
        }
        <p><b>Description</b></p>
        <p>{approval.description}</p>
      </div>
      <div className="col-md-2">
        <p><b>Type</b></p>
      <p>{setApprovalType(approval.approval_type)}</p>
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


const SortableList = SortableContainer(({allApprovals, fetching, badConfiguration}) => {
  return (

    <div className={`card bg-${badConfiguration ? 'danger' :'info_custom'}`}>
      <div className="card-header ">
        <p className="card-text text-white">
          {
            badConfiguration ?
          (
            <>
              <b>Bad Configuration:</b> <em>All</em> departmental approvals should come <em>before</em> version approvals.
            </>
      ) : (
            <>
              This interface allows you to rearrange approval stages by dragging and dropping them in new positions.<br/>
              <b> NOTE:</b> This affects the individual stages of running cycles and departments budgets.
            </>
          )
          }

        </p>
      {/* <p className="card-text text-warning"><b>NOTE:</b>This affects the stages of running cycles and budget entries.</p> */}
      </div>

      <ul className="w-100 list-group">
        {
        allApprovals.length ?  allApprovals.map((approval, index) => {
          const { is_faulty } = approval;
          console.log("IS FAULTY", is_faulty);

          return (

             <SortableItem key={`item-${approval.id}`} index={index} approval={approval} is_faulty={is_faulty}/>
          )
        }):
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

  userPermissions = [];
  CAN_VIEW_ALL = false;
  CAN_CREATE  = false;
  CAN_EDIT  = false;
  CAN_REARRANGE = false;

  state = {
    items: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6'],
    editedIndex:0,
    oldIndex:0,
    allApprovals:[],
    allRoles:[],
    approvalIds:[],
    shiftedFallBackOptions:[],
    fallBackOptions:[],
    shiftedRecaptureOptions:[],
    recaptureOptions:[],
    recaptureAssignments:[],
    illegalTrials:0,
    illegalNavigate:false,
    updateRejectionInfo:false,
    oldApprovals:[],
    sortIndex:0,
     showEditModal:false,
     showCreateModal:false,
     isSaving:false,
     isFetching:true,
     saveMsg:'Save',
     updateMsg:'Update',
     editedApproval: {},
     shiftedApproval:{},
     badConfiguration:false,
     createApprovalForm: {
         type: "SINGLE_DEPARTMENTAL",
         role: "",
         fallback_to:"",
         forward_to:"DEFAULT",
         recapture_options:""
       },
       updateApprovalForm: {
         type: "",
         role: "",
         fallback_to:"",
         recapture_options:""
       },
       updateRejectionInfoForm:{
         fallback_to:"",
         recapture_options:""
       }


  };

  constructor(props){
    super(props);
    this.appMainService = new AppMainService();

    const componentName = "Administration___Approval_Settings";
    const componentPermissions = utils.getComponentPermissions(componentName, props.route.auth);
    this.userPermissions = utils.comparePermissions(jwtAuthService.getUserTasks(), componentPermissions);
    this.CAN_VIEW_ALL = this.userPermissions.includes(`${componentName}__CAN_VIEW_ALL`);
    this.CAN_CREATE = this.userPermissions.includes(`${componentName}__CAN_CREATE`);
    this.CAN_EDIT = this.userPermissions.includes(`${componentName}__CAN_EDIT`);
    this.CAN_REARRANGE = this.userPermissions.includes(`${componentName}__CAN_REARRANGE`);
  }

  componentDidMount = async() => {
    this.getAllApprovals();
  }

  checkConfiguration = () =>{
    let { allApprovals, badConfiguration } = this.state;
    let faults = [];
    let faulty = false;
    const a_length = allApprovals.length;

    for(let index=0; index< a_length; index++){
      allApprovals[index]['is_faulty'] = faulty;
      if((index + 1) == a_length){
        continue;
      }
      let  present_ = allApprovals[index].approval_type;
      if(!index){
        faulty = present_ == "VERSION";
      }else{
        const prev_ = allApprovals[index - 1].approval_type;
        const next_ = allApprovals[index + 1].approval_type;
        faulty = (next_.includes('DEPARTMENTAL')  &&  !present_.includes('DEPARTMENTAL') && prev_.includes('DEPARTMENTAL'));
      }
      allApprovals[index]['is_faulty'] = faulty;
      faults.push(faulty);
    }
    badConfiguration = faults.includes(true);
    console.log('badConfiguration', badConfiguration, allApprovals);

    this.setState({ allApprovals, badConfiguration })

  }

  handleChange = async (event, form='create') => {
       const {createApprovalForm, updateApprovalForm, updateRejectionInfoForm} = this.state
       const {name, value} = event.target;

       if(form=='create'){
           createApprovalForm[name] = value;
       }else if(form=='edit'){
           updateApprovalForm[name] = value;
       }else if(form="uri"){
         updateRejectionInfoForm[name] = value;
       }
       if(name == 'role'){
         await this.updateRecaptureOptions(value);
       }
       this.setState({ createApprovalForm, updateApprovalForm, updateRejectionInfoForm});
   }

   handleMultiSelectChange = async(event, modal="create") =>{

       const recaptureAssignments = event;
       this.setState({ recaptureAssignments })


     console.log(recaptureAssignments, "ASSIGNMENTSSS")
     // const { label, value, id } = event;
     // const eventValue =  { label, value };
     //   let { recaptureAssignments, allRoles } = this.state
     //   const recaptureRole = allRoles.find(r => r.id == id);
     //   const assignmentIndex  = recaptureAssignments.findIndex(ra => ra.id == id);
     //
     //   assignmentIndex !== -1 ? recaptureAssignments.splice(assignmentIndex, 1) : recaptureAssignments.push(recaptureRole);
     //
     //   // if !recaptureAssignments.find(ra => ra.id == id) recaptureAssignments.push(recaptureRole);
     //
     //   this.setState({ recaptureAssignments })
   }

  /**
   * This method lists all roles
   */
   getAllRoles = async ()=>{
       let isFetching = false;
       let { allApprovals } = this.state;
       const allApprovalRoleIds = allApprovals.map(a => a.role.id);

      this.appMainService.getAllRoles().then(
          (rolesResponse)=>{
              let allRoles = rolesResponse.map((r)=>{
                  r.value = r.id;
                  r.label = r.name;
                  return r;
              })
              allRoles = allRoles.filter(r => !allApprovalRoleIds.includes(r.id)); // remove roles that have already been assigned approvals?
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
            async (approvalsResponse)=>{
                const allApprovals = approvalsResponse.sort((a, b) => (a.stage > b.stage) ? 1 : -1);
                await this.setState({ allApprovals, isFetching });
                this.checkConfiguration();
                this.getAllRoles();

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

    updateRecaptureOptions = async (mainRoleId) => {

      let { allRoles, recaptureOptions } = this.state;
      const mainRole = allRoles.find(r => r.id == mainRoleId);
      let { approval } = mainRole;
      if(approval){
        recaptureOptions = allRoles.filter((r)=>{
          const role_approval = r.approval;
          return role_approval ? role_approval.stage <= approval.stage  : true; // recaptureOptions should be "lesser" roles or roles with no approval
        })
      }
      this.setState({ recaptureOptions })

    }

    undoShift = async () =>{
      let { approvalIds, oldApprovals, allApprovals, updateRejectionInfo } = this.state;
      allApprovals = [...oldApprovals];
      approvalIds = [];
      updateRejectionInfo = false;
    await  this.setState({ allApprovals, approvalIds, updateRejectionInfo })
      this.resetForm();
    }


    saveShift = async() =>{
      let { approvalIds, oldApprovals, isSaving, shiftedApproval, updateRejectionInfoForm, recaptureAssignments } = this.state;
      // this.setState({ isSaving:true})
      // const shiftObject = {
      //   fallback_to:updateRejectionInfoForm.fallback_to,
      //   recapture_options:recaptureAssignments,
      //   approval_ids:approvalIds
      // };
      await this.appMainService.bulkUpdateApprovalStages(approvalIds).then(
      (updateResponse)=>{
        // this.setState({ isSaving:false, updateRejectionInfo:false})
        // const successNotification = {
        //     type:'success',
        //     msg:"Approvals readjusted."
        // }
      //silent update
    }).catch((error)=>{
      const errorNotification = {
          type:'error',
          msg:utils.processErrors(error)
      }

      this.setState({ allApprovals : oldApprovals, isSaving:false });
      new AppNotification(errorNotification)
      // setTimeout(()=>{
      //   window.location.reload();
      // }, 1000)
    })
    }


  /**
     * This method creates a new approval
     */
    createApproval = async ()=>{
        let {createApprovalForm, allApprovals, allRoles, recaptureAssignments} = this.state;
        const { role, type } = createApprovalForm;
        const selectedRole = allRoles.find(r => r.id == role );
        const noOfApprovals = allApprovals.length;
        const lastApprovalStage = noOfApprovals ? allApprovals[noOfApprovals - 1].stage : 0;
        let isSaving = true;
        let saveMsg = 'Saving';
        this.setState({isSaving, saveMsg})
        createApprovalForm['approval_type'] = type;
        createApprovalForm['stage'] = lastApprovalStage+1;
        createApprovalForm['fallback_to'] = createApprovalForm['fallback_to'] !=="CAPTURE" ? allApprovals.find(a=>a.id == createApprovalForm['fallback_to']) : "";
        createApprovalForm['recapture_options'] = recaptureAssignments;
        // createApprovalForm['role_id'] = role;
        createApprovalForm['description'] = `${selectedRole.name} Approval`;
        delete  createApprovalForm['type']; // type is a keyword on the backend, so did not setup the db column with the name
        // delete  createApprovalForm['role'];
        this.appMainService.createApproval(createApprovalForm).then(
            (approvalData)=>{
                isSaving = false;
                saveMsg = 'Save';
                recaptureAssignments = [];
                allApprovals.push(approvalData)
                this.setState({ allApprovals, isSaving, saveMsg, recaptureAssignments })
                const successNotification = {
                    type:'success',
                    msg:`${createApprovalForm['description']} successfully created!`
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
                console.log("EError", error)
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
      let {showEditModal, showCreateModal, fallBackOptions, recaptureOptions, allRoles, allApprovals, createApprovalForm, updateApprovalForm } = this.state;
      recaptureOptions = [...allRoles].filter(r => r.role_type !== 'APPROVER')
      if(modalName == 'create'){
          showCreateModal = !showCreateModal;
          fallBackOptions = [...allApprovals];
          const lastApprovalStage = fallBackOptions[fallBackOptions.length-1];
          const fallback_to = lastApprovalStage ? lastApprovalStage.id : "";
          createApprovalForm = {...createApprovalForm, fallback_to };
      }else if(modalName == 'edit'){
          showEditModal = !showEditModal;
          // fallBackOptions = // allApprovals with lower stages

      }

      this.setState({ showEditModal, showCreateModal, fallBackOptions, recaptureOptions, allRoles, allApprovals, createApprovalForm, updateApprovalForm })
  }


  onSortStart = async(event)=>{

    const sortIndex = event.index;
    this.setState({ sortIndex })
    // console.log("SOrt stert", event.index)
  }


  onSortEnd = async ({oldIndex, newIndex}) => {

    if(!this.CAN_REARRANGE){
      let { illegalTrials } = this.state;
      const trialsLeft = 3 - illegalTrials;
      if(!trialsLeft){
      return this.setState({ illegalNavigate:true });
      }

      let illegalMsg = `You are not permitted to re-arrange approvals!`
      let punctuate = '.';
      if(illegalTrials > 0){
        illegalMsg += ` You will have to leave this page after ${trialsLeft} more illegal trial${trialsLeft > 1 ? 's':''}.`;
        let x='';
        for(let i=0; i<illegalTrials; i++){x+= '!';}
        punctuate = x;
      }
       new AppNotification({
        type:"warning",
        msg:`${illegalMsg} Contact Admin${punctuate}`
      })
      illegalTrials += 1;
      this.setState({ illegalTrials })
      return false;
    }
    let { allApprovals, allRoles, sortIndex, updateRejectionInfo, shiftedFallBackOptions, shiftedRecaptureOptions } = this.state;
    if(sortIndex == newIndex){
      return; // because nothing moved
    }
    // console.log("SOrt Endd", newIndex)
    updateRejectionInfo = true;
    const oldApprovals = JSON.parse(JSON.stringify(allApprovals)); // DEEP COPY! Array spread was not working!!!
    const approvalIds = [];
    allApprovals = arrayMove(allApprovals, oldIndex, newIndex);
    allApprovals.map((apr, index)=>{
      apr.stage = index + 1;
      approvalIds.push(apr.id);
      return apr;
    })

    // const shiftedApproval = allApprovals[newIndex];
    // shiftedFallBackOptions = allApprovals.filter(a => a.stage <= shiftedApproval.stage) // allApprovals with lower stages
    // shiftedRecaptureOptions = allRoles.filter((r)=>{
    //   const role_approval = r.approval;
    //   return role_approval ? role_approval.stage <= shiftedApproval.stage  : true; // recaptureOptions should be "lesser" roles or roles with no approval
    // })
    //
      // this.setState({ allApprovals, oldApprovals, approvalIds, shiftedApproval, oldIndex, shiftedFallBackOptions, shiftedRecaptureOptions});

      await this.setState({ allApprovals, approvalIds, oldApprovals});
      await this.saveShift();
      this.checkConfiguration();


  };

  resetForm = ()=> {
    let { createApprovalForm, updateApprovalForm, updateRejectionInfoForm} = this.state;
    createApprovalForm = updateApprovalForm = {
        type: "",
        role: "",
        fallback_to:"",
        recapture_options:""
      };
      updateRejectionInfoForm = {
          fallback_to:"",
          recapture_options:""
        };
      this.setState({ createApprovalForm, updateApprovalForm, updateRejectionInfoForm })
  }

  render() {

    const { CAN_VIEW_ALL, CAN_CREATE, CAN_EDIT, CAN_REARRANGE, state } = this;


    return !CAN_VIEW_ALL || state.illegalNavigate ? <ErrorView errorType={VIEW_FORBIDDEN} /> : (
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
                                  <option value="SINGLE_DEPARTMENTAL">Single Department Approval</option>
                                  <option value="MULTIPLE_DEPARTMENTAL">Multiple Departments Approval</option>
                                  <option value="VERSION">Version(overview) Approval</option>


                                  </select>
                                  {
                                    values.type ? <small className="text-info mt-2 ml-2">{approvalTypes[values.type].desc}</small> : null
                                  }
                                  <div className="">

                                  </div>

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
                                 return role.role_type !=='CAPTURER' ? (<option key={role.id} value={role.id}>{role?.name}</option>) : null;

                                   })
                                 }

                               </select>
                                  <div className="valid-feedback"></div>
                                  <div className="invalid-feedback">
                                  Role is required
                                  </div>
                              </div>

                              </div>

                              <div className="form-row">
                              <div className="col-md-12 mb-2">
                                <div className="card-header w-100">
                                  <h4 className="text-danger">Post-rejection Cycle <FaRecycle/></h4>
                                </div>
                              </div>

                              <div className="col-md-12 mb-2">
                                <label><b>FallBack to:</b> <small>(on <em className="text-danger">rejection</em> defaults to <b>previous</b> stage)</small></label>
                              <select className="form-control fbt" name="fallback_to"
                                onChange={(event)=>this.handleChange(event)} value={values.fallback_to}>
                                <option value="">Select</option>
                              <option value="CAPTURE" className="text-danger">Capture</option>
                                  {
                                    this.state.fallBackOptions.map((f)=>{
                                  return  (<option key={f.id} value={f.id}>{f?.description}</option>)
                                    })
                                  }
                                </select>

                              </div>


                              <div className="col-md-12 mb-2">
                                <label><b>Jump Forward to:</b> <small>(on <em className="text-success">approval</em> defaults to <b>next</b> stage)</small></label>
                              <select className="form-control fbt" name="forward_to"
                                onChange={(event)=>this.handleChange(event)} value={values.forward_to}>
                                <option value="DEFAULT">DEFAULT</option>
                                <option value="LAST_APPROVAL">LAST APPROVAL</option>
                                  {/* {
                                    this.state.fallBackOptions.map((f)=>{
                                  return  (<option key={f.id} value={f.id}>{f?.description}</option>)
                                    })
                                  } */}
                                </select>

                              </div>

                              <div className="col-md-12">
                                <label><b>Recapture Option(s):</b></label>
                                {/* <select className="form-control" >
                                  <option value="">Select</option>
                                  {
                                    this.state.recaptureOptions.map((r)=>{
                                  return  (<option key={r.id} value={r.id}>{r?.name}</option>)
                                    })
                                  }


                                </select> */}

                            <Select
                              key={`create_options${this.state.createApprovalForm.role}}`}
                             closeMenuOnSelect={false}
                             components={animatedComponents}
                             onChange={this.handleMultiSelectChange}
                             isDisabled={!this.state.allApprovals.length}
                             isMulti
                             options={this.state.recaptureOptions}
                           />

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



              <Modal show={this.state.updateRejectionInfo} onHide={
                          ()=>{ this.toggleModal('update_r_i')}
                          } {...this.props} id='update_r_i'>
                          <Modal.Header closeButton>
                          <Modal.Title className="text-primary">Update Rejection Information</Modal.Title>
                          </Modal.Header>

                          <Formik
                          initialValues={this.state.updateRejectionInfoForm}
                          validationSchema={this.updateRejectionInfoFormSchema}
                          onSubmit={this.saveShift}
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
                                      <div className="col-md-12 mb-2">
                                        <div className="card-header w-100">
                                          <h5><b>{this.state?.shiftedApproval?.description}: <em>Stage {this.state.oldIndex + 1} <FaArrowRight/> {this.state?.shiftedApproval?.stage}</em></b></h5>
                                        </div>
                                      </div>

                                      <div className="col-md-6">
                                        <label><b>FallBack to:</b> <small>(defaults to previous stage)</small></label>
                                      <select className="form-control fbt" name="fallback_to"
                                        onChange={(event)=>this.handleChange(event, 'uri')} value={values.fallback_to}>
                                        <option value="" className="text-danger">Select</option>
                                      <option value="CAPTURE" className="text-danger">Capture</option>
                                          {
                                            this.state.shiftedFallBackOptions.map((f)=>{
                                          return  (<option key={f.id} value={f.id}>{f?.description}</option>)
                                            })
                                          }
                                        </select>

                                      </div>

                                      <div className="col-md-6">
                                        <label><b>Recapture Option(s):</b></label>
                                        {/* <select className="form-control" >
                                          <option value="">Select</option>
                                          {
                                            this.state.recaptureOptions.map((r)=>{
                                          return  (<option key={r.id} value={r.id}>{r?.name}</option>)
                                            })
                                          }


                                        </select> */}

                                    <Select
                                      key={`update_options`}
                                     closeMenuOnSelect={false}
                                     components={animatedComponents}
                                     onChange={(event) => this.handleMultiSelectChange(event, 'uri')}
                                     isMulti
                                     options={this.state.shiftedRecaptureOptions}
                                   />

                                      </div>


                                      </div>
                                  </Modal.Body>

                                  <Modal.Footer>

                                          <LaddaButton
                                              className="btn btn-danger border-0 mr-2 mb-2 position-relative"
                                              loading={false}
                                              progress={0.5}
                                              type='button'
                                              onClick={this.undoShift}

                                              >
                                            <FaTimes/>  Cancel
                                          </LaddaButton>

                                          <LaddaButton
                                              className={`btn btn-${utils.isValid(this.updateRejectionInfoFormSchema, this.state.updateRejectionInfoForm) && this.state.recaptureAssignments.length ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
                                              loading={this.state.isSaving}
                                              progress={0.5}
                                              type='submit'
                                              data-style={EXPAND_RIGHT}
                                              disabled={!this.state.recaptureAssignments.length}
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
                            <Button  variant="secondary_custom" className="ripple m-1 text-capitalize" onClick={ ()=>{ this.toggleModal('create')} }><i className='i-Add'></i> Approval stage</Button>
                        </div>
                      ): null
                    }


        <div className="breadcrumb">
            <h1>Approval Stages</h1>
          <ul >
                <li><a href="#">List</a></li>
                <li>View</li>
            </ul>
        </div>

        <div className="separator-breadcrumb border-top"></div>

      <SortableList fetching={this.state.isFetching} onSortStart={this.onSortStart} allApprovals={this.state.allApprovals} onSortEnd={this.onSortEnd} badConfiguration={this.state.badConfiguration} />
</>)
;

  }

  createApprovalSchema = yup.object().shape({
        type: yup.string().required("Approval type is required"),
        role: yup.string().required("role is required"),
        // fallback_to: yup.string().required("a fallback stage is required"),
      });


updateApprovalSchema = yup.object().shape({
        type: yup.string().required("Approval type is required"),
        role: yup.string().required("role is required"),
        // fallback_to: yup.string().required("a fallback stage is required"),

        });

updateRejectionInfoFormSchema = yup.object().shape({
        // fallback_to: yup.string().required("a fallback level is required"),
        // recapture_options: yup.string().required("role is required"),
        // fallback_to: yup.string().required("a fallback stage is required"),

        });


}


export default ApprovalsList;
