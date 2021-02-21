import React, { Component, useState, useEffect } from "react"
import { Dropdown, Row, Col, Accordion, Card, Badge,Button,Form, ButtonToolbar,Modal, Tab, Tabs, TabContent, Nav } from "react-bootstrap";

import swal from "sweetalert2";
import AppMainService from "../../services/appMainService";
import jwtAuthService  from "../../services/jwtAuthService";

import * as utils from "@utils";
import { Formik } from "formik";
import * as yup from "yup";
import AppNotification from "../../appNotifications";
import {FetchingRecords, TaskIcons, ErrorView } from "../../appWidgets";
import { Link, Redirect } from "react-router-dom";
import {FaCheck, FaTimes, FaList, FaPlusCircle, FaMinusCircle }from "react-icons/fa";

import { VIEW_FORBIDDEN } from "app/appConstants";


// import queryString from 'query-string';



import LaddaButton, {
    XL,
    EXPAND_LEFT,
    EXPAND_RIGHT,
    EXPAND_UP,

    CONTRACT,
  } from "react-ladda";
import { toLength } from "lodash";

export class RoleDetailComponent extends Component{


  CAN_VIEW_DETAIL = false;
  CAN_ASSIGN_TASKS = false;
  userPermissions = [];



    state = {

        roleSlug:"",
        viewedRole:{
          role_tasks:[],
        },
        taskPermissions:[],
        allChecked:false,
        navigate: false,
        newRoute:"",
        editedIndex:0,
        allRoles:[],
        allTasks:[],
        isSaving:false,
        isFetching:true,
        updateMsg:'Save',
        roleMembers: [
            {
              name: "Smith Doe",
              email: "Smith@gmail.com",
              status: "active",
              photoUrl: "/assets/images/faces/1.jpg"
            },
            {
              name: "Jhon Doe",
              email: "Jhon@gmail.com",
              status: "pending",
              photoUrl: "/assets/images/faces/2.jpg"
            },
            {
              name: "Alex",
              email: "Otttio@gmail.com",
              status: "inactive",
              photoUrl: "/assets/images/faces/3.jpg"
            },
            {
              name: "Mathew Doe",
              email: "matheo@gmail.com",
              status: "active",
              photoUrl: "/assets/images/faces/4.jpg"
            }
          ]



    }
    appMainService;



    constructor(props){
        super(props)
        this.appMainService = new AppMainService();

        const componentName = "Administration___Roles";
        const componentPermissions = utils.getComponentPermissions(componentName, props.route.auth);
        this.userPermissions = utils.comparePermissions(jwtAuthService.getUserTasks(), componentPermissions);

        this.CAN_VIEW_DETAIL = this.userPermissions.includes(`${componentName}__CAN_VIEW_DETAIL`);
        this.CAN_ASSIGN_TASKS = this.userPermissions.includes(`${componentName}__CAN_ASSIGN_TASKS`);
    }

    componentDidMount(){
        // let params = queryString.parse(this.props.location.search);
        const params = this.props.match.params;
        const roleSlug = params.slug;
        console.log('Params', params)
         this.getRoleBySlug(roleSlug);
         this.getAllTasks();


    }

 customTabHeader = (title, icon) => (
        <div className="d-flex align-items-center">
          <span className="mr-2">
            <i className={icon}></i>
          </span>
          <span>{title}</span>
        </div>
      );


    /**
     *
     * @param {*} task
     * This method saves the permissions for a role
     */
    addPermission = (task_permission) =>{
        let { viewedRole, allChecked} = this.state;
        const { role_tasks } = viewedRole;
        const taskIndex = role_tasks.findIndex(t => t == task_permission);
        if(taskIndex != -1){
            role_tasks.splice(taskIndex, 1) // remove
        }else{
            role_tasks.push(task_permission) // add
        }
        console.log(taskIndex, 'Tasks ', role_tasks)

        // allChecked = tasks?.length == this.state.allTasks.length && tasks.length
        // viewedRole['tasks'] = tasks;
        // this.setState({viewedRole, allChecked})
        //
        this.setState({viewedRole:{...viewedRole, role_tasks} })
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
     * This method gets a role by its slug
     */
    getRoleBySlug = async (slug)=>{
        let isFetching = false;
       this.appMainService.getRoleBySlug(slug).then(
           (viewedRole)=>{
             const { role_tasks } = viewedRole;
             viewedRole['role_tasks'] = role_tasks ?  JSON.parse(role_tasks) : [];
               this.setState({ viewedRole, isFetching })
               console.log('Roles viewed', viewedRole)
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
     * This method lists all tasks
     */
    getAllTasks = async ()=>{
        let isFetching = false;
        const { taskPermissions } = this.state;
        let isRecursive = false;

        const buildTaskPermissions = (task, views, isRecursive) =>{
          views = !isRecursive ? JSON.parse(views) : views;
          const viewKeys = Object.keys(views);
          viewKeys.forEach((view)=>{
            const actions = views[view];
            const actions_is_array = actions instanceof Array;
            if(!actions_is_array){
              isRecursive = true;
              buildTaskPermissions(view, actions, isRecursive);
            }
            else{
              actions.forEach((action)=>{
                const task_permission = `${task.name || task}___${view}__${action}`; //  take note of the double underscore
                taskPermissions.push(task_permission);
              })

            }
          })
        }

       this.appMainService.getAllTasks().then(
           (tasksResponse)=>{
               const allTasks = tasksResponse;
               allTasks.forEach((task)=>{
                 let isRecursive = false;
                 let { views } = task;
                 buildTaskPermissions(task, views);
               })

               const allChecked = this.state?.viewedRole?.tasks?.length == allTasks.length && allTasks.length ;
               console.log('ALL TASK PERMISSIONS', taskPermissions);

               this.setState({ allTasks, isFetching, allChecked, taskPermissions })
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

   formatTaskName = (taskName)=> {
    taskName = taskName.replace('.', ' | ').split('_').join(' ');
    return utils.toTiltle(taskName);
  }

  includesTask = (task) =>{
      return this.state?.viewedRole?.tasks?.filter( t=> t._id == task._id ).length > 0
  }

  checkorUncheckAll = () => {
    let {allTasks, viewedRole, allChecked} = this.state;
    let {tasks} = viewedRole;

    if(!allChecked){
        allTasks.forEach(t =>{
            if(!this.includesTask(t)){
                tasks.push(t)
            }
        })
    }else{
        tasks = [];
    }
    allChecked = !allChecked;
    viewedRole['tasks'] = tasks;
    this.setState({viewedRole, allChecked});

  }


    /**
     * This method updates a new role
     */
    savePermissions = async ()=>{
        let isSaving = true;
        let updateMsg = 'Saving';
        this.setState({isSaving, updateMsg});
        const { viewedRole } = this.state;
        this.appMainService.syncRoleTasks(viewedRole).then(
            (viewedRole)=>{
                isSaving = false;
                updateMsg = 'Save';
                const { role_tasks } = viewedRole;
                viewedRole['role_tasks'] = role_tasks ?  JSON.parse(role_tasks) : [];
                this.setState({ viewedRole, isSaving, updateMsg })
                const successNotification = {
                    type:'success',
                    msg:`Successfully updated ${viewedRole.name} permissions!`
                }
                new AppNotification(successNotification)

            }
        ).catch(
            (error)=>{
                isSaving = false;
                updateMsg = 'Save';
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
                const toggleIndex = allRoles.findIndex(r => r._id == role._id)
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


toggleAccordion = async (task, index)=>{
   const t_task = JSON.parse(JSON.stringify(task))
   let { allTasks } = this.state;
   // allTasks = allTasks.map((ag)=>{
   //   ag.is_open = false;
   //   return ag;
   // })
   t_task.is_open = !t_task.is_open;

   allTasks.splice(index, 1, t_task);
   // allTasks = await this.buildGroupedEntries(allTasks);
   this.setState({ allTasks });

 }


    renderAccordion = (allTasks) =>{
      const { viewedRole, taskPermissions } = this.state;

      return allTasks.map( (task, index)=>{
        let { views } = task;
        views = JSON.parse(views);
        const viewKeys = Object.keys(views);
        const all_checked = true;

        return (
          <Card key={task?.id} className="shadow-sm mb-3">
            <Accordion>
              <Card.Header className="d-flex align-items-center justify-content-between">
                <Accordion.Toggle
                  className="cursor-pointer text-center mb-0 text-primary"
                  as="span"
                  eventKey={task?.id?.toString()}
                  onClick={()=>this.toggleAccordion(task,index)}
                >
                  <a href='#' onClick={(e)=> e.preventDefault()} className="underline">{task?.name}</a>&nbsp;
                  {
                    task?.is_open ? <FaMinusCircle className="text-danger"/> : <FaPlusCircle/>
                  }
                </Accordion.Toggle>

                  {/* <i className={`${TaskIcons[task?.name]} fa-4x`}></i> */}

                <div className="d-flex">

                  {/* <Form.Check
                    name="task_name"
                    onChange={(event)=>console.log(event)}
                    value={task?.name || ''}
                    checked={all_checked}
                    type="checkbox"
                    id={`${task.id}_${task.name}`}
                    label={all_checked ? `Unselect all`:'Select all'}
                  /> */}

                  <i className={`${TaskIcons[task?.name]} fa-4x`}></i>


                  <div>

                  </div>



                </div>
              </Card.Header>
              <Accordion.Collapse eventKey={task?.id?.toString()}>
                <Card.Body>

                  <div className='row card-header'>

                    <div className='col-2'>
                      <h5>#</h5>
                    </div>

                    <div className='col-4'>
                      <h5>Views</h5>
                    </div>

                    <div className='col-6'>
                      <h5 className='text-center'>Actions</h5>

                    </div>

                  </div>

                  {
                    viewKeys.length ?   viewKeys.map((view, v_index)=>{

                      const actions = views[view];
                      const actions_is_array = actions instanceof Array;
                      if(!actions_is_array){

                        return (
                          <p>
                            WE WEILL BE BACK!!
                          </p>
                        )


                        }

                      return(

                        <div className='cardx bottom-dash'>


                                                  <div className='row p-2' key={view}>
                                                    <div className='col-2'>
                                                      <b>
                                                        {v_index + 1}.
                                                      </b>
                                                    </div>

                                                    <div className='col-4'>
                                                      <h5>
                                                        <b>
                                                          <code>
                                                            {view?.split('_')?.join(' ')}
                                                          </code>
                                                        </b>
                                                      </h5>
                                                    </div>
                                                    <div className='col-6'>
                                                      <div className='row'>
                                                        {
                                                          actions.map((action)=>{
                                                            const task_permission = `${task.name}___${view}__${action}`;
                                                            const { role_tasks } = viewedRole;
                                                            const is_checked = role_tasks.includes(task_permission);
                                                            return (
                                                              <div className='col-12 m-2 border-bottom' key={action}>

                                                                <div className='float-left'>
                                                                  {action?.split('_')?.join(' ')}
                                                                </div>

                                                                <div className='float-right'>

                                                                  <Form.Check
                                                                    name="task_action"
                                                                    onChange={(event)=>this.addPermission(task_permission)}
                                                                    value={action || ''}
                                                                    checked={is_checked}
                                                                    type="checkbox"
                                                                    id={`${task_permission}`}
                                                                    label={is_checked ? `remove`:'assign'}
                                                                  />
                                                              </div>
                                                              </div>
                                                            )

                                                          })

                                                      }


                                                      </div>

                                                    </div>

                                                  </div>


                        </div>
                      )

                    }): (

                      null
                    )
                  }



                </Card.Body>
              </Accordion.Collapse>
            </Accordion>
          </Card>
        )


          })



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
                        allRoles = allRoles.filter(r=> r._id !== role._id)
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
    getrole_userStatusClass = status => {
        switch (status) {
          case "active":
            return "badge-success";
          case "inactive":
            return "badge-warning";
          case "pending":
            return "badge-primary";
          default:
            break;
        }
      };


    render(){

      const {  CAN_VIEW_DETAIL, CAN_ASSIGN_TASKS, state } = this;

        const { navigate, newRoute } = state;
        if (navigate) {
          return <Redirect to={newRoute} />
        }

        return !CAN_VIEW_DETAIL ? <ErrorView errorType={VIEW_FORBIDDEN} />  : (

            <>
                <div className="specific">


                <div className='float-right'>
                    {/* <Button  variant="secondary_custom" className="ripple m-1 text-capitalize" onClick={ ()=>{ this.toggleModal('create')} }><i className='i-Add'></i> Create Role</Button> */}
                </div>

                <div className="breadcrumb">
                    <h1>{this.state.viewedRole?.name}</h1>
                    <ul>
                        <li><a href="#">Role</a></li>
                      <li>Detail</li>
                    </ul>
                </div>

                <div className="separator-breadcrumb border-top"></div>
                <div className="row mb-4">

                    <div className="col-md-12 mb-4">
                        <div className="cardx text-left">
                            <div className="card-bodyx">


                            <Tabs defaultActiveKey="role_information" id="uncontrolled-tab-example">
                                            <Tab
                                                eventKey="role_information"
                                                title={this.customTabHeader("Role information", "i-Atom")}
                                            >
                                                                    <div className="mt-2">

                                                <div className="row">
                                                <div className="col-md-4 border-right">

                                                    <div className="card ">
                                                        <div className="card-header">
                                                                <h4 className="card-titlex">
                                                                <Badge className={`badge-round-${this.state.viewedRole?.status ? 'success':'danger'}  m-1`}>
                                                                        {
                                                                            this.state.viewedRole?.status ? (<span>&#x2713;</span>):  (<span>&#x21;</span>)
                                                                        }
                                                                    </Badge>
                                                                    General
                                                                    </h4>
                                                        </div>

                                                        <div className="card-body">
                                                        <p>
                                                        {this.state.viewedRole?.description}
                                                        </p>
                                                        <ul className="list-group list-group-flush">
                                                        <li className="list-group-item"><b>Name: </b>{this.state.viewedRole?.name}</li>
                                                      <li className="list-group-item"><b>No. of profiles: </b>{this.state.viewedRole?.role_users?.length}</li>
                                                        <li className="list-group-item">
                                                            <b>Status: </b>
                                                            <span className={this.state.viewedRole?.status ? 'text-success':'text-danger'}>
                                                            {this.state.viewedRole?.status ? 'Enabled':'Disabled'}
                                                            </span>

                                                        </li>
                                                        <li className="list-group-item"><b>Date Created: </b>{utils.formatDate(this.state.viewedRole?.created_at)}</li>
                                                        <li className="list-group-item"><b>Date Updated: </b>{utils.formatDate(this.state.viewedRole?.updated_at)}</li>
                                                        </ul>
                                                        </div>

                                                    </div>



                                                </div>

                                                <div className="col-md-8">
                                                <div className="card ">
                                                        <div className="card-header">
                                                                <h4 className="card-titlex"><b>{this.state.viewedRole?.name}</b>  Profiles</h4>
                                                        </div>

                                                        <div className="card-body">

                                                        <div className="table-responsive">
                                                        <div style={{"maxHeight":"270px", "overflowY":"scroll"}}>
                                                <table id="role_user_table" className="table  text-center">
                                                    <thead>
                                                    <tr className="ul-widget6__tr--sticky-th">
                                                    <th>#</th>
                                                    <th>Full Name</th>
                                                    <th>Email</th>
                                                    <th>Department</th>
                                                    <th>Status</th>
                                                    <th>Date Created</th>


                                                    </tr>
                                                    </thead>
                                                <tbody>
                                                {
                                          this.state?.viewedRole?.role_users?.length ?  this.state?.viewedRole?.role_users?.map( (role_user, index)=>{
                                            const { department, userprofile } = role_user;
                                            const { user } = userprofile;
                                                return (
                                                    <tr key={role_user.id} className={role_user.temp_flash ? 'bg-success text-white':''}>
                                                        <td>
                                                            <b>{index+1}</b>.
                                                        </td>
                                                        <td>
                                                            <Link  key={role_user.id} to={`/dashboard/user-profile/${userprofile?.slug}`}>
                                                            {utils.toTiltle(`${user.first_name} ${user.last_name}`)}
                                                            </Link>

                                                        </td>

                                                        <td>
                                                        {user?.email}
                                                        </td>
                                                        <td>
                                                        {department?.name} ({department?.code})
                                                        </td>

                                                        <td>

                                                        <span className={user.is_active ? 'text-success' : 'text-danger'}>
                                                            {user.is_active ? 'Enabled' : 'Disabled'}
                                                            </span>
                                                        </td>

                                                        <td>
                                                        {utils.formatDate(role_user.created_at)}
                                                        </td>



                                                    </tr>
                                                )


                                            }) :
                                            (
                                                <tr>
                                                    <td className='text-center' colSpan='6'>
                                                    <FetchingRecords isFetching={this.state.isFetching} emptyMsg='No profiles found.'/>
                                                    </td>
                                                </tr>
                                            )
                                        }
                                                </tbody>
                                                </table>
                                                </div>

                                                        </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                </div>



                                                </div>

                                            </Tab>
                                            {
                                              !CAN_ASSIGN_TASKS ? null : (

                                                <Tab
                                                    eventKey="permissions"
                                                    title={this.customTabHeader("Configure permissions", "i-Gear-2")}
                                                >
                                                    <div className="card ">
                                                                                <div className="card-header card-title mb-0 d-flex align-items-center justify-content-between border-0">

                                                                                        <h3 className="w-50 float-left card-title m-0"><i className="i-Gears"></i> <b>{this.state.viewedRole?.name}</b> permissions</h3>

                                                                                        <div className='float-right'>
                                                                                            {/* <Button  variant="secondary_custom" className="ripple m-1 text-capitalize" onClick={ ()=>{ this.toggleModal('create')} }><i className='i-Add'></i> Create Role</Button> */}

                                                                                            <LaddaButton
                                                                                                    className={`btn btn-${true ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
                                                                                                    loading={this.state.isSaving}
                                                                                                    progress={0.5}
                                                                                                    type='button'
                                                                                                    data-style={EXPAND_RIGHT}
                                                                                                    onClick = {this.savePermissions}>
                                                                                                {this.state.updateMsg} Permissions
                                                                                            </LaddaButton>
                                                                                        </div>


                                                                                </div>

                                                                                <div className="card-body">
                                                                                <div className="table-responsive">
                                                                                <div>

                                                                                  {
                                                                                  this.state.allTasks.length ?  this.renderAccordion(this.state.allTasks) :
                                                                                      (
                                                                                        (
                                                                                          <>
                                                                                          <div className="text-center w-100">
                                                                                            <FetchingRecords isFetching={this.state.isFetching} emptyMsg={`No system tasks`} />

                                                                                          </div>
                                                                                          </>
                                                                                        )
                                                                                      )
                                                                                  }




                                                                     {/* <table className="display table table-striped table-hover " id="zero_configuration_table" style={{"width":"100%"}}>
                                                                        <thead>
                                                                            <tr className="ul-widget6__tr--sticky-th">
                                                                                <th>#</th>
                                                                                <th>Name</th>
                                                                                <th>Module</th>
                                                                                <th>Date Created</th>
                                                                                <th>Date Updated</th>
                                                                                <th>
                                                                                    <div className="form-inline" style={{cursor:"pointer !important"}}>
                                                                                    Select &nbsp; <b>|</b> &nbsp; <Form.Check
                                                                                                        name="check_uncheck"

                                                                                                        onChange={this.checkorUncheckAll}
                                                                                                        value=""
                                                                                                        checked={this.state.allChecked}
                                                                                                        type="checkbox"
                                                                                                        id="check_uncheck"
                                                                                                        className={`text-${this.state.allChecked ? 'danger':'success'}`}
                                                                                                        label={this.state.allChecked ?'uncheck all':'check all'}
                                                                                                        />
                                                                                    </div>


                                                                                    </th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                        {
                                                                        this.state.allTasks.length ?  this.state.allTasks.map( (task, index)=>{
                                                                                return (
                                                                                    <tr key={task._id} className={task.temp_flash ? 'bg-success text-white':''}>
                                                                                        <td>
                                                                                            <b>{index+1}</b>.
                                                                                        </td>
                                                                                        <td>
                                                                                            {this.formatTaskName(task?.name)} &nbsp;

                                                                                            {
                                                                                                this.includesTask(task) ? (
                                                                                                    <Badge  pill variant="success" className="m-1">
                                                                                                        assigned
                                                                                                    </Badge>
                                                                                                ): null
                                                                                            }


                                                                                        </td>
                                                                                        <td>
                                                                                        {utils.toTiltle(task?.module_name)}
                                                                                        </td>
                                                                                        <td>
                                                                                        {utils.formatDate(task.created_at)}
                                                                                        </td>
                                                                                        <td>
                                                                                        {utils.formatDate(task.updated_at)}
                                                                                        </td>

                                                                                        <td>
                                                                                        <Form.Check
                                                                                                        name="checkbox3"
                                                                                                        key={`check2${task._id}`}
                                                                                                        onChange={()=>{
                                                                                                        this.addPermission(task)
                                                                                                        }}
                                                                                                        value=""
                                                                                                        checked={this.includesTask(task)}
                                                                                                        type="checkbox"
                                                                                                        id={`check2${task._id}`}
                                                                                                        label=""
                                                                                                        />

                                                                                        </td>

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
                                                                        <td colSpan='7'>

                                                                        </td>
                                                                            </tr>
                                                                        </tfoot>
                                                                    </table> */}
                                                                                      </div>
                                                                                </div>
                                                                            </div>
                                                                            </div>


                                                </Tab>
                                              )
                                            }


                            </Tabs>


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


}




export default RoleDetailComponent;
