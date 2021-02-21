import React, { Component, useState, useEffect } from "react"
import { Dropdown, Row, Col, Badge,Button,Form, ButtonToolbar,Modal, Tab, Tabs, TabContent, Nav } from "react-bootstrap";

import swal from "sweetalert2";
import AppMainService from "app/services/appMainService";
import jwtAuthService from "app/services/jwtAuthService";

import * as utils from "@utils";
import { Formik } from "formik";
import * as yup from "yup";
import AppNotification from "app/appNotifications";
import { FetchingRecords, StandInRequest } from "app/appWidgets";
import { Link, Redirect } from "react-router-dom";
import { Breadcrumb } from "@gull";

// import queryString from 'query-string';



import LaddaButton, {
    XL,
    EXPAND_LEFT,
    EXPAND_RIGHT,
    EXPAND_UP,

    CONTRACT,
  } from "react-ladda";
import { toLength } from "lodash";

export class UserDetailComponent extends Component{

    state = {

        userSlug:"",
        viewedUser:{},
        allChecked:false,
        navigate: false,
        newRoute:"",
        editedIndex:0,
        allUsers:[],
        allTasks:[],
        isSaving:false,
        isFetching:true,
        updateMsg:'Save',
        department_roles:[],
        backgroundColors:[
          'primary',
          'secondary',
          'success',
          'info_custom',
          'secondary_custom',
          'info',
          'warning',
          'danger',
        ],
        userMembers: [
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
    }

    componentDidMount(){
        // let params = queryString.parse(this.props.location.search);
        const params = this.props.match.params;
        const userSlug = params.slug;
         this.getUserBySlug(userSlug);
    }

    setFirstLetter = (text) => {
      return text ? text.split('')[0]?.toUpperCase() : '?';
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
     * This method saves the permissions for a user
     */
    addPermission = (task) =>{
        let {viewedUser,allChecked} = this.state;
        const tasks = viewedUser['tasks'];
        const findTask = tasks.findIndex(t => t._id == task._id);
        if(findTask != -1){
            tasks.splice(findTask, 1) // remove
        }else{
            tasks.push(task) // add
            console.log('Tasks ', tasks)
        }
        allChecked = tasks?.length == this.state.allTasks.length && tasks.length
        viewedUser['tasks'] = tasks;
        this.setState({viewedUser, allChecked})
    }




    /**
     * This method gets a user by its slug
     */
    getUserBySlug = async (slug)=>{
        let isFetching = false;
       this.appMainService.getUserBySlug(slug).then(
           (userProfileResponse)=>{
             const {department_roles, profile} = userProfileResponse;
             const viewedUser = { ...profile, ...profile.user};
             delete viewedUser.user
               this.setState({ viewedUser, isFetching, department_roles })
               console.log({department_roles})
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
     *
     * @param {*} modalName
     */
    resetForm = ()=> {
        const createUserForm = {
            name: "",
            description: "",
          }
          this.setState({createUserForm})

    }
    getUserStatusClass = status => {
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


      render() {

        let itemIndex = 0;
        const { viewedUser, department_roles, backgroundColors } = this.state;

        const setIndex = (departmentIndex) => {
          itemIndex = departmentIndex;
          if(itemIndex > 7){
            itemIndex = 0;
          }
          const backgroundColor = backgroundColors[itemIndex]
          return backgroundColor;
        }
        return (
          <div>
            <Breadcrumb
              routeSegments={[
                { name: "Dashboard", path: "/dashboard" },
                { name: "User Profile", path: `/dashboard/user-profile/${viewedUser?.slug}` },
                { name: `${viewedUser?.first_name ? viewedUser?.first_name + ' '+ viewedUser?.last_name : ''}` }
              ]}
            ></Breadcrumb>

            <div className="card user-profile o-hidden mb-4">
              <div
                className="header-cover"
                style={{
                  backgroundImage: "url(/assets/images/user-depts_bg.png)"
                }}
              ></div>
              <div className="user-info">
                {/* <img
                  className="profile-picture avatar-lg mb-2"
                  src="/assets/images/faces/1.jpg"
                  alt=""
                /> */}
                <span className='initials-md'>{this.setFirstLetter(viewedUser?.first_name)}{this.setFirstLetter(viewedUser?.last_name)}</span>

              <p className="m-0 text-24">{viewedUser?.username || ''}</p>
              <p className="text-muted m-0">{viewedUser?.user_type}</p>
              </div>
              <div className="card-body pt-4">
                <Tabs
                  defaultActiveKey="General"
                  className="justify-content-center profile-nav mb-4"
                >

                  <Tab eventKey="General" title="General">
                    <h4>Bio</h4>
                    <p>

                    {
                      viewedUser?.first_name ? (
                        viewedUser?.bio || `${viewedUser?.first_name} ${viewedUser?.last_name} is currently an
                        ${viewedUser?.is_active ? 'active' : 'inactive'} user and last logged in on ${utils.formatDate(viewedUser?.last_login)}.`
                      ):(
                        null
                      )
                    }
                    </p>
                    <hr />
                    <div className="row">
                      <div className="col-md-4 col-6">
                        <div className="mb-4">
                          <p className="text-primary mb-1">
                            <i className="i-Calendar text-16 mr-1"></i> <b>First Name</b>
                          </p>
                          <span>{viewedUser?.first_name}</span>
                        </div>
                        <div className="mb-4">
                          <p className="text-primary mb-1">
                            <i className="i-Edit-Map text-16 mr-1"></i> <b>Last Name</b>
                          </p>
                          <span>{viewedUser?.last_name}</span>
                        </div>
                        <div className="mb-4">
                          <p className="text-primary mb-1">
                            <i className="i-Globe text-16 mr-1"></i> <b>User Type</b>
                          </p>
                          <span>Staff</span> {
                            viewedUser.is_superuser ? (
                              <span className='badge badge-danger'>super user</span>
                            ):(
                              null
                            )
                          }
                        </div>
                      </div>
                      <div className="col-md-4 col-6">
                        <div className="mb-4">
                          <p className="text-primary mb-1">
                            <i className="i-MaleFemale text-16 mr-1"></i> <b>Date Joined</b>
                          </p>
                          <span>{utils.formatDate(viewedUser?.date_joined)}</span>
                        </div>
                        <div className="mb-4">
                          <p className="text-primary mb-1">
                            <i className="i-MaleFemale text-16 mr-1"></i> <b>Email</b>
                          </p>
                          <span><a className='underline' href={`mailto:${viewedUser?.email}`}>{viewedUser?.email}</a></span>
                        </div>
                        <div className="mb-4">
                          <p className="text-primary mb-1">
                            <i className="i-Cloud-Weather text-16 mr-1"></i>
                          <b>Profile url</b>
                          </p>
                          <span><code>{window.location.href}</code></span>
                        </div>
                      </div>
                      <div className="col-md-4 col-6">
                        <div className="mb-4">
                          <p className="text-primary mb-1">
                            <i className="i-Business-Man text-16 mr-1"></i>
                          <b>Status</b>
                          </p>
                          <span className={`badge badge-${viewedUser?.is_active ? 'success':'danger'}`}>
                            {
                              viewedUser?.is_active ? 'Active':'Inactive'
                            }
                          </span>
                        </div>
                        <div className="mb-4">
                          <p className="text-primary mb-1">
                            <i className="i-Conference text-16 mr-1"></i>
                          <b>Last Login</b>
                          </p>
                          <span>{utils.formatDate(viewedUser?.last_login)}</span>
                        </div>
                        <div className="mb-4">
                          <p className="text-primary mb-1">
                            <i className="i-Home1 text-16 mr-1"></i> <b>No. of Profiles</b>
                          </p>
                          <span>{department_roles.length}</span>
                        </div>
                      </div>
                    </div>

                  </Tab>


                                    <Tab eventKey="Profiles" title="Profile(s)">
                                      <div className="row">
                                        {
                                          department_roles.map((departmentRole, index)=>{
                                              return (

                                                <div className={`col-md-4`} key={departmentRole?.id}>
                                                  <div className={`card  mb-3 shadow text-white bg-${setIndex(index)}`}>
                                                    <div className="card-title pt-2 pl-3">
                                                      <h4 className="pt-2 text-white">{departmentRole?.department?.name} ({departmentRole?.department?.code})</h4>
                                                    <p className="card-text text-white">
                                                        {departmentRole?.department.description}
                                                      </p>
                                                  </div>
                                                  <div className='text-centerx pl-3'>
                                                    <h4 className='text-white'>AS</h4>
                                                  </div>
                                                    <div className="card-body">
                                                      <h4 className="text-white">
                                                        <b>Role:</b> {departmentRole?.role.name}
                                                      </h4>
                                                      <p className="card-text">
                                                        {departmentRole?.role.description}
                                                      </p>
                                                    </div>

                                                  </div>

                                                </div>

                                              )
                                            })
                                        }
                                      </div>
                                    </Tab>

                  <Tab eventKey="Stand-ins" title="Hand-Overs">


                      <div className='row'>
                        <div className='col-md-12 pr-4 pb-2'>
                          <StandInRequest userSlug={this.props.match.params.slug}/>
                        </div>
                      </div>

                    <div className="row">
                      <div className="col-md-3">
                        <div className="card card-profile-1 mb-4">
                          <div className="card-body text-center">
                            <div className="avatar box-shadow-2 mb-3">
                              <img src="/assets/images/faces/16.jpg" alt="" />
                            </div>
                            <h5 className="m-0">Jassica Hike</h5>
                            <p className="mt-0">UI/UX Designer</p>
                            <p>
                              Lorem ipsum dolor sit amet consectetur adipisicing
                              elit. Recusandae cumque.
                            </p>
                            <button className="btn btn-primary btn-rounded">
                              Contact Jassica
                            </button>
                            <div className="card-socials-simple mt-4">
                              <span className="cursor-pointer px-1">
                                <i className="i-Linkedin-2"></i>
                              </span>
                              <span className="cursor-pointer px-1">
                                <i className="i-Facebook-2"></i>
                              </span>
                              <span className="cursor-pointer px-1">
                                <i className="i-Twitter"></i>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="card card-profile-1 mb-4">
                          <div className="card-body text-center">
                            <div className="avatar box-shadow-2 mb-3">
                              <img src="/assets/images/faces/2.jpg" alt="" />
                            </div>
                            <h5 className="m-0">Frank Powell</h5>
                            <p className="mt-0">UI/UX Designer</p>
                            <p>
                              Lorem ipsum dolor sit amet consectetur adipisicing
                              elit. Recusandae cumque.
                            </p>
                            <button className="btn btn-primary btn-rounded">
                              Contact Frank
                            </button>
                            <div className="card-socials-simple mt-4">
                              <span className="cursor-pointer px-1">
                                <i className="i-Linkedin-2"></i>
                              </span>
                              <span className="cursor-pointer px-1">
                                <i className="i-Facebook-2"></i>
                              </span>
                              <span className="cursor-pointer px-1">
                                <i className="i-Twitter"></i>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="card card-profile-1 mb-4">
                          <div className="card-body text-center">
                            <div className="avatar box-shadow-2 mb-3">
                              <img src="/assets/images/faces/3.jpg" alt="" />
                            </div>
                            <h5 className="m-0">Arthur Mendoza</h5>
                            <p className="mt-0">UI/UX Designer</p>
                            <p>
                              Lorem ipsum dolor sit amet consectetur adipisicing
                              elit. Recusandae cumque.
                            </p>
                            <button className="btn btn-primary btn-rounded">
                              Contact Arthur
                            </button>
                            <div className="card-socials-simple mt-4">
                              <span className="cursor-pointer px-1">
                                <i className="i-Linkedin-2"></i>
                              </span>
                              <span className="cursor-pointer px-1">
                                <i className="i-Facebook-2"></i>
                              </span>
                              <span className="cursor-pointer px-1">
                                <i className="i-Twitter"></i>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="card card-profile-1 mb-4">
                          <div className="card-body text-center">
                            <div className="avatar box-shadow-2 mb-3">
                              <img src="/assets/images/faces/4.jpg" alt="" />
                            </div>
                            <h5 className="m-0">Jacqueline Day</h5>
                            <p className="mt-0">UI/UX Designer</p>
                            <p>
                              Lorem ipsum dolor sit amet consectetur adipisicing
                              elit. Recusandae cumque.
                            </p>
                            <button className="btn btn-primary btn-rounded">
                              Contact Jacqueline
                            </button>
                            <div className="card-socials-simple mt-4">
                              <span className="cursor-pointer px-1">
                                <i className="i-Linkedin-2"></i>
                              </span>
                              <span className="cursor-pointer px-1">
                                <i className="i-Facebook-2"></i>
                              </span>
                              <span className="cursor-pointer px-1">
                                <i className="i-Twitter"></i>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Tab>
                </Tabs>
              </div>
            </div>
          </div>
        );
      }

}




export default UserDetailComponent;
