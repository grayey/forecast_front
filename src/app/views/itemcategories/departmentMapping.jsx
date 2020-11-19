import React, { Component, useState, useEffect } from "react"
import { Dropdown, Row, Col, Button, Form, ButtonToolbar, Modal, Accordion, Card  } from "react-bootstrap";

// import SweetAlert from "sweetalert2-react";
import swal from "sweetalert2";
import AppMainService from "../../services/appMainService";
import * as utils from "@utils";
import { Formik } from "formik";
import * as yup from "yup";
import AppNotification from "../../appNotifications";
import {FetchingRecords, BulkTemplateDownload} from "../../appWidgets";
import {FaSpinner, FaEdit, FaQuestion, FaCheck, FaPlusCircle, FaMinusCircle} from "react-icons/fa";


import LaddaButton, {
    XL,
    EXPAND_LEFT,
    EXPAND_RIGHT,
    EXPAND_UP,

    CONTRACT,
  } from "react-ladda";


  export class DepartmentMapping extends Component{

      state = {
          editedIndex:0,
          allItemCategories:[],
          allDepartments:[],
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
           this.getAllItemCategories();
           this.getAllDepartments();
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
       * This method lists all departments
       */
       getAllDepartments = async ()=>{
           let isFetching = false;

          this.appMainService.getAllDepartments().then(
              (departmentsResponse)=>{
                  const allDepartments = departmentsResponse;
                  allDepartments.forEach((department)=>{
                    department['is_saved'] = true;
                    department['is_saving'] = false;
                    department['is_edited'] = false;
                    department['is_open'] = false;
                    department['category_ids'] = department.itemcategories.map(category => category.id)
                  })

                  this.setState({ allDepartments, isFetching })
                  console.log('Departments response', departmentsResponse)
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

      setSaved = (department)=>{
        let { is_saved, is_saving, is_edited } = department;
        const buttonObjects = {
          is_saved:{
            label:"Saved",
            icon:<FaCheck/>,
          c_n:"btn btn_sm btn-info_custom"
          },
          is_saving:{
            label:"Saving",
            icon:<FaSpinner className='spin' />,
            c_n:"btn btn_sm btn-success"
          },
          is_edited:{
            label:"Save",
            icon:<FaQuestion/>,
          c_n:"btn btn_sm btn-warning text-white"
          },

        }
        const btn_key = is_saved ? 'is_saved' : is_saving ? 'is_saving' : 'is_edited';
        const btn_obj = buttonObjects[btn_key]
        return (<>
        <button disabled={!is_edited} className={btn_obj?.c_n} onClick={()=>this.submitAsignment(department)}>{btn_obj?.label} {btn_obj?.icon}</button>
        </>)

      }

      handleSelection = (department, category)=>{
        const { category_ids } = department;
        let { allDepartments } = this.state;
        const c_id = category.id;
        const departmentIndex = allDepartments.findIndex(d => department.id == d.id);
        const d_category_index = category_ids.findIndex(c => c == c_id)
        category_ids.includes(c_id)  ? category_ids.splice(d_category_index, 1) : category_ids.push(c_id);
        department['category_ids'] = category_ids;
        department['is_edited'] = true;
        department['is_saved'] = false;
        allDepartments.splice(departmentIndex, 1, department);
        this.setState({ allDepartments });
      }

      submitAsignment = async(department, index) => {
        const {id, category_ids } = department;
        let { allDepartments } = this.state;
        department['is_saving'] = true;
        department['is_edited'] = false;
        department['is_saved'] = false;
        const departmentIndex = allDepartments.findIndex(d => d.id == department.id)
        allDepartments.splice(departmentIndex, 1, department);
        this.setState({ allDepartments })

        this.appMainService.submitDepartmentCategoriesAssignment(id, category_ids).then(
          (result)=>{
            department['is_saving'] = false;
            department['is_edited'] = false;
            department['is_saved'] = true;
            allDepartments.splice(departmentIndex, 1, department);
            this.setState({ allDepartments })
            new AppNotification({
                msg:`Successfully assigned categories to ${department.name}`,
                type:'success'
              })
          }).catch((error)=>{
            new AppNotification({
                msg:utils.processErrors(error),
                type:'error'
              })
              department['is_saving'] = false;
              department['is_edited'] = true;
              department['is_saved'] = false;
              allDepartments.splice(departmentIndex, 1, department);
              this.setState({ allDepartments })
          })

      }

      toggleAccordion = async (department, index)=>{
        const t_department = JSON.parse(JSON.stringify(department))
        let { allDepartments } = this.state;
        // allAggregates = allAggregates.map((ag)=>{
        //   ag.is_open = false;
        //   return ag;
        // })
        t_department.is_open = !t_department.is_open;

        allDepartments.splice(index, 1, t_department);
        this.setState({ allDepartments });

      }


      render(){
        const { allDepartments, allItemCategories, isFetching } = this.state;
      return (

        <>
        <div className="breadcrumb">
            <h1>Department Items Mapping</h1>
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
                      <h4 className="card-title mb-3">Assign item categories to departments.</h4>
                    {
                      allDepartments. length ? allDepartments.map((department, index)=>{

                        return(

                                                <Card key={department?.id} className="shadow-sm mb-3">
                                                  <Accordion>
                                                    <Card.Header className="d-flex align-items-center justify-content-between">
                                                      <Accordion.Toggle
                                                        className="cursor-pointer mb-0 text-primary"
                                                        as="span"
                                                        eventKey={department?.id?.toString()}
                                                        onClick={()=>this.toggleAccordion(department,index)}
                                                      >
                                                        {department?.name} ({department?.code}) {department?.is_open ? <FaMinusCircle className='text-danger'/> : <FaPlusCircle/> }
                                                      </Accordion.Toggle>
                                                      <div className="d-flex">
                                                        {/* <i className="mx-1 i-Reload"> </i>
                                                        <i className="mx-1 i-Drag"> </i>
                                                        <i className="mx-1 i-Full-Screen-2"></i>
                                                        <i className="mx-1 i-Close-Window"></i> */}

                                                      {this.setSaved(department)}
                                                      </div>
                                                    </Card.Header>
                                                    <Accordion.Collapse eventKey={department?.id?.toString()}>
                                                      <Card.Body>
                                                        <ul className="list-group">
                                                          {
                                                            allItemCategories.map((category)=>{
                                                              const is_checked = department.category_ids.includes(category.id);

                                                              return (
                                                                <>
                                                                <li className="list-group-item shadow-sm">
                                                                  <div className='float-right'>

                                                                    <Form.Check
                                                                      name="category_id"
                                                                      onChange={()=>this.handleSelection(department, category)}
                                                                      value={category.id || ''}
                                                                      checked={is_checked}
                                                                      type="checkbox"
                                                                      id={`${department?.id}_${category?.id}`}
                                                                      label={is_checked ? `remove`:'assign'}
                                                                    />
                                                                  </div>
                                                                  <div className="float-left">
                                                                    {category?.name} ({category?.code})
                                                                  </div>


                                                                </li>

                                                                </>
                                                              )
                                                            })
                                                          }
                                                        </ul>

                                                      </Card.Body>
                                                    </Accordion.Collapse>
                                                  </Accordion>
                                                </Card>

                        )
                      }): (
                        <div className='text-center'>
                          <FetchingRecords  isFetching={isFetching} emptyMsg='No departments listed.'/>

                        </div>
                      )
                    }

                    </div>
                </div>
            </div>
      </div>

        </>

      )
      }


}

export default DepartmentMapping;
