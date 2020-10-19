import React, { Component, useState, useEffect } from "react"
import { Dropdown, Row, Col, Button,Form, ButtonToolbar,Modal } from "react-bootstrap";
import SweetAlert from "sweetalert2-react";
import swal from "sweetalert2";
import PreparationService from "../../../services/preparation.service";
import AppMainService from "../../../services/appMainService";
import * as utils from "@utils";
import { Formik } from "formik";
import * as yup from "yup";
import AppNotification from "../../../appNotifications";
import {FetchingRecords, BulkTemplateDownload} from "../../../appWidgets";
import moment from "moment";
import { RichTextEditor } from "@gull";
import { FaCog, FaArrowDown, FaArrowsAlt, FaSpinner, FaTimes, FaEye, FaEdit } from "react-icons/fa";
import Select from 'react-select';
import { Link, Redirect } from "react-router-dom";


import LaddaButton, {
    XL,
    EXPAND_LEFT,
    EXPAND_RIGHT,
    EXPAND_UP,

    CONTRACT,
  } from "react-ladda";

export class BudgetEntriesComponent extends Component{


  preparationService;

    state = {
        navigate:false,
        updateEntries:false,
        viewOrEditSelections:{
          is_view:false,
          is_edit:false,
          isViewOrEdit:false
        },
        editedIndex:0,
        allBudgetEntries:[],
        allItemCategories:[],
        allCostItems:[],
        showEditModal:false,
        showSplitModal:false,
        showInstructionsModal:false,
        showDescriptionAlert:false,
        entryDescription:"",
        nairaOrCurrencyAmount:0,
        isSaving:false,
        isFetching:false,
        fetchingCostitems:false,
        firstVersion:{},
        usdConversionRate: 365,  // Just testing. This ideally should be set to null
        saveMsg:'Save',
        updateMsg:'Update',
        editedDepartmentAggregate: {},
        viewedDepartmentAggregate:{},
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
          allEntities:[],
          totals:{
            naira_part:0,
            currency_part:0,
            in_naira:0,
            in_currency:0
          }

    }



    constructor(props){
        super(props)
        this.preparationService = new PreparationService();
        this.appMainService = new AppMainService();
    }

    componentDidMount(){
      if(this.props.updateEntries){
        this.getAllBudgetEntriesByDepartmentSlug();

      }
         // this.getAllVersionCodes();
         this.getAllItemCategories();
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
            if(eventName =='currency' ){
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
      allCostItems, allBudgetEntries, usdConversionRate, toggleFields, totals, editFormMode } = this.state;
    let {naira_portion, currency_portion,} = createDepartmentAggregateForm;
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
      ...createDepartmentAggregateForm, category, costitem, naira_portion, currency_portion, total_naira, total_currency, totals
    };

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

  viewInstructions = (viewedDepartmentAggregate) => {
    this.setState({viewedDepartmentAggregate});
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



    /**
     * This method lists all itemcategories
     */
     getAllItemCategories = async ()=>{
       // Move to a getAllEntities method
       let { allEntities,createDepartmentAggregateForm } = this.state;
       if(!allEntities.length){
         createDepartmentAggregateForm.entity = "PRINCIPAL" // default entity
       }
       this.setState({allEntities, createDepartmentAggregateForm})
       // End getAllEntities method

        this.appMainService.getAllItemCategories().then(
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
      let { viewOrEditSelections } = this.state;

      return this.props.updateEntries ?(
        <div className="btn-group">
          <button className={`btn btn-lg btn-${viewOrEditSelections.is_view ? "success shadow":"info_custom"}`} onClick={()=>this.toggleViewOrEdit('view')}>
            View { viewOrEditSelections.is_view ? <FaEye/> : null}
          </button>
        <button className={`btn btn-lg btn-${viewOrEditSelections.is_edit ? "success shadow":"info"}`} onClick={()=>this.toggleViewOrEdit('edit')}>
          Edit { viewOrEditSelections.is_edit ? <FaEdit/> : null}
        </button>
        </div>
      ) : null
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

        viewOrEditSelections = {...viewOrEditSelections,is_view, is_edit }
        this.setState({ viewOrEditSelections })
    }



    /**
     * This method lists all budgetentries
     */
     getAllBudgetEntriesByDepartmentSlug = async ()=>{
         let isFetching = true;
         const slug = this.props.querySlug;
         let { totals } = this.state
        this.preparationService.getAllBudgetEntriesByDepartmentSlug(slug).then(
            async (budgetentriesResponse)=>{
               isFetching = false;

              const allBudgetEntries = budgetentriesResponse.map((entry)=>{
                totals.naira_part += entry.naira_portion
                totals.currency_part += entry.currency_portion
                totals.in_naira += entry.total_naira;
                totals.in_currency += entry.total_currency;
                return this.formatEntry(entry);
              });
              console.log(allBudgetEntries, "AKKSLLS")
              await  this.setState({ allBudgetEntries, isFetching, totals }); // so allBudgetEntries is set

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
     * This method creates a new departmentaggregate
     */
    saveBudgetEntries = async ()=>{
        let { allBudgetEntries, totals, navigate, updateEntries} = this.state;
        let isSaving = true;
        let saveMsg = 'Saving';
        this.setState({isSaving, saveMsg})
        const aggregateData = {
          department:1,
          budgetcycle:1,
          capturer:1,
          total_functional_naira:totals.in_naira,
          total_functional_currency:totals.in_currency,
          total_naira_portion:totals.naira_part,
          total_currency_portion:totals.currency_part,
          entries:[]
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
        console.log(aggregateData)

        this.preparationService.createDepartmentAggregate(aggregateData).then(
            async (departmentaggregateData) => {
                isSaving = false;
                saveMsg = 'Save';
                const successNotification = {
                    type:'success',
                    msg:`Budget entries successfully ${updateEntries ? 'updated' : 'created'}!`
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
        let {showEditModal, showSplitModal, showInstructionsModal, toggleFields, createDepartmentAggregateForm } = this.state;
        if(modalName == 'split_type'){
            showSplitModal = !showSplitModal;
            toggleFields.PERCENTAGE_SPLIT = false;
            createDepartmentAggregateForm.naira_portion = ""
            createDepartmentAggregateForm.currency_portion = ""
        }else if(modalName == 'edit'){
            showEditModal = !showEditModal
        }else if(modalName=='instructions'){
          showInstructionsModal = !showInstructionsModal
        }

        this.setState({ showEditModal, showSplitModal, showInstructionsModal, toggleFields, createDepartmentAggregateForm })

    }

    toggleAlert = ()=>{
      let {showDescriptionAlert} = this.state;
      showDescriptionAlert = !showDescriptionAlert;
      this.setState({showDescriptionAlert});
    }

    showDescription = async(entryDescription) =>{
      await this.setState({entryDescription})
      this.toggleAlert();
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
                title: `<small>Delete this&nbsp;<b>${category.name? category.name : "" +" | "+ costitem.name ? costitem.name : "" }... item</b>?</small>`,
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
                let { allBudgetEntries } = this.state
                if(!departmentaggregate.id){ // doesnt exist at the backend
                  allBudgetEntries.splice(entryIdex, 1);
                  this.reduceTotal(departmentaggregate);
                   this.setState({ allBudgetEntries });
                  return this.checkDeleteDuringEdit(entryIdex);
                }

                  this.preparationService.deleteDepartmentAggregate(departmentaggregate).then(
                    async (deletedDepartmentAggregate) => {
                        allBudgetEntries = allBudgetEntries.filter(r=> r.id !== departmentaggregate.id)
                      await this.setState({ allBudgetEntries });
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

      checkDeleteDuringEdit = async (entryIndex) =>{
       let { editedIndex, createDepartmentAggregateForm, editFormMode } = this.state;
       if(entryIndex == editedIndex && editFormMode){
        this.cancelEdit();
       }
     }



    render(){

      const { navigate, viewOrEditSelections } = this.state;

        return navigate ? <Redirect to="/preparation/budget-entries"/> : (

            <>
                <div className="specific">

                  <SweetAlert
                    show={this.state.showDescriptionAlert}
                    title="Description"
                    text={this.state.entryDescription}
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
                                         <small className="text-primary">Rate: 1USD = &#x20a6;365</small>
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
                    <Button  variant="secondary_custom" className="ripple m-1 text-capitalize" onClick={ ()=>{ this.toggleModal('create')} } ><i className='i-Add'></i> View  instructions</Button>
                </div>

                <div className="breadcrumb">
                    <h1>{this.props.updateEntries ? this.viewOrEditButton() : "Create" } Entries</h1>
                    <ul>
                      <li>
                        <a href="#">
                        Bulk  {this.props.updateEntries ? "update" : "insert" }
                      </a>
                    </li>
                        <li><a href="#">Import</a></li>
                        <li>Add lines</li>
                    </ul>

                    <div className="d-inline pl-5">
                      <BulkTemplateDownload caller="itemcategories" refresh={this.getAllItemCategories}/>
                    </div>
                </div>

                <div className="separator-breadcrumb border-top"></div>


                {
                  this.props.updateEntries && viewOrEditSelections.is_view ?
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
                                            <option value="PRINCIPAL">Principal</option>


                                          </select>

                                          <div className="valid-feedback"></div>
                                          <div className="invalid-feedback">Entity is required</div>
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
                                      loading={this.state.isSaving}
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
                              <div className="float-right">
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
                              </div>

                            <div className="float-left">
                                <img src="/assets/images/logo.png" alt="Logo" className="modal-logo"/> &nbsp;&nbsp;<b><span className='text-danger'>*</span>Conversion rate: 1USD = &#x20a6;365</b>
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
                                                  this.props.updateEntries && viewOrEditSelections.is_view ? null
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
                                                          <a onClick={()=>this.showDescription(departmentaggregate?.description)}  className="text-primary long-view">View</a>
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
                                                           this.props.updateEntries && viewOrEditSelections.is_view ? null
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
                                              this.props.updateEntries && viewOrEditSelections.is_view ?
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
                                                 this.props.updateEntries && viewOrEditSelections.is_view ?
                                                 null : (
                                               <th className="text-right">
                                                 Action
                                               </th>
                                             )
                                           }
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




export default BudgetEntriesComponent
