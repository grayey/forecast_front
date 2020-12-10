import React, { Component, useState, useEffect } from "react"
import { Dropdown, Row, Col, Button,Form, ButtonToolbar,Modal, ProgressBar } from "react-bootstrap";
import { renderToStaticMarkup } from "react-dom/server";

import SweetAlert from "sweetalert2-react";
import swal from "sweetalert2";
import PreparationService from "../../services/preparation.service";
import AppMainService from "../../services/appMainService";
import jwtAuthService from "../../services/jwtAuthService";
import * as utils from "@utils";
import { Formik } from "formik";
import * as yup from "yup";
import AppNotification from "../../appNotifications";
import {FetchingRecords, CustomProgressBar} from "../../appWidgets";
import moment from "moment";
import { RichTextEditor } from "@gull";
import { Link, Redirect, NavLink, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { FaCheck, FaList, FaTimes, FaDotCircle, FaEdit, FaPlus, FaArrowDown, FaDownload, FaEye, FaMinus} from "react-icons/fa";



import LaddaButton, {
    XL,
    EXPAND_LEFT,
    EXPAND_RIGHT,
    EXPAND_UP,

    CONTRACT,
  } from "react-ladda";

export class DepartmentAggregatesApprovalComponent extends Component{

    state = {
        navigate: false,
        navigationUrls:{
          create:true,
          view_entries:false
        },
        editedIndex:0,
        allDepartmentAggregates:[],
        allApprovals:[],
        showEditModal:false,
        showCreateModal:false,
        showInstructionsModal:false,
        showHistoryModal:false,
        showDetailAlert:false,
        isSaving:false,
        isFetching:true,
        canCreate:false,
        firstVersion:{},
        active_version:{},
        activeBudgetCycle:{},
        single_department:{},
        entryTypes:[
          "PRINCIPAL",

        ], //dummy entry type
        historyDetail:{},
        groupedEntries:[],
        saveMsg:'Save',
        updateMsg:'Update',
        editedDepartmentAggregate: {},
        viewedDepartmentAggregate:{},
        createDepartmentAggregateForm: {
            year: "",
            start_date: "",
            end_date: "",
            currency_conversion_rate: "",
            instructions: "",
          },
          updateDepartmentAggregateForm: {
            year: "",
            start_date: "",
            end_date: "",
            currency_conversion_rate: "",
            instructions: "",
          },
          availableYears:[],
          activeDepartmentRole:{}

    }
    preparationService;




    constructor(props){
        super(props)
        this.preparationService = new PreparationService();
        this.appMainService = new AppMainService();
    }

    componentDidMount = async () =>{
       const activeDepartmentRole = jwtAuthService.getActiveDepartmentRole();
       await this.setState({ activeDepartmentRole })
      // this.getAllDepartmentAggregates();
         this.getAllDepartmentAggregatesByActiveVersion();
         this.getAllVersionCodes();
         this.getAllApprovals();
    }

    // componentWillReceiveProps(nextProps){
    //   const { activeBudgetCycle } = nextProps.active_budget_cycle;
    //   if(activeBudgetCycle.id != this.props.active_budget_cycle.id){
    //     this.getAllDepartmentAggregatesByActiveVersion();
    //   }
    // }

    /**
     *
     * @param {*} event
     * @param {*} errors
     * @param {*} form
     */

    handleChange = (event, form='create') => {
        const {createDepartmentAggregateForm, updateDepartmentAggregateForm} = this.state
        if(form=='create'){
            createDepartmentAggregateForm[event.target.name] = event.target.value;
        }else if(form=='edit'){
            updateDepartmentAggregateForm[event.target.name] = event.target.value;
        }
        this.setState({ createDepartmentAggregateForm, updateDepartmentAggregateForm });
    }

    handleRichEditorChange = (html, form='create') => {
      const {createDepartmentAggregateForm, updateDepartmentAggregateForm} = this.state
      if(form=='create'){
        createDepartmentAggregateForm['instructions'] = html;
      }else{
        updateDepartmentAggregateForm['instructions'] = html;
      }
      this.setState({ createDepartmentAggregateForm, updateDepartmentAggregateForm });

    }

    /**
     * This method lists all versioncodes
     */
     getAllVersionCodes = async ()=>{
        this.appMainService.getAllVersionCodes().then(
            async(versioncodesResponse)=>{
                // const allVersionCodes = versioncodesResponse;
                const firstVersion = versioncodesResponse.find(v => v.step == 1);
                this.setState({firstVersion})
            }
        ).catch((error)=>{
          console.error('Version Error', error)
        })
    }
    /**
   * This method lists all approvals
   */
   getAllApprovals = async ()=>{

      this.appMainService.getAllApprovals().then(
          (approvalsResponse)=>{
              const allApprovals = approvalsResponse;
              this.setState({ allApprovals })
              console.log('Approvals response', approvalsResponse)
          }
      ).catch((error)=>{
          // const errorNotification = {
          //     type:'error',
          //     msg:utils.processErrors(error)
          // }
          console.log('Error', error)
      })
  }


    getAllDepartmentAggregatesByActiveVersion = async() =>{

      let isFetching = true;
      const { activeDepartmentRole } = this.state
      const activeBudgetCycle  = localStorage.getItem('ACTIVE_BUDGET_CYCLE') ? JSON.parse(localStorage.getItem('ACTIVE_BUDGET_CYCLE')) : {};
      const { active_version } = activeBudgetCycle;
      const budgetCycleId = activeBudgetCycle.id;
      const ACTIVE_VERSION_ID = active_version ? active_version.id : null;
      const { department, role } = jwtAuthService.getActiveDepartmentRole();
      const { approval } = role;
      const DEPARTMENT_ID = approval && approval.approval_type == 'SINGLE_DEPARTMENTAL' ? department.id : null;
      const single_department = DEPARTMENT_ID ? department : {};
      await this.setState({ isFetching, active_version, activeBudgetCycle, single_department })
     this.preparationService.getAllDepartmentAggregatesByActiveVersion(ACTIVE_VERSION_ID, DEPARTMENT_ID).then(
         async (departmentaggregatesResponse)=>{
            isFetching = false;
            const { department_aggregates, budget_versions } = this.buildGroupedEntries(departmentaggregatesResponse);
            const version_exists = !!budget_versions.find(version => version.id == ACTIVE_VERSION_ID);

            let canCreate = !version_exists; // cannot create if version exists

           const allDepartmentAggregates = department_aggregates.reverse();
           await  this.setState({ allDepartmentAggregates, isFetching, canCreate });

         }
     ).catch((error)=>{
        isFetching = false;
         this.setState({isFetching})
         const errorNotification = {
             type:'error',
             msg:utils.processErrors(error)
         }
         new AppNotification(errorNotification)
         // console.log('Error', error)
     })
    }


    /**
     * This method lists all departmentaggregates
     */
     getAllDepartmentAggregates = async ()=>{
         let isFetching = false;

        this.preparationService.getAllDepartmentAggregates().then(
            async (departmentaggregatesResponse)=>{
              const { department_aggregates, budget_versions } = this.buildGroupedEntries(departmentaggregatesResponse);
             const allDepartmentAggregates = department_aggregates.reverse();

             // const version_exists = !!budget_versions.find(version => version.id == ACTIVE_VERSION_ID);
             // let canCreate = !version_exists; // cannot create if version exists

              await  this.setState({ allDepartmentAggregates, isFetching });

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
     * @type {[type]}
     */
     getFutureYears = (year, count=10)=>{
      const futureYears = [];
      let i = 0;
      while (i < count){
        futureYears.push(+year + i);
        i++;
      }
      return futureYears;

    }

    downloadHistoryDetail = async (histo)=>{

      console.log("HISTOOO", histo);
      this.setDetailLines(histo);



    }

    setDetailLines = (histo)=> {
      let { body, action, user, role, user_department, created_at } = histo;
      body = JSON.parse(body);
      const { total_naira_portion, total_currency_portion, total_functional_naira, total_functional_currency } = body;


      let { detailLInes, setDetailLinesAlert } = this.state;
      const { entries, editions, initial_totals } = body;
      const action_types ={
        "0":"Created",
        "1":"Updated",
        "4":"Submitted",
      }
      const edition_types = {
        "ADDED":{
          'bg':"success text-white",
          'icon':<FaArrowDown/>,
          'name':'Add',
          'operator':<FaPlus/>

        },
        "EDITED":{
          'bg_old':"pink text-white",
          'bg_new':"info_custom text-white",
          'operator_old':<FaMinus className="minus"/>,
        'operator_new':<FaPlus/>,
          'icon':<FaEdit/>,
          'name':'Edit'

        },
        "DELETED":{
          'bg':"danger text-white",
          'icon':<FaTimes/>,
        'name':'Deleted',
        'operator':<FaMinus className="minus"/>
        }
      }
      const action_type = action_types[action.toString()];
      const text_color = action_type == "Created" ? "dark": action_type == "Updated" ? "primary":"success";

      const header = `Entries <span class="text-${text_color}">${action_type}</span> by ${user.first_name} ${user.last_name} <small>(${user.email})</small>, ${role.name} in ${user_department.name} <small>(${user_department.code})</small> on ${utils.formatDate(created_at)}.`

       detailLInes =  (
         <>
         {
           action_type =="Updated" ? (
             <div>
               <div className="float-right p-1">
                 <small>Legend:</small>
               <span className="badge badge-success mr-1"><small>Added <FaArrowDown/></small></span>
             <span className="badge badge-danger mr-1"><small>Deleted <FaTimes/></small></span>
           <span className="badge badge-info_custom mr-1"><small>New Value <FaEdit/></small></span>
             <span className="badge badge-pink_custom"><small>Old Value <FaEdit/></small></span>

               </div>
             </div>
           ): null
         }



         <div className="table-responsive">
           <table className="table display table-striped table-hover" id="zero_configuration_table" style={{"width":"100%"}}>
               <thead>
                   <tr className="ul-widget6__tr--sticky-th line_entries">
                     <th>
                        #
                      </th>

                      <th>
                       Category
                      </th>

                      <th>
                       Cost item
                      </th>

                      <th>
                         Type
                      </th>

                      <th>
                        Description
                      </th>
                      <th>
                        Unit value
                      </th>
                      <th>
                        Quantity
                      </th>

                      <th className="text-right">
                        Naira part (&#x20a6;)
                      </th>
                      <th className="text-right">
                        USD part ($)
                      </th>
                      <th className="text-right">
                        Total in Naira (&#x20a6;)
                      </th>
                      <th className="text-right">
                        Total in USD ($)
                      </th>


                   </tr>
               </thead>
               <>
                 {
                   action_type == "Updated" ?

                   (
                     <tbody>
                       {
                         editions.length ? editions.map((edition, index)=>{

                           const { action, old } = edition;
                           const new_entry = edition.new;
                           const row_span = old ? 2 : 1;
                           const edition_type = edition_types[action];


                           return (
                             <>
                             <tr key={`edition_${index}`} className={`bg-${action == 'EDITED' ? edition_type?.bg_new : edition_type?.bg}`}>
                               <td rowSpan={row_span} className='bg-white text-dark'>
                                 <div className={old ? "mt-3":""}>
                                   <b>{index+1}</b>. <span className={`text-${action == 'EDITED' ? 'primary': edition_type?.bg}`}>{edition_type?.icon}</span>
                               </div>
                             </td>

                               <td>
                                 <span className="operatorx float-left">{action == 'EDITED' ? edition_type?.operator_new : edition_type?.operator} </span>
                                 {new_entry?.costitem?.category?.name} <small>({new_entry?.costitem?.category?.code})</small>
                               </td>
                               <td>
                                 {new_entry?.costitem?.name} <small>({new_entry?.costitem?.code})</small>
                               </td>

                               <td>
                                 {new_entry?.entity}
                               </td>

                               <td className="text-center">
                                 <a onClick={()=>this.showDescription(index, new_entry?.description)}  className="text-primary long-view">View</a>
                               </td>
                               <td>
                                 {utils.formatNumber(new_entry?.unit_value, false)}
                               </td>
                               <td>
                                 {utils.formatNumber(new_entry?.quantity, false)}

                               </td>
                               <td className="text-right">
                                 {utils.formatNumber(new_entry?.naira_portion)}

                               </td>
                               <td className="text-right">
                                 {utils.formatNumber(new_entry?.currency_portion)}

                               </td>

                               <td className="text-right">
                               {utils.formatNumber(new_entry?.total_naira)}
                               </td>
                               <td className="text-right">
                                 {utils.formatNumber(new_entry?.total_currency)}
                               </td>


                             </tr>
                             {
                               old ? (
                               <tr className={edition_type?.bg_old}>
                                 <td>
                                   <span className="operatorx float-left">{edition_type?.operator_old} </span>
                                 {old?.costitem?.category?.name} xdcdsdsd <small>({old?.costitem?.category?.code}) </small>
                                 </td>
                                 <td>
                                   {old?.costitem?.costitem?.name} xdcdsdsd <small>({old?.costitem?.costitem?.code})</small>
                                 </td>

                                 <td>
                                   {old?.entity}
                                 </td>

                                 <td className="text-center">
                                   <a onClick={()=>this.showDescription(index, old?.description)}  className="text-primary long-view">View</a>
                                 </td>
                                 <td>
                                   {utils.formatNumber(old?.unit_value, false)}
                                 </td>
                                 <td>
                                   {utils.formatNumber(old?.quantity, false)}

                                 </td>
                                 <td className="text-right">
                                   {utils.formatNumber(old?.naira_portion)}

                                 </td>
                                 <td className="text-right">
                                   {utils.formatNumber(old?.currency_portion)}

                                 </td>

                                 <td className="text-right">
                                 {utils.formatNumber(old?.total_naira)}
                                 </td>
                                 <td className="text-right">
                                   {utils.formatNumber(old?.total_currency)}
                                 </td>
                               </tr>
                             ) : null
                             }
                           </>
                           )

                         }) : (
                           <tr>
                               <td className='text-center' colSpan='13'>
                               <FetchingRecords emptyMsg={`No changes were made.`} isFetching={this.state.isFetching}/>
                               </td>
                           </tr>
                         )
                       }

                     </tbody>
                   )

                    : (

                     <tbody>
                     {
                       entries.length ?  entries.map( (departmentaggregate, index)=>{

                             return (
                                 <tr key={index} className={'line_entries'}>
                                     <td>
                                         <b>{index+1}</b>.
                                     </td>
                                     <td>
                                       {departmentaggregate?.costitem?.category?.name} <small>({departmentaggregate?.costitem?.category?.code})</small>
                                     </td>
                                     <td>
                                       {departmentaggregate?.costitem?.name} <small>({departmentaggregate?.costitem?.code})</small>
                                     </td>

                                     <td>
                                       {departmentaggregate?.entity}
                                     </td>

                                     <td className="text-center">
                                       <a onClick={()=>this.showDescription(index, departmentaggregate?.description)}  className="text-primary long-view">View</a>
                                     </td>
                                     <td>
                                       {utils.formatNumber(departmentaggregate?.unit_value, false)}
                                     </td>
                                     <td>
                                       {utils.formatNumber(departmentaggregate?.quantity, false)}

                                     </td>
                                     <td className="text-right">
                                       {utils.formatNumber(departmentaggregate?.naira_portion)}

                                     </td>
                                     <td className="text-right">
                                       {utils.formatNumber(departmentaggregate?.currency_portion)}

                                     </td>

                                     <td className="text-right">
                                     {utils.formatNumber(departmentaggregate?.total_naira)}
                                     </td>
                                     <td className="text-right">
                                       {utils.formatNumber(departmentaggregate?.total_currency)}
                                     </td>


                                 </tr>
                             )


                         }) :
                         (
                             <tr>
                                 <td className='text-center' colSpan='13'>
                                 <FetchingRecords emptyMsg="No entries added." isFetching={this.state.isFetching}/>
                                 </td>
                             </tr>
                         )
                     }

                     </tbody>

                   )
                 }
               </>

               <tfoot className="line_entries_footer">
                {
                  action_type == "Updated" ? (
                <>
                <tr className="line_entries">
                <th rowSpan='2'>
                 <div className="mt-4">
                   TOTALS
                 </div>
                </th>

                <th colSpan="6">

                  <div className="text-center"><small><del>INITIAL</del></small></div>
                  <div className="dash w-100"></div>

                </th>

                <th className="text-right">
                  <del>{utils.formatNumber(initial_totals?.total_naira_portion)}</del>
                  <div className="dash w-100"></div>
                </th>
                <th className="text-right">
                 <del> {utils.formatNumber(initial_totals?.total_currency_portion)} </del>
                  <div className="dash w-100"></div>


                </th>
                <th className="text-right">
                    <del> {utils.formatNumber(initial_totals?.total_functional_naira)} </del>
                  <div className="dash w-100"></div>


                </th>
                <th className="text-right">
                    <del> {utils.formatNumber(initial_totals?.total_functional_currency)}</del>
                  <div className="dash w-100"></div>


                </th>


                </tr>

                  <tr className="line_entries entries_footer">


                  <th colSpan="6">

                     <div className="text-center w-100"><small>FINAL</small></div>
                   {/* <div className="dash-2 w-100"></div> */}

                  </th>

                  <th className="text-right">
                    {utils.formatNumber(total_naira_portion)}
                    <div className="dash-2 w-100"></div>
                  </th>
                  <th className="text-right">
                    {utils.formatNumber(total_currency_portion)}
                    <div className="dash-2 w-100"></div>


                  </th>
                  <th className="text-right">
                    {utils.formatNumber(total_functional_naira)}
                    <div className="dash-2 w-100"></div>


                  </th>
                  <th className="text-right">
                    {utils.formatNumber(total_functional_currency)}
                    <div className="dash-2 w-100"></div>


                  </th>


                  </tr>
                </>

                  ) :(
                    <tr className="line_entries entries_footer">

                      <th>
                         <div className="text-center w-100">TOTAL</div>
                      </th>


                    <th colSpan="6">


                     <div className="dash w-100"></div>

                    </th>

                    <th className="text-right">
                      {utils.formatNumber(total_naira_portion)}
                      <div className="dash-2 w-100"></div>
                    </th>
                    <th className="text-right">
                      {utils.formatNumber(total_currency_portion)}
                      <div className="dash-2 w-100"></div>


                    </th>
                    <th className="text-right">
                      {utils.formatNumber(total_functional_naira)}
                      <div className="dash-2 w-100"></div>


                    </th>
                    <th className="text-right">
                      {utils.formatNumber(total_functional_currency)}
                      <div className="dash-2 w-100"></div>


                    </th>


                    </tr>
                  )
                }


               </tfoot>
           </table>
         </div>
         </>


  )


      swal.fire({
          title: `<small><em>${header}</em></small>`,
          html:renderToStaticMarkup(detailLInes),
          width:"1150px",
          icon: null,
          type: "question",
          showCancelButton: true,
          confirmButtonColor: "#007BFF",
          cancelButtonColor: "#6c757d",
          confirmButtonText: "Download as file",
          cancelButtonText: "Close"
        }).then(
          (result)=>{
            if(result.value){
              console.log("Download details")
            }

        }).catch(
          (error)=>{
          console.log("Error", error)
        })

      // this.setState({ detailLInes, setDetailLinesAlert:true });

      console.log("BODYY ", body, "ACTION", action);
    }



    buildGroupedEntries = (allDepartmentAggregates) => {

      const { entryTypes } = this.state;
      const activeDepartmentRole = jwtAuthService.getActiveDepartmentRole();
      const { role } = activeDepartmentRole;
      console.log('BUIKLSLLS',role, activeDepartmentRole)
      const { approval } = role ;
      const budgetVersions = [];
      allDepartmentAggregates.forEach((aggregate) => {

        const { approval_stage } = aggregate;
        const a_stage = approval_stage ? approval_stage.stage : "x";
        const r_stage = approval ? approval.stage : "y";
        aggregate['is_my_stage'] = a_stage == r_stage;
        const { budgetversion } = aggregate;
        budgetVersions.push(budgetversion)
        aggregate['summary'] = {};
        const entries = aggregate['entries']
        entryTypes.forEach((entryType)=>{
          aggregate['summary'][entryType] = this.buildEntriesByType(entries, entryType)
        })
      })

      return {
        "department_aggregates":allDepartmentAggregates,
        "budget_versions":budgetVersions
      };
    }

    buildEntriesByType = (entries, entryType)=>{
      const summaryItem = {
        total_naira_part:0,
        total_currency_part:0,
        total_in_naira:0,
        total_in_currency:0,
      };
      entries.forEach((entry)=>{
        if(entry.entity == entryType){
          summaryItem.total_naira_part += entry.naira_portion
          summaryItem.total_currency_part += entry.currency_portion
          summaryItem.total_in_naira+= entry.total_naira
          summaryItem.total_in_currency += entry.total_currency
        }
      })
      return summaryItem;
    }

    /**
     * Filter years
     * @type {[type]}
     */

    filterYears = async ()=>{
      const { allDepartmentAggregates } = this.state;
      const futureYears = this.getFutureYears(moment().year());
      const budgetYears = allDepartmentAggregates.map(departmentAggregate => +departmentAggregate.year);
      const availableYears = futureYears.filter(yr => !budgetYears.includes(+yr)).sort();
      this.setState({availableYears});
    }

    setProgressBar = (departmentaggregate)=>{
      const { approval_stage, entries_status, is_my_stage } = departmentaggregate;
      const { allApprovals } = this.state;
      let padding = 0; // so that the progress bar displays
      let prefix = entries_status < 3 ? "Awaiting" : "Completed";
      // let shift = entries_status < 3 ? 1 : 0;
      let progressObject = {
        percentage:0,
        variant:null,
        text:"Submission"
      };
      // text-${progressObject.percentage < 100 ? 'info':'success'}
      if(approval_stage){
        const percentage = Math.round(approval_stage.stage/(allApprovals.length) * 100 );
        const variant = percentage < 100 ? "info_custom" : "success";
        const text = approval_stage.description;
        progressObject = { percentage,variant,text }
        padding = entries_status < 3 ? 5 : 100; // once approved/discarded fill the progress bar
      }
      const text_variant = is_my_stage? "success text-bold": "";

      return (
        <div>
        <ProgressBar
          now={progressObject.percentage + padding}
          label={`${progressObject.percentage}%`}
          animated
          striped
          variant={progressObject.variant}
        ></ProgressBar>
      <p className={`text-center text-${text_variant}`}>
          <small><b><em>{prefix} {progressObject.text}</em></b></small>
        </p>
      </div>
      )

    }

    setEntriesStatus = (departmentAggregate)=>{

      const { entries_status, is_my_stage, is_archived } = departmentAggregate;
      const key = entries_status ? entries_status.toString() : "0";
      const variants = {
        "0":"primary",
        "1":"info_custom",
        "2":"success",

      }
      const statuses = {
        "0":"DRAFT",
        "1":"SUBMITTED",
        "2":"APPROVED",
      }

      return(
        <>
        {
          is_archived ? (
            <span>
              <span className={`badge badge-${variants[key]}`}><del>{statuses[key] } </del></span>
              <span className="badge badge-secondary_custom ml-1">ARCHIVED</span>
            </span>
          ):(
            <span className={`badge badge-${variants[key]}`}>{statuses[key] }</span>

          )

        }

        </>

        )

    }

    viewHistoryDetail = async (histo) =>{

      const historyDetail = histo;
      const action = histo.action == 2? "Approval" : "Rejection"
      historyDetail.title = `${histo.role.name} ${action} ${utils.formatDate(histo.created_at)}`
      await this.setState({ historyDetail })
      this.toggleAlert();
    }


    setAction = (action_type) =>{
      const action_types = {
        "0":{
          "text":"Created",
          "icon":<FaPlus/>,
        "variant":"secondary_custom"
      },
      "1":{
        "text":"Updated",
        "icon":<FaEdit/>,
      "variant":"primary"
        },
    "2":{
      "text":"Approved",
      "icon":<FaCheck/>,
    "variant":"success"
      },
    "3":{
      "text":"Rejected",
      "icon":<FaTimes/>,
    "variant":"danger"
      },
    "4":{
      "text":"Submitted",
      "icon":<FaArrowDown/>,
    "variant":"info_custom"
      },
      }
      const action = action_types[action_type.toString()] || {};

      return (
        <>
          <span className={`badge badge-${action.variant}`}>{action.text} {action.icon}</span>
        </>
      )

    }

    toggleAlert = ()=>{
      let { showDetailAlert } = this.state;
      showDetailAlert = !showDetailAlert;
      this.setState({showDetailAlert});
    }



    /**
     * This method creates a new departmentaggregate
     */
    createDepartmentAggregate = async ()=>{
        const {createDepartmentAggregateForm, allDepartmentAggregates, firstVersion} = this.state;
        let isSaving = true;
        let saveMsg = 'Saving';
        this.setState({isSaving, saveMsg})
        this.preparationService.createDepartmentAggregate(createDepartmentAggregateForm).then(
            async (departmentaggregateData) => {
                isSaving = false;
                saveMsg = 'Save';
                departmentaggregateData['active_version'] = firstVersion //making sure
                allDepartmentAggregates.unshift(departmentaggregateData)
              await this.setState({ allDepartmentAggregates, isSaving, saveMsg })

                const successNotification = {
                    type:'success',
                    msg:`${departmentaggregateData.year} successfully created!`
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

    approveDepartmentAggregate = (departmentaggregate)=>{

      console.log("Submitted Aggregate",departmentaggregate)
      const { budgetcycle, budgetversion, department } = departmentaggregate;
      const { version_code } = budgetversion;
      const apostrophe = department.name.toLocaleLowerCase().endsWith('s')? `'`:`'s`;
      const msg = `${department.name}${apostrophe} ${budgetcycle.year} ${version_code.name} (${version_code.code})`

      swal.fire({
             title: `<small>Submit&nbsp;<em><b>${msg}</b></em> for approval?</small>`,
             text: "It will leave draft stage and cannot be edited. A notification will be sent.",
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
             let { allDepartmentAggregates } = this.state
               this.preparationService.approveDepartmentAggregate(departmentaggregate).then(
                 async (submittedAggregate) => {
                     const aggregateIndex = allDepartmentAggregates.findIndex(r=> r.id == departmentaggregate.id)
                      allDepartmentAggregates.splice(aggregateIndex, 1, submittedAggregate);
                      allDepartmentAggregates = this.buildGroupedEntries(allDepartmentAggregates)['department_aggregates'];
                   await this.setState({ allDepartmentAggregates });
                     const successNotification = {
                         type:'success',
                         msg:`${msg} successfully submitted!`
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


    viewInstructions = (viewedDepartmentAggregate) => {
      this.setState({viewedDepartmentAggregate});
      this.toggleModal('instructions');

    }


    /**
     * This method updates a new departmentaggregate
     */
    updateDepartmentAggregate = async ()=>{

        let {updateDepartmentAggregateForm, allDepartmentAggregates, editedDepartmentAggregate} = this.state;
        let isSaving = true;
        let updateMsg = 'Updating';
        this.setState({isSaving, updateMsg})
        this.preparationService.updateDepartmentAggregate(updateDepartmentAggregateForm, editedDepartmentAggregate.id).then(
            (updatedDepartmentAggregate)=>{
                updatedDepartmentAggregate.temp_flash = true
                isSaving = false;
                updateMsg = 'Update';
                allDepartmentAggregates.splice(this.state.editedIndex, 1, updatedDepartmentAggregate)
                this.setState({ allDepartmentAggregates, isSaving, updateMsg })
                const successNotification = {
                    type:'success',
                    msg:`Budget cycle ${updatedDepartmentAggregate.year} successfully updated!`
                }
                new AppNotification(successNotification)
                this.toggleModal('edit');

             setTimeout(async ()=>{
                    updatedDepartmentAggregate.temp_flash = false
                    allDepartmentAggregates.splice(this.state.editedIndex, 1, updatedDepartmentAggregate)
                    await this.setState({ allDepartmentAggregates, isSaving, updateMsg })
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
        let {showEditModal, showCreateModal, showInstructionsModal, showHistoryModal } = this.state;
        if(modalName == 'create'){
            showCreateModal = !showCreateModal;
        }else if(modalName == 'edit'){
            showEditModal = !showEditModal
        }else if(modalName=='instructions'){
          showInstructionsModal = !showInstructionsModal
        }
        else if(modalName=='history'){
          showHistoryModal = !showHistoryModal
        }
        this.setState({ showEditModal, showCreateModal, showInstructionsModal, showHistoryModal })

    }



    /**
     *
     * This method sets the departmentaggregate to be edited
     *  and opens the modal for edit
     *
     */
    editDepartmentAggregate = (editedDepartmentAggregate) => {
        const updateDepartmentAggregateForm = {...editedDepartmentAggregate}
        const {availableYears} = this.state;
        //
        availableYears.push(+editedDepartmentAggregate.year);
        availableYears.sort();
        //
        const editedIndex = this.state.allDepartmentAggregates.findIndex(departmentaggregate => editedDepartmentAggregate.id == departmentaggregate.id)
        this.setState({editedDepartmentAggregate, editedIndex, updateDepartmentAggregateForm, availableYears});
        this.toggleModal('edit')
    }

    viewAggregateHistory = (viewedDepartmentAggregate) => {
      this.setState( {showHistoryModal:true, viewedDepartmentAggregate});


    }

    /**
     *
     * @param {*} departmentaggregate
     * This method toggles a departmentaggregate's status
     */
    toggleDepartmentAggregate = (departmentaggregate)=>{
        const toggleMsg = departmentaggregate.is_current? "Disable":"Enable";
        const gL = departmentaggregate.is_current? ".":", and notifications will be sent out";


        swal.fire({
            title: `<small>${toggleMsg}&nbsp;<b>${departmentaggregate.year}</b>?</small>`,
            text: `Capture will be ${toggleMsg}d${gL}`,
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
                let { allDepartmentAggregates } = this.state
                const toggleIndex = allDepartmentAggregates.findIndex(r => r.id == departmentaggregate.id)
                // departmentaggregate.status = !departmentaggregate.status;

              this.preparationService.toggleDepartmentAggregate(departmentaggregate).then(
                (toggledDepartmentAggregate)=>{
                    allDepartmentAggregates.splice(toggleIndex, 1, toggledDepartmentAggregate)
                    this.setState({ allDepartmentAggregates })
                    const successNotification = {
                        type:'success',
                        msg:`Budget cycle ${toggledDepartmentAggregate.year} successfully ${toggleMsg}d!`
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
     * @param {*} departmentaggregate
     * This method deletes a departmentaggregate
     *
     */
    deleteDepartmentAggregate = (departmentaggregate)=>{
         swal.fire({
                title: `<small>Delete&nbsp;<b>${departmentaggregate.year}</b>?</small>`,
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
                let { allDepartmentAggregates } = this.state
                  this.preparationService.deleteDepartmentAggregate(departmentaggregate).then(
                    async (deletedDepartmentAggregate) => {
                        allDepartmentAggregates = allDepartmentAggregates.filter(r=> r.id !== departmentaggregate.id)
                      await this.setState({ allDepartmentAggregates });
                        const successNotification = {
                            type:'success',
                            msg:`Budget cycle ${departmentaggregate.year} successfully deleted!`
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
        const createDepartmentAggregateForm = {
            name: "",
            description: "",
          }
          this.setState({createDepartmentAggregateForm})

    }

    render(){
      const { navigate, navigationUrls } = this.state;
      const { create_entries, view_entries}  = navigationUrls



        return navigate ? <Redirect to="/preparation/budget-entries/create" /> : (

            <>
                <div className="specific">

                  <SweetAlert
                    show={this.state.showDetailAlert}
                    title={this.state?.historyDetail?.title}
                    html={this.state.historyDetail?.body}
                    onConfirm={this.toggleAlert}
                  />



                                  <Modal show={this.state.showInstructionsModal} onHide={
                                      ()=>{ this.toggleModal('instructions')}
                                      } {...this.props} id='instructions_modal'>
                                      <Modal.Header closeButton>

                                      <Modal.Title>
                                        <img src="/assets/images/logo.png" alt="Logo" className="modal-logo"  />&nbsp;&nbsp;
                                        Instructions for <b>{this.state?.viewedDepartmentAggregate?.year}</b>
                                    </Modal.Title>
                                      </Modal.Header>

                                               <Modal.Body>

                                                 <div dangerouslySetInnerHTML={{__html: this.state.viewedDepartmentAggregate.instructions}} />

                                               </Modal.Body>


                                              <Modal.Footer>




                                                      <LaddaButton
                                                          className="btn btn-secondary_custom border-0 mr-2 mb-2 position-relative"
                                                          loading={false}
                                                          progress={0.5}
                                                          type='button'
                                                          onClick={()=>this.toggleModal('instructions')}

                                                          >
                                                          Close
                                                      </LaddaButton>


                                                      </Modal.Footer>




                                  </Modal>


                                  <Modal size="xl"  show={this.state.showHistoryModal} onHide={
                                      ()=>{ this.toggleModal('history')}
                                      } {...this.props} id='history_modal'>
                                      <Modal.Header closeButton>

                                      <Modal.Title>
                                        <img src="/assets/images/logo.png" alt="Logo" className="modal-logo"  />
                                        &nbsp;&nbsp;
                                         <b>History<FaList/> </b>&nbsp;<em>{this.state?.viewedDepartmentAggregate?.department?.name} ({this.state?.viewedDepartmentAggregate?.department?.code}) <b>::</b> {this.state?.activeBudgetCycle?.year} {this.state?.active_version?.version_code?.name} ({this.state?.active_version?.version_code?.code})</em>
                                    </Modal.Title>
                                      </Modal.Header>

                                               <Modal.Body>

                                                 <div className="table-resonsive">
                                                   <table className="table table-striped table-hover">
                                                     <thead>
                                                       <tr>
                                                         <th>
                                                           User
                                                         </th>
                                                         <th>
                                                            Role
                                                         </th>
                                                         <th>
                                                            Department
                                                         </th>
                                                         <th>
                                                           Action
                                                         </th>
                                                         <th>
                                                           Details
                                                         </th>
                                                         <th>
                                                           Date
                                                         </th>
                                                       </tr>
                                                     </thead>

                                                     <tbody>
                                                       {
                                                         this.state?.viewedDepartmentAggregate?.aggregate_history?.length ?
                                                         this.state?.viewedDepartmentAggregate?.aggregate_history?.map((histo)=>{
                                                           return (
                                                             <tr key={histo.id}>
                                                               <td>
                                                                 {histo?.user?.first_name} {histo?.user?.last_name} <small>({histo?.user?.email})</small>
                                                               </td>

                                                               <td>
                                                                 {histo?.role?.name}
                                                               </td>
                                                               <td>
                                                                 {histo?.user_department?.name} ({histo?.user_department?.code})
                                                               </td>
                                                               <td>
                                                                 {this.setAction(histo?.action)}
                                                               </td>
                                                               <td>
                                                                 {
                                                                   (histo?.action !== 2 && histo?.action !== 3) ?
                                                                   (
                                                                     <a className="underline" href="#" onClick={()=>this.downloadHistoryDetail(histo)}>View <FaList/></a>
                                                                   ) :(
                                                                     <a className="underline" href="#" onClick={()=>this.viewHistoryDetail(histo)}>View <FaEye/></a>
                                                                   )
                                                                 }
                                                                 {/* <div dangerouslySetInnerHTML={{__html: histo?.body }}>

                                                                 </div> */}
                                                               </td>
                                                               <td>
                                                                 {
                                                                   utils.formatDate(histo?.created_at)
                                                                 }
                                                               </td>
                                                             </tr>
                                                           )
                                                         }):
                                                         (
                                                           <tr>
                                                             <td colSpan="6" className="text-center">No history.</td>
                                                           </tr>
                                                         )
                                                       }

                                                     </tbody>

                                                   </table>

                                                 </div>


                                               </Modal.Body>


                                              <Modal.Footer>




                                                      <LaddaButton
                                                          className="btn btn-secondary_custom border-0 mr-2 mb-2 position-relative"
                                                          loading={false}
                                                          progress={0.5}
                                                          type='button'
                                                          onClick={()=>this.toggleModal('history')}

                                                          >
                                                          Close
                                                      </LaddaButton>


                                                      </Modal.Footer>

                                                    </Modal>



                <Modal show={this.state.showEditModal} onHide={
                                                      ()=>{ this.toggleModal('edit')}
                                                      } {...this.props} id='edit_modal'>
                                                      <Modal.Header closeButton>
                                                      <Modal.Title>
                                                        <img src="/assets/images/logo.png" alt="Logo" className="modal-logo"  />&nbsp;&nbsp;

                                                        Update budget cycle <b>{this.state.editedDepartmentAggregate.year}</b>
                                                    </Modal.Title>
                                                      </Modal.Header>

                                                      <Formik
                                                      initialValues={this.state.updateDepartmentAggregateForm}
                                                      validationSchema={this.updateDepartmentAggregateSchema}
                                                      onSubmit={this.updateDepartmentAggregate}
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
                                                                      "col-md-6 mb-2": true,
                                                                      "valid-field":
                                                                          !errors.year && touched.year,
                                                                      "invalid-field":
                                                                          errors.year && touched.year
                                                                      })}
                                                                  >
                                                                      <label htmlFor="departmentaggregate_name">
                                                                          <b>Year<span className='text-danger'>*</span></b>
                                                                      </label>

                                                                    <select
                                                                      className="form-control"
                                                                      id="departmentaggregate_name"
                                                                      placeholder=""
                                                                      name="year"
                                                                      value={values.year}
                                                                      onChange={(event)=>this.handleChange(event, 'edit')}
                                                                      onBlur={handleBlur}
                                                                      required
                                                                      >
                                                                      <option value="">Select year</option>
                                                                      {
                                                                        this.state.availableYears.map((year)=>{
                                                                        return  (<option value={year} key={year}>{year}</option>)
                                                                        })
                                                                      }

                                                                    </select>
                                                                      <div className="valid-feedback"></div>
                                                                      <div className="invalid-feedback">Year is required</div>
                                                                  </div>

                                                                  <div
                                                                      className={utils.classList({
                                                                      "col-md-6 mb-2": true,
                                                                      "valid-field":
                                                                          !errors.currency_conversion_rate && touched.currency_conversion_rate,
                                                                      "invalid-field":
                                                                          errors.currency_conversion_rate && touched.currency_conversion_rate
                                                                      })}
                                                                  >
                                                                      <label htmlFor="departmentaggregate_name">
                                                                          <b>[Currency] Rate<span className='text-danger'>*</span></b>
                                                                      </label>

                                                                      <input
                                                                      type="number"
                                                                      className="form-control"
                                                                      id="currency_conversion_rate"
                                                                      placeholder=""
                                                                      step="0.1"
                                                                      name="currency_conversion_rate"
                                                                      value={values.currency_conversion_rate}
                                                                      onChange={(event)=>this.handleChange(event, 'edit')}
                                                                      onBlur={handleBlur}
                                                                      required
                                                                      />

                                                                      <div className="valid-feedback"></div>
                                                                      <div className="invalid-feedback">[Currency] Rate is required</div>
                                                                  </div>

                                                                  <div
                                                                      className={utils.classList({
                                                                      "col-md-6 mb-2": true,
                                                                      "valid-field":
                                                                          !errors.start_date && touched.start_date,
                                                                      "invalid-field":
                                                                          errors.start_date && touched.start_date
                                                                      })}
                                                                  >
                                                                      <label htmlFor="departmentaggregate_name">
                                                                          <b>Start Date<span className='text-danger'>*</span></b>
                                                                      </label>

                                                                      <input
                                                                      type="date"
                                                                      className="form-control"
                                                                      id="start_date"
                                                                      placeholder=""
                                                                      name="start_date"
                                                                      value={values.start_date}
                                                                      onChange={(event)=>this.handleChange(event, 'edit')}
                                                                      onBlur={handleBlur}
                                                                      required
                                                                      />

                                                                      <div className="valid-feedback"></div>
                                                                      <div className="invalid-feedback">Start Date is required</div>
                                                                  </div>

                                                                  <div
                                                                      className={utils.classList({
                                                                      "col-md-6 mb-2": true,
                                                                      "valid-field":
                                                                          !errors.end_date && touched.end_date,
                                                                      "invalid-field":
                                                                          errors.end_date && touched.end_date
                                                                      })}
                                                                  >
                                                                      <label htmlFor="departmentaggregate_name">
                                                                          <b>End Date<span className='text-danger'>*</span></b>
                                                                      </label>

                                                                      <input
                                                                      type="date"
                                                                      className="form-control"
                                                                      id="end_date"
                                                                      placeholder=""
                                                                      name="end_date"
                                                                      value={values.end_date}
                                                                      onChange={(event)=>this.handleChange(event, 'edit')}
                                                                      onBlur={handleBlur}
                                                                      required
                                                                      />

                                                                      <div className="valid-feedback"></div>
                                                                      <div className="invalid-feedback">End Date is required</div>
                                                                  </div>


                                                                  <div
                                                                      className={utils.classList({
                                                                      "col-md-12 mb-2": true,
                                                                      "valid-field":
                                                                          touched.instructions && !errors.instructions,
                                                                      "invalid-field":
                                                                          touched.instructions && errors.instructions
                                                                      })}
                                                                  >
                                                                      <label htmlFor="edit_departmentaggregate_description">
                                                                           <b>Instructions<span className='text-danger'>*</span></b>
                                                                      </label>



                                                                     <RichTextEditor
                                                                       theme="snow"
                                                                       modules={{
                                                                         toolbar: [
                                                                           [{ size: ["small", false, "large", "huge"] }],
                                                                           ["bold", "italic", "underline", "strike"],
                                                                           [{ list: "ordered" }, { list: "bullet" }],
                                                                           ["clean"]
                                                                         ]
                                                                       }}
                                                                       content={values.instructions}
                                                                       handleContentChange={html =>
                                                                         this.handleRichEditorChange(html, 'edit')
                                                                       }
                                                                       placeholder="insert text here..."
                                                                     />

                                                                      <div className="valid-feedback"></div>
                                                                      <div className="invalid-feedback">
                                                                      Provide instructions
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
                                                                          className={`btn btn-${utils.isValid(this.updateDepartmentAggregateSchema, this.state.editDepartmentAggregateForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
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

                <Modal show={this.state.showCreateModal} onHide={
                    ()=>{ this.toggleModal('create')}
                    } {...this.props} id='create_modal'>
                    <Modal.Header closeButton>
                    <Modal.Title>
                      <img src="/assets/images/logo.png" alt="Logo" className="modal-logo"  />&nbsp;&nbsp;

                      Create Budget Cycle
                    </Modal.Title>
                    </Modal.Header>

                    <Formik
                    initialValues={this.state.createDepartmentAggregateForm}
                    validationSchema={this.createDepartmentAggregateSchema}
                    onSubmit={this.createDepartmentAggregate}
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
                                    "col-md-6 mb-2": true,
                                    "valid-field":
                                        !errors.year && touched.year,
                                    "invalid-field":
                                        errors.year && touched.year
                                    })}
                                >
                                    <label htmlFor="departmentaggregate_name">
                                        <b>Year<span className='text-danger'>*</span></b>
                                    </label>

                                  <select
                                    className="form-control"
                                    id="departmentaggregate_name"
                                    placeholder=""
                                    name="year"
                                    value={values.year}
                                    onChange={(event)=>this.handleChange(event)}
                                    onBlur={handleBlur}
                                    required
                                    >
                                    <option value="">Select year</option>
                                    {
                                      this.state.availableYears.map((year)=>{
                                      return  (<option value={year} key={year}>{year}</option>)
                                      })
                                    }

                                  </select>
                                    <div className="valid-feedback"></div>
                                    <div className="invalid-feedback">Year is required</div>
                                </div>

                                <div
                                    className={utils.classList({
                                    "col-md-6 mb-2": true,
                                    "valid-field":
                                        !errors.currency_conversion_rate && touched.currency_conversion_rate,
                                    "invalid-field":
                                        errors.currency_conversion_rate && touched.currency_conversion_rate
                                    })}
                                >
                                    <label htmlFor="departmentaggregate_name">
                                        <b>[Currency] Rate<span className='text-danger'>*</span></b>
                                    </label>

                                    <input
                                    type="number"
                                    className="form-control"
                                    id="currency_conversion_rate"
                                    placeholder=""
                                    step="0.1"
                                    name="currency_conversion_rate"
                                    value={values.currency_conversion_rate}
                                    onChange={(event)=>this.handleChange(event)}
                                    onBlur={handleBlur}
                                    required
                                    />

                                    <div className="valid-feedback"></div>
                                    <div className="invalid-feedback">[Currency] Rate is required</div>
                                </div>

                                <div
                                    className={utils.classList({
                                    "col-md-6 mb-2": true,
                                    "valid-field":
                                        !errors.start_date && touched.start_date,
                                    "invalid-field":
                                        errors.start_date && touched.start_date
                                    })}
                                >
                                    <label htmlFor="departmentaggregate_name">
                                        <b>Start Date<span className='text-danger'>*</span></b>
                                    </label>

                                    <input
                                    type="date"
                                    className="form-control"
                                    id="start_date"
                                    placeholder=""
                                    name="start_date"
                                    value={values.start_date}
                                    onChange={(event)=>this.handleChange(event)}
                                    onBlur={handleBlur}
                                    required
                                    />

                                    <div className="valid-feedback"></div>
                                    <div className="invalid-feedback">Start Date is required</div>
                                </div>

                                <div
                                    className={utils.classList({
                                    "col-md-6 mb-2": true,
                                    "valid-field":
                                        !errors.end_date && touched.end_date,
                                    "invalid-field":
                                        errors.end_date && touched.end_date
                                    })}
                                >
                                    <label htmlFor="departmentaggregate_name">
                                        <b>End Date<span className='text-danger'>*</span></b>
                                    </label>

                                    <input
                                    type="date"
                                    className="form-control"
                                    id="end_date"
                                    placeholder=""
                                    name="end_date"
                                    value={values.end_date}
                                    onChange={(event)=>this.handleChange(event)}
                                    onBlur={handleBlur}
                                    required
                                    />

                                    <div className="valid-feedback"></div>
                                    <div className="invalid-feedback">End Date is required</div>
                                </div>


                                <div
                                    className={utils.classList({
                                    "col-md-12 mb-2": true,
                                    "valid-field":
                                        touched.instructions && !errors.instructions,
                                    "invalid-field":
                                        touched.instructions && errors.instructions
                                    })}
                                >
                                    <label htmlFor="create_departmentaggregate_description">
                                         <b>Instructions<span className='text-danger'>*</span></b>
                                    </label>



                                   <RichTextEditor
                                     theme="snow"
                                     modules={{
                                       toolbar: [
                                         [{ size: ["small", false, "large", "huge"] }],
                                         ["bold", "italic", "underline", "strike"],
                                         [{ list: "ordered" }, { list: "bullet" }],
                                         ["clean"]
                                       ]
                                     }}
                                     content={values.instructions}
                                     handleContentChange={html =>
                                       this.handleRichEditorChange(html)
                                     }
                                     placeholder="insert text here..."
                                   />

                                    <div className="valid-feedback"></div>
                                    <div className="invalid-feedback">
                                    Provide instructions
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
                                        className={`btn btn-${utils.isValid(this.createDepartmentAggregateSchema, this.state.createDepartmentAggregateForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
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
                      {/* {
                        !this.state.canCreate ? null :(
                          <Button  variant="secondary_custom" className="ripple m-1 text-capitalize" onClick={ ()=>{ this.setState({ navigate:true })} }><i className='i-Add'></i> Budget Entries</Button>
                          )
                      } */}
                    </div>




                <div className="row mb-4">

                    <div className="col-md-12 mb-4">
                        <div className="card text-left">
                            <div className="card-body">
                                <h4 className="card-title mb-3">
                                <b>{this.state?.single_department?.id ? `${this.state?.single_department?.name} (${this.state?.single_department?.code}) budget ` : 'Departmental budgets'} for </b>

                                <em>{this.state?.activeBudgetCycle?.year} {this.state?.active_version?.version_code?.name} ({this.state?.active_version?.version_code?.code})</em></h4>


                            {/* <div style={{"maxHeight":"500px", "overflowY":"scroll"}}> */}

                            <div className="table-responsive">
                                    <table className="display table tabel-lg table-striped " id="zero_configuration_table" style={{"width":"100%"}}>
                                        <thead>
                                            <tr className="ul-widget6__tr--sticky-th">
                                            {
                                              this.state?.single_department?.id ? null : (
                                              <>
                                              <th>#</th>

                                              <th>Department</th>
                                              </>
                                            )

                                            }

                                              <th colSpan="3" className="text-center">Summary</th>
                                                <th>Progress</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {
                                          this.state.allDepartmentAggregates.length ?  this.state.allDepartmentAggregates.map( (departmentaggregate, index)=>{
                                            const { budgetversion } = departmentaggregate;
                                            const { version_code, budgetcycle } = budgetversion
                                                return (
                                                    <tr key={departmentaggregate.id} className={departmentaggregate.temp_flash ? 'bg-success text-white divide_row':'divide_row'}>

                                                    {
                                                      this.state?.single_department?.id ? null : (

                                                        <>

                                                        <td>
                                                            <b>{index+1}</b>.
                                                        </td>

                                                        <td>

                                                          {
                                                            departmentaggregate.is_my_stage ? <sup><FaDotCircle className="live text-success"/></sup> : null
                                                          }

                                                          <NavLink className="underline" to={`/review/${this.props?.approvalSlug}/${departmentaggregate.slug}`}>
                                                          {departmentaggregate?.department?.name} ({departmentaggregate?.department?.code})
                                                        </NavLink>


                                                        </td>

                                                        </>
                                                      )
                                                    }


                                                        <td colSpan="3" className="no_padding">
                                                          <table className="w-100">
                                                            <thead>
                                                              <tr className="no_top">
                                                                <th>
                                                                  Entry Type
                                                                </th>
                                                                <th className="text-right">
                                                                   Naira part (&#x20a6;)
                                                                </th>
                                                                <th className="text-right">
                                                                   USD part ($)
                                                                </th>
                                                                <th className="text-right">
                                                                   Total in Naira (&#x20a6;)
                                                                </th>
                                                                <th className="text-right">
                                                                   Total in USD ($)
                                                                </th>
                                                              </tr>
                                                            </thead>

                                                            <tbody>
                                                              {
                                                                Object.keys(departmentaggregate?.summary).map((key)=>{
                                                                  const summary = departmentaggregate.summary[key]
                                                                return  (
                                                                  <tr key={`${key}${index}`}>
                                                                    <td>
                                                                      {key}
                                                                    </td>

                                                                    <td className="text-right">
                                                                      {
                                                                        utils.formatNumber(summary?.total_naira_part)
                                                                      }
                                                                    </td>

                                                                    <td className="text-right">
                                                                      {
                                                                        utils.formatNumber(summary?.total_currency_part)
                                                                      }
                                                                    </td>
                                                                    <td className="text-right">
                                                                      {
                                                                        utils.formatNumber(summary?.total_in_naira)
                                                                      }
                                                                    </td>
                                                                    <td className="text-right">
                                                                      {
                                                                        utils.formatNumber(summary?.total_in_currency)
                                                                      }
                                                                    </td>
                                                                  </tr>
                                                                );

                                                                })
                                                              }

                                                            </tbody>
                                                            <tfoot>
                                                              <tr>
                                                                <th>
                                                                  Totals:
                                                                </th>
                                                                <th className="text-right">
                                                                  {utils.formatNumber(departmentaggregate?.total_naira_portion)}
                                                                </th>
                                                                <th className="text-right">
                                                                    {
                                                                      utils.formatNumber(departmentaggregate?.total_currency_portion)
                                                                    }
                                                                </th>
                                                                <th className="text-right">
                                                                    {
                                                                      utils.formatNumber(departmentaggregate?.total_functional_naira)
                                                                    }
                                                                </th>
                                                                <th className="text-right">
                                                                  {
                                                                    utils.formatNumber(departmentaggregate?.total_functional_currency)
                                                                  }

                                                                </th>
                                                              </tr>
                                                            </tfoot>

                                                          </table>

                                                        </td>
                                                        <td>
                                                          <CustomProgressBar departmentaggregate={departmentaggregate} allApprovals={this.state.allApprovals}/>

                                                          {/* {this.setProgressBar(departmentaggregate)} */}

                                                         </td>
                                                        <td>{this.setEntriesStatus(departmentaggregate)}</td>


                                                        <td>
                                                        <Dropdown key={departmentaggregate.id}>
                                                            <Dropdown.Toggle variant={departmentaggregate?.is_my_stage ? 'success' : 'secondary_custom' } className="mr-3 mb-3" size="sm">
                                                            Manage
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu>

                                                              {
                                                                !departmentaggregate?.is_my_stage ? null : (
                                                                  <>
                                                                  <Dropdown.Item className="border-bottom text-success"
                                                                    onClick={()=>{
                                                                      this.approveDepartmentAggregate(departmentaggregate)
                                                                    }}>
                                                                    <FaCheck className="text-success"/> Approve
                                                                  </Dropdown.Item>

                                                                  <Dropdown.Item className="border-bottom text-danger"
                                                                    onClick={()=>{
                                                                      this.approveDepartmentAggregate(departmentaggregate)
                                                                    }}>
                                                                    <FaTimes className="text-danger"/> Reject
                                                                  </Dropdown.Item>
                                                                  </>
                                                                )

                                                              }

                                                            <Dropdown.Item className="border-bottom" href={`/review/${this.props?.approvalSlug}/${departmentaggregate.slug}`}>
                                                                <NavLink className="underlinex text-info_custom" to={`/review/${this.props?.approvalSlug}/${departmentaggregate.slug}`}>
                                                                <i className="nav-icon i-Eye  font-weight-bold"> </i> View
                                                              </NavLink>
                                                            </Dropdown.Item>



                                                            <Dropdown.Item className='text-info' onClick={
                                                                ()=>{this.viewAggregateHistory(departmentaggregate);}
                                                            }>
                                                                <FaList/> History
                                                            </Dropdown.Item>

                                                            </Dropdown.Menu>
                                                        </Dropdown>

                                                        </td>

                                                    </tr>
                                                )


                                            }) :
                                            (
                                                <tr>
                                                    <td className='text-center' colSpan={this.state?.single_department?.id ?'6' :'8'}>
                                                    <FetchingRecords isFetching={this.state.isFetching}/>
                                                    </td>
                                                </tr>
                                            )
                                        }

                                        </tbody>
                                        <tfoot>
                                            <tr>
                                            {
                                              this.state?.single_department?.id ? null : (
                                              <>
                                              <th>#</th>

                                              <th>Department</th>
                                              </>
                                            )

                                            }
                                            <th colSpan="3" className="text-center">Summary</th>
                                              <th>Progress</th>
                                              <th>Status</th>
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

createDepartmentAggregateSchema = yup.object().shape({
        year: yup.string().required("Year is required"),
        instructions: yup.string().required("instructions is required"),
        start_date: yup.string().required("Start date is required"),
        end_date: yup.string().required("End date is required"),
        currency_conversion_rate: yup.number().required("Conversion rate is required"),
      });


updateDepartmentAggregateSchema = yup.object().shape({
          year: yup.string().required("Year is required"),
          instructions: yup.string().required("instructions is required"),
          start_date: yup.string().required("Start date is required"),
          end_date: yup.string().required("End date is required"),
          currency_conversion_rate: yup.number().required("Conversion rate is required"),
        });

}

const mapStateToProps = (state) => ({
  active_budget_cycle:state.budgetCycle,
  active_department:state.department
});


export default withRouter(
  connect(mapStateToProps)(DepartmentAggregatesApprovalComponent)
);
