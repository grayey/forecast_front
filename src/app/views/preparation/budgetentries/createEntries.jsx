import React, { Component, useState, useEffect } from "react"
import { Dropdown, Row, Col, Button,Form, ButtonToolbar,Modal, ProgressBar } from "react-bootstrap";
import { renderToStaticMarkup } from "react-dom/server";

import SweetAlert from "sweetalert2-react";
import swal from "sweetalert2";
import PreparationService from "../../../services/preparation.service";
import ProcessingService from "../../../services/processing.service";
import AppMainService from "../../../services/appMainService";
import jwtAuthService from "../../../services/jwtAuthService";
import * as utils from "@utils";
import { Formik } from "formik";
import * as yup from "yup";
import AppNotification from "../../../appNotifications";
import { VIEW_FORBIDDEN } from "../../../appConstants";

import { FetchingRecords, BulkTemplateDownload, CustomProgressBar, ErrorView } from "../../../appWidgets";
import moment from "moment";
import { RichTextEditor } from "@gull";
import { connect } from "react-redux";
import { Link, Redirect, withRouter } from "react-router-dom";
import { getactivebudgetcycle } from "app/redux/actions/BudgetCycleActions";
import { FaCog, FaArrowDown, FaArrowsAlt, FaSpinner, FaTimes, FaEye, FaEdit, FaFileExcel, FaFileCsv, FaCheck, FaList,  FaPlus, FaDownload, FaUpload, FaMinus  } from "react-icons/fa";
import Select from 'react-select';





import LaddaButton, {
    XL,
    EXPAND_LEFT,
    EXPAND_RIGHT,
    EXPAND_UP,

    CONTRACT,
  } from "react-ladda";

export class BudgetEntriesComponent extends Component{

  userPermissions = [];
  CAN_VIEW_ALL = false;
  CAN_CREATE = false;
  CAN_EDIT =false;
  CAN_VIEW_DETAIL = false;
  CAN_SUBMIT = false;
  CAN_VIEW_HISTORY = false;
  CAN_APPROVE_OR_REJECT = false;
  CAN_IMPORT_PREVIOUS_ENTRIES = false;
  CAN_BULK_UPLOAD_ENTRIES = false;

  AUTH_USER = null;



  preparationService;
  processingService;
  selectedBudgetCycle;

    state = {
        navigate:false,
        updateentries:false,
        viewOrEditSelections:{
          is_view:true,
          is_view_only:true,
          is_edit:false,
        },
        initial_totals:{
          total_functional_naira:0,
          total_functional_currency:0,
          total_naira_portion:0,
          total_currency_portion:0
        },
        editions:[],
        editedIndex:0,
        allBudgetEntries:[],
        allItemCategories:[],
        changesWereMade:false,
        allCostItems:[],
        aggregateList:[],
        allApprovals:[],
        historyRoles:[],
        historyUsers:[],
        historyRoleIds:[],
        detailLInes:(<></>),
        historyDetail:{},
        showHistoryModal:false,
        showDetailAlert:false,
        showEditModal:false,
        showSplitModal:false,
        showInstructionsModal:false,
        approvalModal:false,
        rejectionModal:false,
        showDescriptionAlert:false,
        descriptionLine:0,
        entryDescription:"",
        nairaOrCurrencyAmount:0,
        isSaving:false,
        isFetching:false,
        fetchingCostitems:false,
        firstVersion:{},
        usdConversionRate: null,
        saveMsg:'Save',
        updateMsg:'Update',
        editedDepartmentAggregate: {},
        viewedDepartmentAggregate:{
          department:{}
        },
        rejection_comment:"",
        approval_cooment:"",
        activeBudgetCycle:{},
        activeDepartmentRole:{},
        createDepartmentAggregateForm: {
          unit_value: "",
          quantity:"",
          currency: "",
          naira_portion: "",
          currency_portion: "",
          entity: "",
          description:"",
          costitem:"",
          category:"",
          },
          editFormMode:false,
          selectedCategory:null,
          selectedCostitem:null,
          updateDepartmentAggregateForm: {
            unit_value: "",
            quantity:"",
            currency: "",
            naira_portion: "",
            currency_portion: "",
            total_currency: "",
            total_naira: "",
            entity: "",
            description:"",
            costitem:"",
            category:"",
          },
          toggleFields:{
            NAIRA:false,
            DOLLAR:false,
            PERCENTAGE_SPLIT:false
          },
          percentageSliptForm:{
            naira_percentage:"",
            total_naira_amount:""
          },
          availableYears:[],
          allEntities:[

          ],
          totals:{
            naira_part:0,
            currency_part:0,
            in_naira:0,
            in_currency:0
          },
          approvalMessage:"",
          approvalHue:"info_custom"

    }



    constructor(props){
        super(props)
        this.preparationService = new PreparationService();
        this.appMainService = new AppMainService();
        this.processingService = new ProcessingService();
        this.selectedBudgetCycle = localStorage.getItem('ACTIVE_BUDGET_CYCLE') ? JSON.parse(localStorage.getItem('ACTIVE_BUDGET_CYCLE')) : null;
        if(!this.selectedBudgetCycle){
          new AppNotification({
              type:"error",
              msg:"No budget cycle selected!"
            })
            window.history.back();
        }
        const componentName = props.isApproval ? 'Review__Default' : "Preparation___Default";
        const componentPermissions = utils.getComponentPermissions(componentName, props.route.auth);
        this.userPermissions = utils.comparePermissions(jwtAuthService.getUserTasks(), componentPermissions);
        // console.log('USERRERETTETTE',props, this.userPermissions)

        // set permisions
        this.CAN_VIEW_ALL = this.userPermissions.includes(`${componentName}__CAN_VIEW_ALL`);
        this.CAN_CREATE = this.userPermissions.includes(`${componentName}__CAN_CREATE`);
        this.CAN_EDIT = this.userPermissions.includes(`${componentName}__CAN_EDIT`);
        this.CAN_VIEW_DETAIL = this.userPermissions.includes(`${componentName}__CAN_VIEW_DETAIL`);
        this.CAN_SUBMIT = this.userPermissions.includes(`${componentName}__CAN_SUBMIT`);
        this.CAN_VIEW_HISTORY = this.userPermissions.includes(`${componentName}__CAN_VIEW_HISTORY`);
        this.CAN_IMPORT_PREVIOUS_ENTRIES = this.userPermissions.includes(`${componentName}__CAN_IMPORT_PREVIOUS_ENTRIES`);
        this.CAN_BULK_UPLOAD_ENTRIES = this.userPermissions.includes(`${componentName}__CAN_BULK_UPLOAD_ENTRIES`);
        this.AUTH_USER =  jwtAuthService.getUser();




        this.CAN_APPROVE_OR_REJECT  = utils.comparePermissions(jwtAuthService.getUserTasks(),
         utils.getComponentPermissions('Review__Default', ['CAN_APPROVE_OR_REJECT']));

    }

    componentDidMount = async ()=>{
      const activeDepartmentRole = jwtAuthService.getActiveDepartmentRole();
      // const allEntities = JSON.parse( localStorage.getItem('ENTITIES'))
      await this.getAllEntities();
      await this.setState({ activeDepartmentRole });
      if(this.props.updateentries){
      await  this.getAllBudgetEntriesByDepartmentSlug();
      }
        await this.getAllDepartmentAggregatesByActiveVersion();

         this.getAllApprovals();
         this.setActiveBudgetCycle();


    }





    // componentWillReceiveProps = (nextProps) => {
    //   const { activeBudgetCycle }  = nextProps.active_budget_cycle;
    //   if(this.props.active_budget_cycle.activeBudgetCycle.id !== activeBudgetCycle.id){
    //
    //     console.log("OLD PROPS", this.props.active_budget_cycle, "NEW PROPS", nextProps)
    //     this.setState({ navigate : true });
    //   }
    //
    // }
    //
    //



        /**
         * This method lists all entities
         */
         getAllEntities = async ()=>{

            this.appMainService.getAllEntities().then(
                (entitiesResponse)=>{
                    const allEntities = entitiesResponse.filter(e => e.status).map(e => e.name);
                    this.setState({ allEntities })
                    console.log('Entities response', entitiesResponse)
                }
            ).catch((error)=>{

                console.log('Error', error)
            })
        }







    /**
     *
     * @param {*} event
     * @param {*} errors
     * @param {*} form
     */

    handleChange = async (event, form='create') => {
        const {createDepartmentAggregateForm, updateDepartmentAggregateForm} = this.state
        const eventName = event.target.name;
        const eventValue =  event.target.value;
        if(form=='create'){
            createDepartmentAggregateForm[eventName] = eventValue;
            if(eventName == 'category'){
               this.getCostItemsByCategory(eventValue);
            }
            if(eventName =='currency'){
              await this.setCurrency(eventValue);
            }
        }else if(form=='edit'){
            updateDepartmentAggregateForm[eventName] = eventValue;
        }
        this.setState({ createDepartmentAggregateForm, updateDepartmentAggregateForm });
    }

    handleMultiSelectChange = (event, fieldName) => {
      let { createDepartmentAggregateForm,selectedCategory, selectedCostitem } = this.state
      const { label, value, id } = event;
        createDepartmentAggregateForm[fieldName] = id; // update  form
        const eventValue =  { label, value }
        if(fieldName=="category") {
          selectedCategory = eventValue;
          selectedCostitem = null;
          this.getCostItemsByCategory(id);
        }else{
          selectedCostitem = eventValue;

        }
        this.setState({ createDepartmentAggregateForm, selectedCategory, selectedCostitem });

    }

    handleRichEditorChange = (html, form='approve') => {
      let { rejection_comment, approval_comment} = this.state
      if(form=='approve'){
      approval_comment = html;
      }else{
        rejection_comment = html;
      }
      this.setState({ rejection_comment, approval_comment });

    }

    viewHistoryDetail = async (histo) =>{

      const historyDetail = histo;
      const action = histo.action == 2? "Approval" : "Rejection"
      historyDetail.title = `${histo.role.name} ${action} ${utils.formatDate(histo.created_at)}`
      await this.setState({ historyDetail })
      this.toggleAlert(false);
    }


    handlePercentageSplitChange = (event) =>{
      const { percentageSliptForm } = this.state;
      percentageSliptForm[event.target.name] = event.target.value
      this.setState({ percentageSliptForm })
    }

    setPercentageSplit = (event) =>{
      event.preventDefault();
      let { percentageSliptForm, toggleFields, createDepartmentAggregateForm, usdConversionRate, showSplitModal } = this.state
      const { naira_percentage, total_naira_amount } = percentageSliptForm;
      if(naira_percentage > 100){
        return new AppNotification(
          {
            type:"error",
            msg:"Naira percentage cannot be more than 100"
          }
        );
      }

       // show naira & dollar fields
      toggleFields.NAIRA = true;
      toggleFields.DOLLAR = true;

      // calculate
      const naira_portion = naira_percentage / 100 * total_naira_amount;
      const dollar_portion_in_naira = total_naira_amount - naira_portion;
      const dollar_portion = dollar_portion_in_naira / usdConversionRate;
      createDepartmentAggregateForm.naira_portion = naira_portion;
      createDepartmentAggregateForm.currency_portion = dollar_portion;

      // re-set
      percentageSliptForm.naira_percentage = "";
      percentageSliptForm.total_naira_amount = "";
      showSplitModal = false; // close modal



      this.setState({ toggleFields, createDepartmentAggregateForm, percentageSliptForm, showSplitModal })


    }

    checkSplitType = (event)=>{
      event.preventDefault();
      const eventValue = event.target.value;
      let { toggleFields } = this.state;
      if(eventValue == 'VALUES'){
        toggleFields.NAIRA = true;
        toggleFields.DOLLAR = true;
        this.toggleModal('split_type');
      }else{
        toggleFields.PERCENTAGE_SPLIT = true;
      }
      this.setState({ toggleFields })
    }

  /**
   * [setCurrency description]
   * @param {[type]} eventValue                    [description]
   * @param {[type]} createDepartmentAggregateForm [description]
   */
    setCurrency = (eventValue) =>{
      const { toggleFields, createDepartmentAggregateForm, nairaOrCurrencyAmount } = this.state;
        if(eventValue == 'NAIRA_DOLLAR') return this.toggleModal('split_type');
        toggleFields.NAIRA = eventValue == 'NAIRA';
        toggleFields.DOLLAR = eventValue == 'DOLLAR';
        this.reCalculateCurrencyPortions();
        this.setState({ toggleFields });
  }


  formatEntry = (entry) =>{
    const {costitem } = entry;
    const { category } = costitem;
    delete costitem.category;
    const clean_entry = {
      costitem,
      category,
      ...entry
    }

    return clean_entry;
  }

  /**
   * [addNewEntry description]
   * @param {[type]} event [description]
   * this method adds a new entry to the list of entries
   */
  addNewEntry = async () =>{
    // return false;
    let { createDepartmentAggregateForm, allItemCategories, editedIndex,
      allCostItems, allBudgetEntries, usdConversionRate, toggleFields, totals, editFormMode, activeBudgetCycle } = this.state;
    let {naira_portion, currency_portion,} = createDepartmentAggregateForm;
    const {active_version } = activeBudgetCycle;
    const version = active_version.id;
    let total_naira, total_currency;
    if(!naira_portion && !currency_portion){
      new AppNotification({
        type:"error",
        msg:"Please provide a naira OR dollar portion."
      });
      return false;
    }

    const category = allItemCategories.find(ic => ic.id == createDepartmentAggregateForm.category );
    const costitem = allCostItems.find(ci => ci.id == createDepartmentAggregateForm.costitem);
    naira_portion = toggleFields.NAIRA ? +naira_portion || 0 : 0;
    currency_portion = toggleFields.DOLLAR ? +currency_portion || 0 : 0;
    total_naira = +naira_portion + (+currency_portion * usdConversionRate);
    total_currency = total_naira / usdConversionRate;

    if(editFormMode){ // insert
      const selectedEntry = allBudgetEntries[editedIndex];
      totals.naira_part = totals.naira_part - selectedEntry['naira_portion'] + naira_portion;
      totals.currency_part = totals.currency_part - selectedEntry['currency_portion'] + currency_portion;
      totals.in_naira = totals.in_naira - selectedEntry['total_naira'] + total_naira;
      totals.in_currency = totals.in_currency - selectedEntry['total_currency'] + total_currency;
    }
    else{
      totals.naira_part += naira_portion;
      totals.currency_part += currency_portion;
      totals.in_naira += total_naira;
      totals.in_currency += total_currency;
    }

    const new_entry = {
      ...createDepartmentAggregateForm, category, costitem, naira_portion, currency_portion, total_naira, total_currency, totals, version
    };

    await this.entryValueChanged(new_entry);

    editFormMode ? allBudgetEntries.splice(editedIndex,1, new_entry) :allBudgetEntries.unshift(new_entry); // if in editFormMode, just replace
    editFormMode = false;
    createDepartmentAggregateForm = await this.initialFormState();
     await this.setState({ allBudgetEntries, createDepartmentAggregateForm, editFormMode });
     // this.reTotal();

     return true;


  }


  reCalculateCurrencyPortions = ()=>{
      let {createDepartmentAggregateForm, toggleFields, nairaOrCurrencyAmount} = this.state;
      if(!toggleFields.NAIRA && !toggleFields.DOLLAR) return; // don't calculate if naira AND dollar fields are not set
      nairaOrCurrencyAmount = (!createDepartmentAggregateForm.unit_value || !createDepartmentAggregateForm.quantity) ? "" :createDepartmentAggregateForm.unit_value * createDepartmentAggregateForm.quantity;
      createDepartmentAggregateForm.naira_portion = toggleFields.NAIRA && !toggleFields.DOLLAR ? nairaOrCurrencyAmount :"" // set naira only amoumt
      createDepartmentAggregateForm.currency_portion = toggleFields.DOLLAR && !toggleFields.NAIRA ? nairaOrCurrencyAmount :"" // set dollar only amoumt
      this.setState({nairaOrCurrencyAmount, createDepartmentAggregateForm })


  }

  reTotal = () =>{

    const {allBudgetEntries, totals } = this.state;
    let naira_portion = 0;
    let currency_portion = 0;
    let total_naira = 0;
    let total_currency = 0;
    allBudgetEntries.forEach((entry)=>{
      naira_portion+=entry.naira_portion
      currency_portion+=entry.currency_portion
      total_naira+=entry.total_naira
      total_currency+=entry.total_currency

    })
    totals.naira_part = naira_portion;
    totals.currency_part = currency_portion;
    totals.in_naira = total_naira;
    totals.in_currency = total_currency;
    this.setState({ totals })
  }

  viewInstructions = () => {
    // this.setState({viewedDepartmentAggregate});
    this.toggleModal('instructions');
  }

  /**
   * [reduceTotal description]
   * @param  {[type]} entry [description]
   * @return {[type]}       [description]
   */
   reduceTotal = (entry)=>{
     const { totals } = this.state;
     totals.naira_part -= +entry.naira_portion;
     totals.currency_part -= +entry.currency_portion;
     totals.in_naira -= +entry.total_naira;
     totals.in_currency -= +entry.total_currency;
     this.setState({ totals })
   }

   /**
    * [increaseTotal description]
    * @param  {[type]} entry [description]
    * @return {[type]}       [description]
    */
   increaseTotal = (entry)=>{

   }

   cancelEdit = ()=>{
     let { createDepartmentAggregateForm, editFormMode, editedIndex, selectedCategory, selectedCostitem } = this.state;
     createDepartmentAggregateForm = this.initialFormState(true);
     editFormMode = false;
     editedIndex = null;
     selectedCategory = null;
     selectedCostitem = null;
     this.setState({ createDepartmentAggregateForm, editFormMode, editedIndex, selectedCategory, selectedCostitem });
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

  initialFormState = (clearAll = false) => {

    let {costitem, category, currency} = this.state.createDepartmentAggregateForm;
    currency = !clearAll ? currency : "";
    costitem = !clearAll ? costitem : "";
    category = !clearAll ? category : "";

    return {
      unit_value: "",
      quantity:"",
      currency, // don't reset currency if its naira OR dollar
      naira_portion: "",
      currency_portion: "",
      total_currency: "",
      total_naira: "",
      entity: "",
      description:"",
      costitem, // don't reset in case user would re-use selection
      category,
    }

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

    getBudgetCycleById = async () =>{
      const budgetCycleId = 66;
      this.processingService.getBudgetCycleById(budgetCycleId).then(
          (budgetCycleResponse)=>{
            const activeBudgetCycle =  budgetCycleResponse;
            const usdConversionRate = activeBudgetCycle.currency_conversion_rate
              this.setState({ activeBudgetCycle, usdConversionRate })
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

    setActiveBudgetCycle = () =>{
      const { activeBudgetCycle } =  this.props.active_budget_cycle;
      const usdConversionRate = activeBudgetCycle.currency_conversion_rate;
        this.setState({ activeBudgetCycle, usdConversionRate })
    }


    submitApproval = async (event, approved) =>{
      event.preventDefault();
      const { role, department } = jwtAuthService.getActiveDepartmentRole();
      const user = jwtAuthService.getUser();
      let { viewedDepartmentAggregate, rejection_comment, approval_comment, approvalModal, rejectionModal } = this.state;
      this.setState({isSaving:true })
      const comment = approved ? approval_comment : rejection_comment;
      const approvalObject = { approved, comment, role:role.id, user:+user.id, department:department.id }

      this.preparationService.approveDepartmentAggregate(viewedDepartmentAggregate, approvalObject).then(
      async  (approvedAggregateResponse)=>{
          viewedDepartmentAggregate = approvedAggregateResponse;
          console.log("VEWV V ",viewedDepartmentAggregate)
          const action = approved ? "Approved":"Rejected";
          const notified  = approved ? "":"";
          const successNotification ={
            msg:`Budget ${action}. A notification has been sent to`,
            type:"success"
          }
        await this.setState({isSaving:false, approvalModal:false, rejectionModal:false,viewedDepartmentAggregate   });
        this.getApprovalMessage();
          new AppNotification(successNotification);
        }).catch((error)=>{
          // console.error("ERROR", error);
          const errorNotification ={
            msg:utils.processErrors(error),
            type:"error"
          }
          this.setState({isSaving:false })

          new AppNotification(errorNotification);
      })

    }

    /**
     * This method lists all itemcategories
     */
     getAllItemCategories = async ()=>{
       // Move to a getAllEntities method
       let { allEntities, createDepartmentAggregateForm, activeDepartmentRole, viewedDepartmentAggregate } = this.state;
       // if(!allEntities.length){
       //   createDepartmentAggregateForm.entity = "PRINCIPAL" // default entity
       // }
       this.setState({allEntities, createDepartmentAggregateForm})
       // End getAllEntities method

       const { department } = this.props.updateentries ? viewedDepartmentAggregate : activeDepartmentRole; // get item categories by department



        this.appMainService.getAllItemCategories(department.id).then(
            (itemcategoriesResponse)=>{

                const allItemCategories = itemcategoriesResponse.map((c)=>{
                    c.value = c._id;
                    c.label = `${c.name} (${c.code})`;
                    return c;
                })
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
     * This method lists all costitems
     */
     getAllCostItems = async ()=>{

        this.appMainService.getAllCostItems().then(
            (costitemsResponse)=>{
                const allCostItems = costitemsResponse;
                this.setState({ allCostItems })
            }
        ).catch((error)=>{
            const errorNotification = {
                type:'error',
                msg:`Could not load cost items for ...`
            }
            new AppNotification(errorNotification)

        })
    }

    /**
     * This method lists cost items by category
     */
     getCostItemsByCategory = async (categoryId, costItemId = null)=>{

        let fetchingCostitems = true;
        let selectedCostitem = null;
        this.setState({ fetchingCostitems, selectedCostitem })
        this.appMainService.getCostItemsByCategory(categoryId).then(
            (costitemsResponse)=>{
             fetchingCostitems = false;

                const allCostItems = costitemsResponse.map((c)=>{
                    c.value = c._id;
                    c.label = `${c.name} (${c.code})`;
                    return c;
                })
                if(costItemId){
                  selectedCostitem = allCostItems.find(ci => ci.id == costItemId)
                }

                this.setState({ allCostItems, fetchingCostitems, selectedCostitem })
            }
        ).catch((error)=>{
           fetchingCostitems = false;
          this.setState({ fetchingCostitems })
            const errorNotification = {
                type:'error',
                msg:utils.processErrors(error)
            }
            new AppNotification(errorNotification)

        })
    }



    viewOrEditButton = ()=>{
      const { CAN_EDIT, CAN_APPROVE_OR_REJECT, state } = this;
      let { viewOrEditSelections, viewedDepartmentAggregate } = state;
      const { is_view_only } = viewOrEditSelections;

      return !this.props.isApproval ?(
        <div className="btn-group">
          <button className={`btn btn-lg btn-${viewOrEditSelections.is_view ? "success shadow":"info_custom"}`} onClick={()=>this.toggleViewOrEdit('view')}>
            View { viewOrEditSelections.is_view ? <FaEye/> : null}
          </button>
          {
            is_view_only ? null : !CAN_EDIT ? null : (

              <button className={`btn btn-lg btn-${viewOrEditSelections.is_edit ? "success shadow":"info"}`} onClick={()=>this.toggleViewOrEdit('edit')}>
                Edit { viewOrEditSelections.is_edit ? <FaEdit/> : null}
              </button>
            )
          }

        </div>
      ) :
      <>
      {
        this.state.viewedDepartmentAggregate?.approval_stage?.id == this.state.activeDepartmentRole?.role?.approval?.id && CAN_APPROVE_OR_REJECT ? (
          <div className="btn-group">
            {
              this.state.viewedDepartmentAggregate.id && this.state.activeDepartmentRole?.role?.approval ?(
                <>
                {
                 !viewedDepartmentAggregate.is_archived ? (
                   <>
                   <button className="btn btn-lg btn-success" onClick={()=>this.toggleModal('approve')}>
                     Approve <FaCheck/>
                   </button>
                   <button className="btn btn-lg btn-danger" onClick={()=>this.toggleModal('reject')}>
                     Reject <FaTimes/>
                   </button>
                   </>
               ) : null
                }

                </>
            ) :null
            }


          </div>
        ) :
        <div className="btn-group">
          <button className={`btn btn-lg btn-${this.state.approvalHue}`}>
          <small>This approval is <u>unavailable</u> because it <em>{this.state.approvalMessage}</em> desk</small>.
          </button>
        </div>

      }

      </>


    }

    getApprovalMessage(){
      let { viewedDepartmentAggregate,  activeDepartmentRole, historyRoleIds, approvalHue } = this.state;
      const { approval_stage } = viewedDepartmentAggregate;
      const { role } = activeDepartmentRole;
      const { approval } = role;
      const user = jwtAuthService.getUser();
      const suffix = `the ${role.name}`;

      let approvalMessage = historyRoleIds.includes(role.id) ? `has been sent back by ${suffix}` : `has not reached ${suffix}`;
      if(approval_stage && approval){
        approvalMessage = approval_stage.stage < approval.stage ? approvalMessage : `has now passed ${suffix}`;
      }
      approvalHue = approvalMessage.includes("back") ? "warning" : approvalMessage.includes("passed") ? "success" :approvalHue;
      this.setState({approvalMessage, approvalHue})
    }

    toggleViewOrEdit = (mode)=>{
        let { viewOrEditSelections } = this.state;
        let {is_view, is_edit} = viewOrEditSelections;
        if(mode == 'view'){
          is_view = true;
          is_edit = false;
        }else{
          is_view = false;
          is_edit = true;
        }

        viewOrEditSelections = {... viewOrEditSelections,is_view, is_edit }


        this.setState({ viewOrEditSelections })
    }


    /**
   * This method lists all approvals
   */
   getAllApprovals = async ()=>{

      this.appMainService.getAllApprovals().then(
          (approvalsResponse)=>{
              const allApprovals = approvalsResponse;
              this.setState({ allApprovals })
              // console.log('Approvals response', approvalsResponse)
          }
      ).catch((error)=>{
          // const errorNotification = {
          //     type:'error',
          //     msg:utils.processErrors(error)
          // }
          console.log('Error', error)
      })
  }


    /**
     * This method lists all budgetentries
     */
     getAllBudgetEntriesByDepartmentSlug = async ()=>{
         const slug = this.props.queryslug;
         let { totals, usdConversionRate, viewedDepartmentAggregate, isFetching,
           activeDepartmentRole, historyRoles, historyUsers, historyRoleIds, initial_totals } = this.state
         let activeBudgetCycle  = this.selectedBudgetCycle ? this.selectedBudgetCycle : {}
          isFetching = true;
         this.setState({ isFetching })
        this.preparationService.getAllBudgetEntriesByDepartmentSlug(slug).then(
            async (departmentAggregatesResponse)=>{
               isFetching = false;
               viewedDepartmentAggregate = departmentAggregatesResponse;
               const { aggregate_history } = viewedDepartmentAggregate;
               aggregate_history.forEach((tale)=>{
                 const { role, user } = tale;
                 historyRoles.push(role);
                 historyRoleIds.push(role.id);
                 historyUsers.push(user);

               })

              const { entries, total_currency_portion, total_naira_portion,
                  total_functional_naira, total_functional_currency, capturer, budgetversion  } = viewedDepartmentAggregate;
                  const { version_code, budgetcycle } = budgetversion;
                  initial_totals = {total_currency_portion, total_naira_portion, total_functional_currency, total_functional_naira };

                  if((budgetcycle.id !== activeBudgetCycle.id || activeDepartmentRole.department.id !== viewedDepartmentAggregate.department.id) && !this.props.isApproval){
                  return  this.setState({navigate:true})
                  }
              const allBudgetEntries = entries.map((entry)=>{
                return this.formatEntry(entry);
              });
              totals.naira_part = total_naira_portion
              totals.currency_part = total_currency_portion
              totals.in_naira = total_functional_naira;
              totals.in_currency = total_functional_currency;
              usdConversionRate = budgetcycle.currency_conversion_rate
              await  this.setState({ allBudgetEntries, isFetching, totals,
                 viewedDepartmentAggregate,usdConversionRate, activeBudgetCycle,
                 historyRoles, historyUsers, initial_totals }); // so allBudgetEntries is set
              await this.getApprovalMessage();
              this.getAllItemCategories();


              this.setViewMode();

            }
        ).catch((error)=>{
          isFetching = false;
            this.setState({isFetching})
            const errorNotification = {
                type:'error',
                msg:utils.processErrors(error)
            }
            new AppNotification(errorNotification)
            console.log('Error', error)
        })
    }



    setViewMode = ()=>{
        const { CAN_CREATE, CAN_EDIT, state } = this;
        const { viewedDepartmentAggregate, viewOrEditSelections } = state;
        const { entries_status, department, capturer, budgetversion, is_archived } = viewedDepartmentAggregate;
        const { version_code, budgetcycle } = budgetversion

        viewOrEditSelections.is_view_only =  (entries_status || !budgetcycle.is_current || this.props.isApproval || is_archived || (!CAN_EDIT && !CAN_CREATE))
        // not in draft Or it's not user's department Or beyond end_date Or cycle is not active
        // Or userRole is not a capture role // departmentHasbegun capture


        viewOrEditSelections.is_view = viewOrEditSelections.is_view_only; // if we're not in view only, then we're in edit mode  by default
        viewOrEditSelections.is_edit = !viewOrEditSelections.is_view;

        this.setState({ viewOrEditSelections })
    }


    setProgressBar = (departmentaggregate)=>{
      let { approval_stage, entries_status } = departmentaggregate ;
      entries_status = entries_status || 0;
      const { allApprovals } = this.state;
      let padding = 0; // so that the progress bar displays
      let prefix = entries_status < 3 ? "Awaiting" : "Completed";
      // let shift = entries_status < 3 ? 1 : 0; // once approved/discarded fill the progress bar
      let progressObject = {
        percentage:0,
        variant:null,
        text:"Submission"
      };
      // text-${progressObject.percentage < 100 ? 'info':'success'}
      if(approval_stage){
        const percentage = Math.round(approval_stage.stage/(allApprovals.length) * 100);
        const variant = percentage < 100 ? "info_custom" : "success";
        const text = approval_stage.description;
        progressObject = { percentage,variant,text }
        padding = entries_status < 3 ? 5 : 100; // once approved/discarded fill the progress bar

        // padding = 5;
      }
      return (
        <div>
        <ProgressBar
          now={progressObject.percentage + padding}
          label={`${progressObject.percentage}%`}
          animated
          striped
          variant={progressObject.variant}
        ></ProgressBar>
      <div className={`text-center`}>
          <small><b><em>{prefix} {progressObject.text}</em></b></small>
        </div>
      </div>
      )

    }

    setEntriesStatus = (departmentAggregate)=>{

      const { entries_status, is_archived } = departmentAggregate;
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

    /**
     * This method creates a new departmentaggregate
     */
    saveBudgetEntries = async ()=>{
        let { allBudgetEntries, totals, navigate, activeBudgetCycle, viewedDepartmentAggregate, editions, initial_totals } = this.state;
        activeBudgetCycle  = activeBudgetCycle  || this.selectedBudgetCycle;
        let isSaving = true;
        let saveMsg = 'Saving';
        this.setState({isSaving, saveMsg})
        const { role, department } = jwtAuthService.getActiveDepartmentRole();
        const user = jwtAuthService.getUser();
        const aggregateData = {
          department:department.id,
          budgetcycle:activeBudgetCycle.id,
          capturer:role.id,
          user:user.id,
          total_functional_naira:totals.in_naira,
          total_functional_currency:totals.in_currency,
          total_naira_portion:totals.naira_part,
          total_currency_portion:totals.currency_part,
          entries:[],
          initial_totals
        }
        const allEntries = [...allBudgetEntries].map((be)=>{
          delete be.category;
          delete be.totals;
          const entry = {
            ...be,
            costitem:be.costitem.id,
          }
          return entry;
        });
        aggregateData['entries'] = allEntries;
        aggregateData['editions'] = editions;
        console.log(aggregateData)

        this.preparationService.saveDepartmentAggregate(aggregateData, viewedDepartmentAggregate.id).then(
            async (departmentaggregateData) => {
                isSaving = false;
                saveMsg = 'Save';
                const successNotification = {
                    type:'success',
                    msg:`Budget entries successfully ${this.props.updateentries ? 'updated' : 'created'}!`
                }
                new AppNotification(successNotification)
                navigate = true;
                await this.setState({ navigate })

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

    getAllDepartmentAggregatesByActiveVersion = async() =>{

      let isFetching = true;
      let { aggregateList, navigate } = this.state;
      const activeBudgetCycle  = localStorage.getItem('ACTIVE_BUDGET_CYCLE') ? JSON.parse(localStorage.getItem('ACTIVE_BUDGET_CYCLE')) : {};
      const { active_version } = activeBudgetCycle;
      const budgetCycleId = activeBudgetCycle.id;
      const activeDepartmentRole = jwtAuthService.getActiveDepartmentRole();
      const {department, role } = activeDepartmentRole;
      const departmentId = department.id;
      this.setState({ isFetching })

     this.preparationService.getAllDepartmentAggregatesByActiveVersion(active_version.id, departmentId).then(
         async (departmentaggregatesResponse)=>{
            isFetching = false;
            aggregateList = departmentaggregatesResponse;
            // console.log("DEPTHASBEGUNCAPT", aggregateList );
            if(aggregateList.length && !this.props.updateentries){
              this.setState({ navigate:true });
              new AppNotification(
                {
                  type:"info",
                  msg:`Your department has begun capture for version ${active_version.version_code.name} (${active_version.version_code.code}) of ${activeBudgetCycle.year}.`
                }
              )
            }
           await  this.setState({ aggregateList, isFetching, navigate });
           this.getAllItemCategories();


         }
     ).catch((error)=>{
        isFetching = false;
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
     * This method updates a new departmentaggregate
     */
    updateDepartmentAggregate = async ()=>{

        let {updateDepartmentAggregateForm, allBudgetEntries, editedDepartmentAggregate} = this.state;
        let isSaving = true;
        let updateMsg = 'Updating';
        this.setState({isSaving, updateMsg})
        this.preparationService.updateDepartmentAggregate(updateDepartmentAggregateForm, editedDepartmentAggregate.id).then(
            (updatedDepartmentAggregate)=>{
                updatedDepartmentAggregate.temp_flash = true
                isSaving = false;
                updateMsg = 'Update';
                allBudgetEntries.splice(this.state.editedIndex, 1, updatedDepartmentAggregate)
                this.setState({ allBudgetEntries, isSaving, updateMsg })
                const successNotification = {
                    type:'success',
                    msg:`Budget cycle ${updatedDepartmentAggregate.year} successfully updated!`
                }
                new AppNotification(successNotification)
                this.toggleModal('edit');

             setTimeout(async ()=>{
                    updatedDepartmentAggregate.temp_flash = false
                    allBudgetEntries.splice(this.state.editedIndex, 1, updatedDepartmentAggregate)
                    await this.setState({ allBudgetEntries, isSaving, updateMsg })
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
        let {showEditModal, showSplitModal, showHistoryModal, showInstructionsModal, toggleFields, createDepartmentAggregateForm, approvalModal, rejectionModal } = this.state;
        if(modalName == 'split_type'){
            showSplitModal = !showSplitModal;
            toggleFields.PERCENTAGE_SPLIT = false;
            createDepartmentAggregateForm.naira_portion = ""
            createDepartmentAggregateForm.currency_portion = ""
        }else if(modalName == 'edit'){
            showEditModal = !showEditModal
        }else if(modalName=='instructions'){
          showInstructionsModal = !showInstructionsModal
        }else if(modalName=='approve'){
          approvalModal = !approvalModal;
        }
        else if(modalName=='reject'){
          rejectionModal = !rejectionModal
        }else if(modalName=='history'){
          showHistoryModal = !showHistoryModal
        }

        this.setState({ showEditModal, showSplitModal, showHistoryModal, showInstructionsModal, approvalModal, rejectionModal,  toggleFields, createDepartmentAggregateForm })

    }

    toggleAlert = (description=true)=>{
      let { showDescriptionAlert, showDetailAlert } = this.state;
      if(description){
        showDescriptionAlert = !showDescriptionAlert;
      }
      else{
        showDetailAlert = !showDetailAlert
      }
      this.setState({showDescriptionAlert, showDetailAlert});
    }

    showDescription = async(index, entryDescription) =>{
      const descriptionLine = index+1;
      await this.setState({entryDescription, descriptionLine})
      this.toggleAlert();
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

  entryValueChanged = async (new_entry) => {
    if(!this.props.updateentries) return; // if we are not updating, return

    const { editions, editedDepartmentAggregate, editFormMode } = this.state;
    const editionData = JSON.parse(JSON.stringify(editedDepartmentAggregate)) // deep copy. I canet shout. Remember psuedo_id!
    let edition = { action:"ADDED", old:null, new:new_entry};

    if(editFormMode){
      for (const key in editionData) {
        if (new_entry[key] && editionData[key] && editionData[key].toString() !== new_entry[key].toString()) {
          edition['action'] = "EDITED";
          edition['old'] = editionData;
        }
      }
    }
    editions.push(edition);
    this.setState({ editions })

       // if (edited) {
       //   const edition = {
       //     old: this.entryToEdit,
       //     new: this.editFormData,
       //     uniqueId: this.entryToEdit.uniqueId
       //   };
       //   this.setEditions(edition);
       // }
  }



    /**
     *
     * This method sets the departmentaggregate to be edited
     *  and opens the modal for edit
     *
     */
    editDepartmentAggregate = (editedDepartmentAggregate, editedIndex) => {
        const createDepartmentAggregateForm = {...editedDepartmentAggregate};
        let { toggleFields, editFormMode, selectedCategory, selectedCostitem, allItemCategories, allCostItems } = this.state;
        createDepartmentAggregateForm.category = createDepartmentAggregateForm.category.id;
        createDepartmentAggregateForm.costitem = createDepartmentAggregateForm.costitem.id;
        selectedCategory = allItemCategories.find(ic => ic.id == createDepartmentAggregateForm.category);
        this.getCostItemsByCategory(selectedCategory.id, createDepartmentAggregateForm.costitem); // get category items and set selection because cost items list was always overwitten onC
        toggleFields.NAIRA = !!createDepartmentAggregateForm.naira_portion
        toggleFields.DOLLAR = !!createDepartmentAggregateForm.currency_portion
        editFormMode = true;
        this.setState({editedDepartmentAggregate, editedIndex, editFormMode, createDepartmentAggregateForm, selectedCategory, selectedCostitem });
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
                let { allBudgetEntries } = this.state
                const toggleIndex = allBudgetEntries.findIndex(r => r.id == departmentaggregate.id)
                // departmentaggregate.status = !departmentaggregate.status;

              this.preparationService.toggleDepartmentAggregate(departmentaggregate).then(
                (toggledDepartmentAggregate)=>{
                    allBudgetEntries.splice(toggleIndex, 1, toggledDepartmentAggregate)
                    this.setState({ allBudgetEntries })
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
    deleteDepartmentAggregate = (departmentaggregate, entryIdex)=>{
      const {category, costitem } = departmentaggregate;
         swal.fire({
                title: `<small>Delete this&nbsp;<b>${category.name? category.name : "" +" | "+ costitem.name ? costitem.name : "" }'s... item</b>?</small>`,
                text: "",
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
                let { allBudgetEntries, editions } = this.state
                if(!departmentaggregate.id){ // doesnt exist at the backend
                  allBudgetEntries.splice(entryIdex, 1);
                  this.reduceTotal(departmentaggregate);
                   this.setState({ allBudgetEntries });
                   const successNotification = {
                       type:'success',
                       msg:`Budget entry ${entryIdex+1} successfully deleted!`
                   }
                   new AppNotification(successNotification)
                  return this.checkDeleteDuringEdit(entryIdex);
                }

                  this.preparationService.deleteBudgetEntry(departmentaggregate).then(
                    async (deletedDepartmentAggregate) => {
                      const edition = { action:"DELETED", old:null, new:departmentaggregate};
                      editions.push(edition);
                      await this.setState({ editions });

                        allBudgetEntries = allBudgetEntries.filter(r=> r.id !== departmentaggregate.id)

                        const successNotification = {
                            type:'success',
                            msg:`Budget entry ${entryIdex+1} successfully deleted!`
                        }
                        new AppNotification(successNotification)
                        this.checkDeleteDuringEdit(entryIdex);

                        this.reduceTotal(departmentaggregate);
                        await this.setState({ allBudgetEntries });
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

      checkDeleteDuringEdit = async (entryIndex) =>{
       let { editedIndex, createDepartmentAggregateForm, editFormMode } = this.state;
       if(entryIndex == editedIndex && editFormMode){
        this.cancelEdit();
       }
     }



    render(){

      const {AUTH_USER, CAN_VIEW_ALL, CAN_EDIT, CAN_CREATE, CAN_SUBMIT, CAN_VIEW_DETAIL, CAN_IMPORT_PREVIOUS_ENTRIES,
         CAN_BULK_UPLOAD_ENTRIES, CAN_VIEW_HISTORY, CAN_APPROVE_OR_REJECT, state, props } = this
      const { navigate, viewOrEditSelections, activeDepartmentRole, entryDescription, descriptionLine, showDescriptionAlert, activeBudgetCycle } = state;
      const { active_version } = activeBudgetCycle;
      // const { version_code } = active_version;
        return navigate ? <Redirect to="/preparation/budget-entries"/> : (!props.updateentries && !CAN_CREATE) ? <ErrorView errorType={VIEW_FORBIDDEN}/> : (

            <>
                <div className="specific">

                  <SweetAlert
                    show={this.state.showDetailAlert}
                    title={this.state?.historyDetail?.title}
                    html={this.state.historyDetail?.body}
                    onConfirm={() => this.toggleAlert(false)}
                  />


                  <SweetAlert
                    show={showDescriptionAlert}
                    title={`Description: line ${descriptionLine}`}
                    text={entryDescription}
                    onConfirm={this.toggleAlert}
                  />



                                                    <Modal size="xl"  show={this.state.showHistoryModal} onHide={
                                                        ()=>{ this.toggleModal('history')}
                                                        } {...this.props} id='history_modal'>
                                                        <Modal.Header closeButton>

                                                        <Modal.Title>
                                                          <img src="/assets/images/logo.png" alt="Logo" className="modal-logo"  />
                                                          &nbsp;&nbsp;
                                                           <b>History<FaList/> </b>&nbsp;<em>{this.state?.viewedDepartmentAggregate?.department?.name} ({this.state?.viewedDepartmentAggregate?.department?.code}) <b>::</b> {activeBudgetCycle?.year} {active_version?.version_code?.name} ({active_version?.version_code?.code})</em>
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
                                                                                   {
                                                                                      AUTH_USER.id == histo?.user?.id ? (<span className='badge badge-danger'> <small> You</small></span>): null
                                                                                   }
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
                                                                                       <a className="underline text-primary" href="#" onClick={()=>this.downloadHistoryDetail(histo)}>View <FaList/></a>
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



                                  <Modal show={this.state.showInstructionsModal} onHide={
                                      ()=>{ this.toggleModal('instructions')}
                                      } {...this.props} id='instructions_modal'>
                                      <Modal.Header closeButton>

                                      <Modal.Title>
                                        <img src="/assets/images/logo.png" alt="Logo" className="modal-logo"  />&nbsp;&nbsp;
                                        Year <b>{this.state?.activeBudgetCycle?.year}</b> Instructions
                                    </Modal.Title>
                                      </Modal.Header>

                                               <Modal.Body>
                                                 <div className="card-headerx border-bottom">
                                                   <h5><b>USD Rate:</b> &#x20a6;{utils.formatNumber(this.state.usdConversionRate)}</h5>
                                                 </div>

                                                 <div className="mt-1" dangerouslySetInnerHTML={{__html: this.state.activeBudgetCycle?.instructions}} />

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

                                  <Modal show={this.state.approvalModal} onHide={
                                      ()=>{ this.toggleModal('approve')}
                                    } {...this.props} id='approval_modal'>
                                      <Modal.Header closeButton>

                                      <Modal.Title className="text-success">
                                        <img src="/assets/images/logo.png" alt="Logo" className="modal-logo"  />&nbsp;&nbsp;
                                        Approval
                                    </Modal.Title>
                                      </Modal.Header>

                                      <form onSubmit={(event)=>this.submitApproval(event,1)}>

                                               <Modal.Body>


                                                   <div className="form-row">
                                                    <div className="col-md-12">
                                                      <label><b>Comment:</b><small>(Please provide an approval comment.)<span className="text-success">*</span></small></label>
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
                                                        content={this.state.approval_comment}
                                                        handleContentChange={html =>
                                                          this.handleRichEditorChange(html, 'approve')
                                                        }
                                                        placeholder="insert text here..."
                                                      />
                                                    </div>
                                                   </div>



                                               </Modal.Body>


                                              <Modal.Footer>




                                                      <LaddaButton
                                                          className="btn btn-secondary_custom border-0 mr-2 mb-2 position-relative"
                                                          loading={this.state.isSaving}
                                                          progress={0.5}
                                                          type='button'
                                                          onClick={()=>this.toggleModal('approve')}

                                                          >
                                                          Close
                                                      </LaddaButton>

                                                      <LaddaButton
                                                          className={`btn btn-${this.state.approval_comment !=="<p><br></p>" || this.state.approval_comment ? 'success':'info_custom'} border-0 mr-2 text-white mb-2 position-relative`}
                                                          loading={this.state.isSaving}
                                                          progress={0.5}
                                                          type='submit'
                                                          disabled={this.state.approval_comment=="<p><br></p>"  || !this.state.approval_comment }

                                                          >
                                                          <FaCheck/> Approve
                                                      </LaddaButton>


                                                      </Modal.Footer>
                                                    </form>




                                  </Modal>


                                  <Modal show={this.state.rejectionModal} onHide={
                                      ()=>{ this.toggleModal('reject')}
                                    } {...this.props} id='rejection_modal'>
                                      <Modal.Header closeButton>

                                      <Modal.Title className="text-danger">
                                        <img src="/assets/images/logo.png" alt="Logo" className="modal-logo"  />&nbsp;&nbsp;
                                        Rejection
                                    </Modal.Title>
                                      </Modal.Header>
                                      <form onSubmit={(event)=>this.submitApproval(event, 0)}>


                                               <Modal.Body>


                                                   <div className="form-row">
                                                    <div className="col-md-12">
                                                      <label><b>Comment:</b><small>(Please provide a reason for rejecting.)<span className="text-danger">*</span></small></label>
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
                                                        content={this.state.rejection_comment}
                                                        handleContentChange={html =>
                                                          this.handleRichEditorChange(html, 'reject')
                                                        }
                                                        placeholder="insert text here..."
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
                                                onClick={()=>this.toggleModal('reject')}

                                                >
                                                Close
                                            </LaddaButton>

                                            <LaddaButton
                                                className={`btn btn-${this.state.rejection_comment !=="<p><br></p>" || this.state.rejection_comment ? 'danger':'warning'} border-0 mr-2 text-white mb-2 position-relative`}
                                                loading={false}
                                                progress={0.5}
                                                type='submit'
                                                disabled={this.state.rejection_comment=="<p><br></p>"  || !this.state.rejection_comment }

                                                >
                                                <FaTimes/> Reject
                                            </LaddaButton>


                                          </Modal.Footer>

                                        </form>




                                  </Modal>




                <Modal show={this.state.showSplitModal} onHide={
                    ()=>{ this.toggleModal('create')}
                    } {...this.props} id='create_modal'>
                    <Modal.Header closeButton>
                    <Modal.Title>
                      <img src="/assets/images/logo.png" alt="Logo" className="modal-logo"  />&nbsp;&nbsp;
                      Currency Split
                    </Modal.Title>
                    </Modal.Header>

                             <Modal.Body>
                                 <div className="form-row">
                                   <select className="form-control" onChange={this.checkSplitType}>
                                     <option value="">Select Method</option>
                                       <option value="VALUES">Values</option>
                                     <option value="PERCENTAGE">Percentage</option>
                                   </select>
                                 </div>

                                 {
                                   this?.state?.toggleFields?.PERCENTAGE_SPLIT ?
                                   (
                                     <div className="form-row mt-2">
                                       <div className="col-md-6">
                                         <label><b>Naira percentage (%)</b></label>
                                         <input className="form-control" value={this.state.percentageSliptForm.naira_percentage} onChange={this.handlePercentageSplitChange} name="naira_percentage" placeholder="e.g, 30" type="number" step="0.01"/>
                                       </div>
                                       <div className="col-md-6">
                                         <label><b>Total amount in Naira (&#x20a6;)</b></label>
                                         <input value={this.state.percentageSliptForm.total_naira_amount} name="total_naira_amount"  onChange={this.handlePercentageSplitChange} className="form-control" type="number" step="0.01"/>
                                         <small className="text-primary">Rate: 1USD = &#x20a6;{utils.formatNumber(this.state.usdConversionRate)}</small>
                                     </div>

                                     </div>

                                   ): null

                                 }


                            </Modal.Body>

                            <Modal.Footer>
                              {
                                this?.state?.toggleFields?.PERCENTAGE_SPLIT ?
                                (
                                  <>


                                  <LaddaButton
                                      className={`btn btn-${this.state.percentageSliptForm.naira_percentage && this.state.percentageSliptForm.total_naira_amount ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}

                                      progress={0.5}
                                      type='submit'
                                      data-style={EXPAND_RIGHT}
                                      disabled={!(this.state.percentageSliptForm.naira_percentage && this.state.percentageSliptForm.total_naira_amount)}
                                      onClick={this.setPercentageSplit}
                                      >
                                      Set
                                  </LaddaButton>
                                  </>
                                ): null
                              }

                                    </Modal.Footer>

                                  </Modal>

                <div className='float-right'>
                  {
                    !this.props.isApproval ?
                    (
                      <Button  variant="secondary_custom" className="ripple m-1 text-capitalize" onClick={this.viewInstructions} ><i className='i-Add'></i> View  instructions</Button>

                    ) : CAN_VIEW_HISTORY ?

                    (
                      <Button  variant="primary" className="ripple m-1 text-capitalize" onClick={()=>this.toggleModal('history')} ><FaList/> View  History</Button>

                    ) : null
                  }
                </div>

                <div className="breadcrumb">
                    <h1>{this.props.updateentries ? this.viewOrEditButton() : "Create" } Entries{this.props.isApproval ? "' Approval":""}</h1>
                    <ul>
                      {
                        !this.props.isApproval ?
                            <>
                              <li>
                                <a href="#">
                                Bulk  {this.props.updateentries ? "update" : "insert" }
                              </a>
                            </li>
                            <li><a href="#">Import</a></li>
                            <li>Add lines</li>
                          </>
                        :  null


                      }


                    </ul>

                    {
                       this.props.updateentries && viewOrEditSelections.is_view ? (
                         <div className="mt-3 ml-4">
                           <h5><b>Department:</b> {
                             this.props?.isApproval ?
                             `${this.state?.viewedDepartmentAggregate?.department?.name} (${this.state?.viewedDepartmentAggregate?.department?.code})` :
                             `${activeDepartmentRole.department?.name} (${activeDepartmentRole?.department?.code})`
                           }

                         </h5>
                         </div>
                       )
                      : (

                    <div className="d-inline pl-5">
                      {
                        CAN_BULK_UPLOAD_ENTRIES ? (
                            <BulkTemplateDownload caller="budgetentries" refresh={this.getAllItemCategories}/>
                        ) : (
                          <span className='p-1 badge badge-info_custom'>Bulk Upload Disabled <FaUpload/></span>
                        )
                      }

                    </div>
                  )}
                </div>

                <div className="separator-breadcrumb border-top"></div>


                {
                  this.props.updateentries && viewOrEditSelections.is_view ?
                  null : (
                    <div className="form_sticky">
                      {
                        this.state.editFormMode ? (
                          <div>
                            <b>Currently editing line:</b> <span className="badge badge-primary">{this.state.editedIndex + 1}</span>
                          </div>
                        ): null
                      }




                      <Formik
                      initialValues={this.state.createDepartmentAggregateForm}
                      validationSchema={this.createDepartmentAggregateSchema}
                      enableReinitialize
                      onSubmit={ async(values, actions) => {
                        const insertEntry = await this.addNewEntry();
                        if(insertEntry){
                          actions.resetForm({
                            values:this.state.createDepartmentAggregateForm
                          });
                        }


                      }
                    }
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

                    <div className="row mb-2">
                      <div className={`card w-100 ${this.state.editFormMode ? 'shadow-lg line_edit':'shadow'}`}>

                        <div className="card-body">

                          <div className="form-row">
                            <div className="col-md-11 pr-2">
                              <div className="form-row border-bottom pb-2">

                                <div
                                    className={utils.classList({
                                    "col-md-3 mb-2": true,
                                    "valid-field":
                                        !errors.category && touched.category,
                                    "invalid-field":
                                        errors.category && touched.category
                                    })}
                                >
                                    <label htmlFor="category">
                                        <b>Item Category<span className='text-danger'>*</span></b>
                                    </label>

                                    <Select

                                         value={this.state.selectedCategory}
                                         onChange={(event)=>this.handleMultiSelectChange(event,'category')}
                                         options={this.state.allItemCategories}
                                         placeholder="Search categories"
                                         noOptionsMessage ={ () => "No categories" }

                                     />



                                    <div className="valid-feedback"></div>
                                    <div className="invalid-feedback">Category is required</div>
                                </div>

                                  <div
                                      className={utils.classList({
                                      "col-md-3 mb-2": true,
                                      "valid-field":
                                          !errors.costitem && touched.costitem,
                                      "invalid-field":
                                          errors.costitem && touched.costitem
                                      })}
                                  >
                                      <label htmlFor="costitem">
                                          <b>Cost Item<span className='text-danger'>*</span></b> {this.state.fetchingCostitems ? <FaSpinner className="spin" /> : null }
                                      </label>

                                      <Select

                                           value={this.state.selectedCostitem}
                                           onChange={(event)=>this.handleMultiSelectChange(event,'costitem')}
                                           options={this.state.allCostItems}
                                           placeholder="Search cost items"
                                           noOptionsMessage={ () => "No cost items" }

                                       />

                                      <div className="valid-feedback"></div>
                                      <div className="invalid-feedback">Cost item is required</div>
                                  </div>

                                  <div
                                      className={utils.classList({
                                      "col-md-2 mb-2": true,
                                      "valid-field":
                                          !errors.currency && touched.currency,
                                      "invalid-field":
                                          errors.currency && touched.currency
                                      })}
                                  >
                                      <label htmlFor="departmentaggregate_name">
                                          <b>Currency<span className='text-danger'>*</span></b>
                                      </label>



                                      <select
                                        className="form-control"
                                        id="currency"
                                        placeholder=""
                                        name="currency"
                                        value={values.currency}
                                        onChange={(event)=>this.handleChange(event)}
                                        onBlur={handleBlur}
                                        required
                                        >
                                        <option value="">Select</option>
                                        <option value="NAIRA">Naira</option>
                                        <option value="DOLLAR">Dollar</option>
                                        <option value="NAIRA_DOLLAR">Naira/Dollar</option>

                                      </select>

                                      <div className="valid-feedback"></div>
                                      <div className="invalid-feedback">Currency is required</div>
                                  </div>

                                  <div
                                      className={utils.classList({
                                      "col-md-2 mb-2": true,
                                      "valid-field":
                                          !errors.unit_value && touched.unit_value,
                                      "invalid-field":
                                          errors.unit_value && touched.unit_value
                                      })}
                                  >
                                      <label htmlFor="unit_value">
                                          <b>Unit Value<span className='text-danger'>*</span></b>
                                      </label>

                                      <input
                                      type="number"
                                      className="form-control"
                                      id="unit_value"
                                      placeholder=""
                                      step="0.0001"
                                      name="unit_value"
                                      value={values.unit_value}
                                      onChange={(event)=>{this.handleChange(event); this.reCalculateCurrencyPortions()}}
                                      onBlur={handleBlur}
                                      required
                                      />

                                      <div className="valid-feedback"></div>
                                      <div className="invalid-feedback">Unit Value is required</div>
                                  </div>

                                  <div
                                      className={utils.classList({
                                      "col-md-2 mb-2": true,
                                      "valid-field":
                                          !errors.quantity && touched.quantity,
                                      "invalid-field":
                                          errors.quantity && touched.quantity
                                      })}
                                  >
                                      <label htmlFor="departmentaggregate_name">
                                          <b>Quantity<span className='text-danger'>*</span></b>
                                      </label>

                                      <input
                                      type="number"
                                      className="form-control"
                                      id="quantity"
                                      placeholder=""
                                      name="quantity"
                                      value={values.quantity}
                                      onChange={(event)=>{this.handleChange(event); this.reCalculateCurrencyPortions()}}
                                      onBlur={handleBlur}
                                      required
                                      />

                                      <div className="valid-feedback"></div>
                                      <div className="invalid-feedback">Quantity is required</div>
                                  </div>



                                  </div>


                                  <div className="form-row pt-2">

                                      {
                                        this?.state?.toggleFields?.NAIRA ?
                                        (
                                          <div
                                              className={utils.classList({
                                              "col-md-2 mb-2": true,
                                              "valid-field":
                                                  !errors.naira_portion  && touched.naira_portion,
                                              "invalid-field":
                                                  errors.naira_portion && touched.naira_portion
                                              })}
                                          >
                                              <label htmlFor="naira_portion">
                                                  <b>Naira Part (&#x20a6;)<span className='text-danger'>*</span></b>
                                              </label>



                                              <input
                                              type="number"
                                              className="form-control"
                                              id="naira_portion"
                                              placeholder=""
                                              name="naira_portion"
                                              value={values.naira_portion}
                                              onChange={(event)=>this.handleChange(event)}
                                              onBlur={handleBlur}
                                              step="0.0001"
                                              required
                                              />

                                              <div className="valid-feedback"></div>
                                              <div className="invalid-feedback">Naira Portion is required</div>
                                          </div>
                                        ) : null
                                      }
                                      {
                                        this?.state?.toggleFields?.DOLLAR ?
                                        (
                                          <div
                                              className={utils.classList({
                                              "col-md-2 mb-2": true,
                                              "valid-field":
                                                  !errors.currency_portion && touched.currency_portion,
                                              "invalid-field":
                                                  errors.currency_portion && touched.currency_portion
                                              })}
                                          >
                                              <label htmlFor="currency_portion">
                                                  <b>Dollar (USD) Part ($)<span className='text-danger'>*</span></b>
                                              </label>

                                              <input
                                              type="number"
                                              className="form-control"
                                              id="currency_portion"
                                              placeholder=""
                                              step="0.0001"
                                              name="currency_portion"
                                              value={values.currency_portion}
                                              onChange={(event)=>this.handleChange(event)}
                                              onBlur={handleBlur}
                                              required
                                              />

                                              <div className="valid-feedback"></div>
                                              <div className="invalid-feedback">Dollar portion is required</div>
                                          </div>
                                        ): null

                                      }




                                      <div
                                          className={utils.classList({
                                          "col-md-3 mb-2": true,
                                          "valid-field":
                                              !errors.entity && touched.entity,
                                          "invalid-field":
                                              errors.entity && touched.entity
                                          })}
                                      >
                                          <label htmlFor="entity">
                                              <b>Entry type<span className='text-danger'>*</span></b>
                                          </label>

                                          <select
                                            className="form-control"
                                            id="entity"
                                            placeholder=""
                                            name="entity"
                                            value={values.entity}
                                            onChange={(event)=>this.handleChange(event)}
                                            onBlur={handleBlur}
                                            required
                                            >
                                            <option value="">Select</option>
                                          {
                                            this.state?.allEntities?.map((en)=>{

                                              return (
                                                <option value={en}>{en}</option>
                                              )
                                            })
                                          }


                                          </select>

                                          <div className="valid-feedback"></div>
                                        <div className="invalid-feedback">Entry type is required</div>
                                      </div>

                                      <div
                                          className={utils.classList({
                                          "col-md-4 mb-2": true,
                                          "valid-field":
                                              !errors.description && touched.description,
                                          "invalid-field":
                                              errors.description && touched.description
                                          })}
                                      >
                                          <label htmlFor="departmentaggregate_name">
                                              <b>Description<span className='text-danger'>*</span></b>
                                          </label>

                                          <input
                                          type="text"
                                          className="form-control"
                                          id="description"
                                          placeholder=""
                                          name="description"
                                          value={values.description}
                                          onChange={(event)=>this.handleChange(event)}
                                          onBlur={handleBlur}
                                          required
                                          />

                                          <div className="valid-feedback"></div>
                                          <div className="invalid-feedback">Description is required</div>
                                      </div>
                                      <div className="col-md-1 pt-4">
                                        {
                                          this.state.editFormMode ? (
                                            <LaddaButton
                                                className={`btn mt-2 btn-sm btn-danger border-0 mr-2 mb-2 position-relative`}
                                                progress={0.5}
                                                data-style={CONTRACT}
                                                type="button"
                                                onClick={this.cancelEdit}
                                                >
                                                Cancel <FaTimes/>
                                            </LaddaButton>
                                          ): null
                                        }

                                      </div>

                                      </div>

                            </div>

                            <div className="col-md-1 border-left pt-3">

                              <div className=" ml-4 mt-5">

                                  <LaddaButton
                                      className={`btn btn-sm btn-${utils.isValid(this.createDepartmentAggregateSchema, this.state.createDepartmentAggregateForm) ? 'success':'secondary_custom'} border-0 mr-2 mb-2 position-relative`}

                                      progress={0.5}
                                      type='submit'
                                      data-style={EXPAND_RIGHT}
                                      >
                                      {this.state.editFormMode ? 'Update' : 'Add'} <FaArrowDown/>
                                  </LaddaButton>

                              </div>

                            </div>

                          </div>
                        </div>

                      </div>
                    </div>
                    </form>
                    );
                    }}

                    </Formik>



                    </div>
                  )}






                <div className="row mb-4">

                    <div className="col-md-12 mb-4">
                        <div className="cardx text-left">
                            <div className="card-body">

                              {
                                 this.props.updateentries && viewOrEditSelections.is_view ? (
                                   <div className="pb-2">

                                     <div className="float-right">
                                       <Dropdown>
                                         <Dropdown.Toggle variant="info_custom" className="text-white">
                                          Export <FaArrowDown/>
                                         </Dropdown.Toggle>
                                         <Dropdown.Menu>
                                           <Dropdown.Item onClick={()=>console.log('Excel')}><FaFileExcel/> Excel</Dropdown.Item>
                                           <Dropdown.Divider />
                                           <Dropdown.Item onClick={()=>console.log('CSV')}><FaFileCsv/> CSV</Dropdown.Item>
                                         </Dropdown.Menu>
                                       </Dropdown>
                                     </div>

                                   </div>
                                 )
                                :  (

                              <div className="float-right">
                                {
                                  CAN_IMPORT_PREVIOUS_ENTRIES && !this.props.updateentries  ? (
                                    <div className="input-group mb-3">
                                      <div className="input-group-prepend">
                                        <span className="input-group-text bg-info_custom text-white">
                                          Import previous entries

                                        </span>
                                      </div>
                                      <select className="form-control">
                                        <option>Select Version</option>
                                          <option>2020 (BV1)</option>
                                            <option>2020 (BV2)</option>
                                        <option>2019 (BV1)</option>

                                      </select>

                                      <div className="input-group-append">
                                        <Dropdown>
                                          <Dropdown.Toggle variant="info_custom" className="text-white">
                                            <FaCog/>
                                          </Dropdown.Toggle>
                                          <Dropdown.Menu>
                                            <Dropdown.Item onClick={()=>console.log('IMporting')}>Import <FaArrowDown/> </Dropdown.Item>
                                            <Dropdown.Divider />
                                            <Dropdown.Item onClick={()=>console.log('Adjusting')}>Adjust Imported Total <FaArrowsAlt/> </Dropdown.Item>
                                          </Dropdown.Menu>
                                        </Dropdown>
                                      </div>
                                    </div>
                                  ) :
                                  (<span className='badge badge-info_custom p-1'>Import Disabled <FaDownload/></span> )
                                }

                              </div>
                            )}

                            <div className="float-left">
                                <img src="/assets/images/logo.png" alt="Logo" className="modal-logo"/> &nbsp;&nbsp;
                                <b><span className='text-info'>*</span><em>Version Info: </em> {active_version?.version_code?.name} ({active_version?.version_code?.code}) &nbsp;&nbsp;<FaArrowsAlt/>&nbsp;&nbsp;</b>

                                <b><span className='text-danger'>*</span><em>Conversion rate: </em> 1USD = &#x20a6;{utils.formatNumber(this.state.usdConversionRate)}</b>
                            </div>


                            {/* <div style={{"maxHeight":"500px", "overflowY":"scroll"}}>
                                <h4 className="card-title"><b>Budget Cycle 2021</b></h4>
                                <div className="card-footer border-top">

                                  <div className="float-right">
                                    <LaddaButton
                                        className={`btn btn-${utils.isValid(this.createDepartmentAggregateSchema, this.state.createDepartmentAggregateForm) ? 'success':'secondary_custom'} border-0 mr-2 mb-2 position-relative`}
                                        loading={this.state.isSaving}
                                        progress={0.5}
                                        type='submit'
                                        data-style={EXPAND_RIGHT}
                                        >
                                        Add <FaArrowDown/>
                                    </LaddaButton>
                                  </div>

                                </div>
                            */}

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


                                               {
                                                  this.props.updateentries && viewOrEditSelections.is_view ? null
                                                 : (
                                                   <th className="text-rightx">
                                                     Action
                                                   </th>
                                                 )
                                               }

                                            </tr>
                                        </thead>
                                        <tbody>
                                        {
                                          this.state.allBudgetEntries.length ?  this.state.allBudgetEntries.map( (departmentaggregate, index)=>{
                                            const {editFormMode, editedIndex} = this.state;
                                                return (
                                                    <tr key={index} className={editFormMode && index==editedIndex ? 'bg-info_custom text-white line_entries shadow':'line_entries'}>
                                                        <td>
                                                            <b>{index+1}</b>.
                                                        </td>
                                                        <td>
                                                          {departmentaggregate?.category?.name} ({departmentaggregate?.category?.code})
                                                        </td>
                                                        <td>
                                                          {departmentaggregate?.costitem?.name} ({departmentaggregate?.costitem?.code})
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

                                                        {
                                                           this.props.updateentries && viewOrEditSelections.is_view ? null
                                                          : (
                                                            <td>


                                                              <span className="cursor-pointer text-success mr-3"
                                                                  onClick={()=> {this.editDepartmentAggregate(departmentaggregate, index)}
                                                                }
                                                                >
                                                                <i className="nav-icon i-Pen-2 font-weight-bold"></i>
                                                              </span>
                                                              <span className="cursor-pointer text-danger mr-2" onClick={()=>{
                                                                  this.deleteDepartmentAggregate(departmentaggregate, index)}
                                                                }>
                                                                <i className="nav-icon i-Close-Window font-weight-bold"></i>
                                                              </span>


                                                            </td>
                                                          )
                                                        }


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
                                        <tfoot className="line_entries_footer">
                                            <tr className="line_entries entries_footer">
                                            <th>
                                              TOTAL
                                            </th>

                                            <th colSpan="6">


                                              <div className="dash w-100"></div>

                                            </th>

                                            <th className="text-right">
                                              {utils.formatNumber(this?.state?.totals?.naira_part)}
                                              <div className="dash-2 w-100"></div>
                                            </th>
                                            <th className="text-right">
                                              {utils.formatNumber(this?.state?.totals?.currency_part)}
                                              <div className="dash-2 w-100"></div>


                                            </th>
                                            <th className="text-right">
                                              {utils.formatNumber(this?.state?.totals?.in_naira)}
                                              <div className="dash-2 w-100"></div>


                                            </th>
                                            <th className="text-right">
                                              {utils.formatNumber(this?.state?.totals?.in_currency)}
                                              <div className="dash-2 w-100"></div>


                                            </th>
                                            {
                                              this.props.updateentries && viewOrEditSelections.is_view ?
                                              null : (
                                            <th className="text-right">
                                              <LaddaButton
                                                  className={`btn btn-${this.state.allBudgetEntries.length > 0 ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
                                                  loading={this.state.isSaving}
                                                  progress={0.5}
                                                  type='button'
                                                  onClick={this.saveBudgetEntries}
                                                  data-style={EXPAND_RIGHT}
                                                  disabled={this.state.allBudgetEntries.length == 0}
                                                  >
                                                  {this.state.saveMsg}
                                              </LaddaButton>
                                            </th>
                                          )
                                        }

                                            </tr>

                                            {/* <tr className="ul-widget6__tr--sticky-th line_entries">
                                              <th colSpan="7"></th>
                                              <th colSpan="2"> {this.setProgressBar(this?.state?.viewedDepartmentAggregate)} </th>
                                            <th colSpan="2" className="text-center">{this.setEntriesStatus(this?.state?.viewedDepartmentAggregate)}</th>
                                            </tr> */}
                                        </tfoot>
                                    </table>


                                    <div className="card-footer">
                                      <div className="row">
                                        <div className="col-md-12">
                                          <div className="float-right pl-3">
                                            {this.setEntriesStatus(this?.state?.viewedDepartmentAggregate)}
                                          </div>

                                          <div className="float-right mt-1">
                                            <CustomProgressBar departmentaggregate={this?.state?.viewedDepartmentAggregate} allApprovals={this.state.allApprovals}/>
                                            {/* {this.setProgressBar(this?.state?.viewedDepartmentAggregate)} */}
                                          </div>
                                        </div>

                                      </div>


                                    </div>
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
        unit_value: yup.number("unit value must be required").required("Unit value is required"),
        quantity: yup.number("Quantity must be a number").required("Quantity is required"),
        currency: yup.string().required("Currency is required"),
        naira_portion: yup.number("Naira portio nmust be a number"),
        currency_portion: yup.number("Dollar portion must be a number"),
        entity: yup.string().required("Entry type is required"),
        description: yup.string().required("Description is required"),
        costitem: yup.string().required("Costitem is required"),
        category: yup.string().required("Category is required"),
      });


updateDepartmentAggregateSchema = yup.object().shape({
          unit_value: yup.number().required("Unit value is required"),
          quantity: yup.number().required("Quantity is required"),
          currency: yup.string().required("Currency is required"),
          naira_portion: yup.number(),
          currency_portion: yup.number(),
          entity: yup.string().required("Entity is required"),
          description: yup.string().required("Description is required"),
          costitem: yup.string().required("Costitem is required"),
          category: yup.string().required("Category is required"),
        });

}



const mapStateToProps = state => ({
    active_budget_cycle:state.budgetCycle,
});

const mapDispatchToProps = {
  getactivebudgetcycle,
};


export default withRouter(
  connect(mapStateToProps,mapDispatchToProps)(BudgetEntriesComponent)
);
