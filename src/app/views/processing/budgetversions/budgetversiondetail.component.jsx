import React, { Component, useState, useEffect } from "react"
import { Dropdown, Row, Col, Button,Form, ButtonToolbar,Modal } from "react-bootstrap";
// import SweetAlert from "sweetalert2-react";
import swal from "sweetalert2";
import ProcessingService from "../../../services/processing.service";
import AppMainService from "../../../services/appMainService";
import * as utils from "@utils";
import { Formik } from "formik";
import * as yup from "yup";
import AppNotification from "../../../appNotifications";
import { FetchingRecords, CustomProgressBar } from "../../../appWidgets";
import moment from "moment";
import { RichTextEditor } from "@gull";
import { FaCog, FaCheck } from "react-icons/fa";


import LaddaButton, {
    XL,
    EXPAND_LEFT,
    EXPAND_RIGHT,
    EXPAND_UP,

    CONTRACT,
  } from "react-ladda";

export class BudgetVersionDetailsComponent extends Component{


    state = {
        editedIndex:0,
        allBudgetVersionDetails:[],
        showEditModal:false,
        showCreateModal:false,
        showInstructionsModal:false,
        isSaving:false,
        isFetching:false,
        firstVersion:{},
        saveMsg:'Save',
        updateMsg:'Update',
        editedBudgetVersionDetail: {},
        viewedBudgetVersionDetail:{},
        allBudgetEntries:[],
        allAggregates:[],
        entryTypes:[

        ],
        grandTotals:{
          naira:0,
          dollar:0,
          in_naira:0,
          in_dollar:0
        },
        createBudgetVersionDetailForm: {
            year: "",
            start_date: "",
            end_date: "",
            currency_conversion_rate: "",
            instructions: "",
          },
          updateBudgetVersionDetailForm: {
            year: "",
            start_date: "",
            end_date: "",
            currency_conversion_rate: "",
            instructions: "",
          },
          availableYears:[],
          allApprovals:[],

    }
    processingService;



    constructor(props){
        super(props)
        this.processingService = new ProcessingService();
        this.appMainService = new AppMainService();
    }

    componentDidMount(){
         this.getBudgetVersionBySlug();
         // this.getAllVersionCodes();
         this.getAllApprovals();
         const entryTypes = JSON.parse( localStorage.getItem('ENTITIES'));
         this.setState({ entryTypes })

         //
    }

    /**
     *
     * @param {*} event
     * @param {*} errors
     * @param {*} form
     */

    handleChange = (event, form='create') => {
        const {createBudgetVersionDetailForm, updateBudgetVersionDetailForm} = this.state
        if(form=='create'){
            createBudgetVersionDetailForm[event.target.name] = event.target.value;
        }else if(form=='edit'){
            updateBudgetVersionDetailForm[event.target.name] = event.target.value;
        }
        this.setState({ createBudgetVersionDetailForm, updateBudgetVersionDetailForm });
    }

    handleRichEditorChange = (html, form='create') => {
      const {createBudgetVersionDetailForm, updateBudgetVersionDetailForm} = this.state
      if(form=='create'){
        createBudgetVersionDetailForm['instructions'] = html;
      }else{
        updateBudgetVersionDetailForm['instructions'] = html;
      }
      this.setState({ createBudgetVersionDetailForm, updateBudgetVersionDetailForm });

    }

    /**
     * This method lists all versioncodes
     */
     getAllVersionCodes = async ()=>{
        this.appMainService.getAllVersionCodes().then(
            async(versioncodesResponse)=>{
                // const allVersionCodes = versioncodesResponse;
                const firstVersion = versioncodesResponse.find(v => v.step == 1);
                this.setState({ firstVersion })
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
     * This method listm a budget version by slug
     */
     getBudgetVersionBySlug = async ()=>{
         let { viewedBudgetVersionDetail, allBudgetEntries, allAggregates, isFetching } = this.state;
         isFetching = !isFetching;
         this.setState({ isFetching })
        this.processingService.getBudgetVersionBySlug(this.props.match.params.slug).then(
            async (budgetversionsResponse)=>{
              isFetching = !isFetching;

              const { version, aggregates } = budgetversionsResponse;
              viewedBudgetVersionDetail = version;
              allAggregates = this.buildGroupedEntries(aggregates);
              console.log("AGGGERRERE", allAggregates, budgetversionsResponse)

              this.setState({ viewedBudgetVersionDetail, allAggregates, isFetching }); // so  is set

                console.log('BudgetVersionDetails response', budgetversionsResponse, viewedBudgetVersionDetail)
            }
        ).catch((error)=>{
          isFetching = !isFetching;
            this.setState({isFetching})
            const errorNotification = {
                type:'error',
                msg:utils.processErrors(error)
            }
            new AppNotification(errorNotification)
            console.log('Error', error)
        })
    }


    buildVersionRows = (aggregate) =>{

      const { department, summary, total_naira_portion, total_currency_portion, total_functional_currency, total_functional_naira } = aggregate;




      const OtherRows = () => Object.keys(summary).map((key)=>{
        const key_entries = `${key}_ENTRIES`;
        const entries = summary[key][key_entries];
        const entries_length = entries.length;
        const { total_in_naira, total_in_currency, total_naira_part,  total_currency_part } = summary[key];

        return  (
          <>
          <tr>
            <td colSpan="9" className="text-center">
              <b><em>{key}</em></b>
            </td>
          </tr>

                  {
                    entries_length ? entries.map((entry)=>{
                      const { costitem, currency_portion, description, unit_value,quantity, naira_portion, total_currency, total_naira }  = entry;
                      const { category } = costitem;
                      return (
                      <tr>
                      <td>{category?.name} ({category?.code})</td>
                      <td>{costitem?.name} ({costitem?.code})</td>
                      <td>{description}</td>
                      <td>{utils.formatNumber(unit_value, false)}</td>
                      <td>{utils.formatNumber(quantity, false)}</td>
                      <td className="text-right">{utils.formatNumber(naira_portion)}</td>
                      <td className="text-right">{utils.formatNumber(currency_portion)}</td>
                      <td className="text-right">{utils.formatNumber(total_naira)}</td>
                      <td className="text-right">{utils.formatNumber(total_currency)}</td>
                    </tr>

                  )
                }) : (
                  <tr>
                  <td colSpan="9" className='text-center'>
                    <FetchingRecords emptyMsg="No entries"/>
                  </td>

                </tr>)}


                <tr className="sub_row line_entries">
                  <th className="text-muted">
                    <h6 className="text-muted"><em><b>Sub Total:</b></em></h6>
                  </th>
                  <th colSpan="4">
                    <div className="dash-mid w-100"></div>
                </th>
                  <th className="text-right text-muted">{utils.formatNumber(total_naira_part)}
                    <div className="dash-mid-2 w-100"></div>

                  </th>
                  <th className="text-right text-muted">{utils.formatNumber(total_currency_part)}
                    <div className="dash-mid-2 w-100"></div>

                  </th>
                  <th className="text-right text-muted">{utils.formatNumber(total_in_naira)}
                    <div className="dash-mid-2 w-100"></div>

                  </th>
                  <th className="text-right text-muted">{utils.formatNumber(total_in_currency)}
                    <div className="dash-mid-2 w-100"></div>

                  </th>

                </tr>


              </>


      )


        })

        const FooterRow = () => (



          <tr className="line_entries_footer line_entries entries_footer">
            <th>
                <h5 className="mt-2"><em>{department?.name}{department?.name?.endsWith('s')?"'":"'s'"} Total:</em></h5>
            </th>

            <th colSpan="9">
              <table className="table">
                <thead>
                  <tr>
                    <th colSpan="5"></th>


                    <th className="text-right">
                      {utils.formatNumber(total_naira_portion)}
                      <div className="dash-2"></div>

                    </th>
                    <th className="text-right">
                      {utils.formatNumber(total_currency_portion)}
                      <div className="dash-2 "></div>

                    </th>
                    <th className="text-right">
                      {utils.formatNumber(total_functional_naira)}
                      <div className="dash-2"></div>


                    </th>
                    <th className="text-right">
                      {utils.formatNumber(total_functional_currency)}
                      <div className="dash-2"></div>

                    </th>
                  </tr>

                </thead>
              </table>
            </th>


          </tr>

        )

      const BodyRows = () => (
      <>
        <tbody>
          <tr>
            <td>
              <h5><b>{department?.name} ({department?.code})</b></h5>
            </td>
            <td colSpan="9">
              <table className="table table-striped table-hover">
                <thead>
                      <tr>
                      <th>Category</th>
                      <th>
                        Cost item
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
                        Naira part (₦)
                      </th>
                      <th className="text-right">
                        USD part ($)
                      </th>
                      <th className="text-right">
                        Total in Naira (₦)
                      </th>
                      <th className="text-right">
                        Total in USD ($)
                      </th>
                    </tr>
                </thead>
                <tbody>
                  <OtherRows/>
                </tbody>

              </table>
            </td>
          </tr>
          <FooterRow/>
        </tbody>
      </>



      )





        return (
          <>
            <BodyRows/>
          </>
        )


    }


    buildGroupedEntries = (allDepartmentAggregates) =>{
      let { entryTypes, grandTotals } = this.state;
      allDepartmentAggregates.forEach((aggregate) =>{
        const { total_naira_portion, total_currency_portion, total_functional_currency, total_functional_naira } = aggregate;
        let { naira, dollar, in_naira, in_dollar } = grandTotals;
        dollar+=total_currency_portion;
        naira+=total_naira_portion;
        in_dollar+= total_functional_currency;
        in_naira += total_functional_naira;
        grandTotals = { naira, dollar, in_naira, in_dollar };

        const { budgetversion } = aggregate;
        aggregate['summary'] = {};
        const entries = aggregate['entries']
        entryTypes.forEach((entryType)=>{
          aggregate['summary'][entryType] = this.buildEntriesByType(entries, entryType)
        })
      })
      this.setState({grandTotals });

      return allDepartmentAggregates;
    }

    buildEntriesByType = (entries, entryType)=>{
      const entry_type_entries = `${entryType}_ENTRIES`;
      const summaryItem = {
        total_naira_part:0,
        total_currency_part:0,
        total_in_naira:0,
        total_in_currency:0,
        [entry_type_entries]:[]
      };
      entries.forEach((entry)=>{
        if(entry.entity == entryType){
          summaryItem.total_naira_part += entry.naira_portion
          summaryItem.total_currency_part += entry.currency_portion
          summaryItem.total_in_naira+= entry.total_naira
          summaryItem.total_in_currency += entry.total_currency
          summaryItem[entry_type_entries].push(entry);
        }
      })
      return summaryItem;
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

    /**
     * Filter years
     * @type {[type]}
     */

    filterYears = async ()=>{
      const { allBudgetVersionDetails } = this.state;
      const futureYears = this.getFutureYears(moment().year());
      const budgetYears = allBudgetVersionDetails.map(budgetVersionDetail => +budgetVersionDetail.year);
      const availableYears = futureYears.filter(yr => !budgetYears.includes(+yr)).sort();
      this.setState({availableYears});
    }

    /**
     * This method creates a new budgetversion
     */
    createBudgetVersionDetail = async ()=>{
        const {createBudgetVersionDetailForm, allBudgetVersionDetails, firstVersion} = this.state;
        let isSaving = true;
        let saveMsg = 'Saving';
        this.setState({isSaving, saveMsg})
        this.processingService.createBudgetVersionDetail(createBudgetVersionDetailForm).then(
            async (budgetversionData) => {
                isSaving = false;
                saveMsg = 'Save';
                budgetversionData['active_version'] = firstVersion //making sure
                allBudgetVersionDetails.unshift(budgetversionData)
              await this.setState({ allBudgetVersionDetails, isSaving, saveMsg })
                this.filterYears();
                const successNotification = {
                    type:'success',
                    msg:`${budgetversionData.year} successfully created!`
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


    viewInstructions = (viewedBudgetVersionDetail) => {
      this.setState({viewedBudgetVersionDetail});
      this.toggleModal('instructions');

    }


    /**
     * This method updates a new budgetversion
     */
    updateBudgetVersionDetail = async ()=>{

        let {updateBudgetVersionDetailForm, allBudgetVersionDetails, editedBudgetVersionDetail} = this.state;
        let isSaving = true;
        let updateMsg = 'Updating';
        this.setState({isSaving, updateMsg})
        this.processingService.updateBudgetVersionDetail(updateBudgetVersionDetailForm, editedBudgetVersionDetail.id).then(
            (updatedBudgetVersionDetail)=>{
                updatedBudgetVersionDetail.temp_flash = true
                isSaving = false;
                updateMsg = 'Update';
                allBudgetVersionDetails.splice(this.state.editedIndex, 1, updatedBudgetVersionDetail)
                this.setState({ allBudgetVersionDetails, isSaving, updateMsg })
                const successNotification = {
                    type:'success',
                    msg:`Budget version ${updatedBudgetVersionDetail.year} successfully updated!`
                }
                new AppNotification(successNotification)
                this.toggleModal('edit');

             setTimeout(async ()=>{
                    updatedBudgetVersionDetail.temp_flash = false
                    allBudgetVersionDetails.splice(this.state.editedIndex, 1, updatedBudgetVersionDetail)
                    await this.setState({ allBudgetVersionDetails, isSaving, updateMsg })
                    this.filterYears();
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
        let {showEditModal, showCreateModal, showInstructionsModal } = this.state;
        if(modalName == 'create'){
            showCreateModal = !showCreateModal;
        }else if(modalName == 'edit'){
            showEditModal = !showEditModal
        }else if(modalName=='instructions'){
          showInstructionsModal = !showInstructionsModal
        }

        this.setState({ showEditModal, showCreateModal, showInstructionsModal })

    }



    /**
     *
     * This method sets the budgetversion to be edited
     *  and opens the modal for edit
     *
     */
    editBudgetVersionDetail = (editedBudgetVersionDetail) => {
        const updateBudgetVersionDetailForm = {...editedBudgetVersionDetail}
        const {availableYears} = this.state;
        //
        availableYears.push(+editedBudgetVersionDetail.year);
        availableYears.sort();
        //
        const editedIndex = this.state.allBudgetVersionDetails.findIndex(budgetversion => editedBudgetVersionDetail.id == budgetversion.id)
        this.setState({editedBudgetVersionDetail, editedIndex, updateBudgetVersionDetailForm, availableYears});
        this.toggleModal('edit')
    }


    /**
     *
     * @param {*} budgetversion
     * This method toggles a budgetversion's status
     */
    toggleBudgetVersionDetail = (budgetversion)=>{
      return ;
        const toggleMsg = budgetversion.is_current? "Disable":"Enable";
        const gL = budgetversion.is_current? ".":", and notifications will be sent out";


        swal.fire({
            title: `<small>${toggleMsg}&nbsp;<b>${budgetversion.year}</b>?</small>`,
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
                let { allBudgetVersionDetails } = this.state
                const toggleIndex = allBudgetVersionDetails.findIndex(r => r.id == budgetversion.id)
                // budgetversion.status = !budgetversion.status;

              this.processingService.toggleBudgetVersionDetail(budgetversion).then(
                (toggledBudgetVersionDetail)=>{
                    allBudgetVersionDetails.splice(toggleIndex, 1, toggledBudgetVersionDetail)
                    this.setState({ allBudgetVersionDetails })
                    const successNotification = {
                        type:'success',
                        msg:`Budget version ${toggledBudgetVersionDetail.year} successfully ${toggleMsg}d!`
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
     * @param {*} budgetversion
     * This method deletes a budgetversion
     *
     */
    deleteBudgetVersionDetail = (budgetversion)=>{
         swal.fire({
                title: `<small>Delete&nbsp;<b>${budgetversion.year}</b>?</small>`,
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
                let { allBudgetVersionDetails } = this.state
                  this.processingService.deleteBudgetVersionDetail(budgetversion).then(
                    async (deletedBudgetVersionDetail) => {
                        allBudgetVersionDetails = allBudgetVersionDetails.filter(r=> r.id !== budgetversion.id)
                      await this.setState({ allBudgetVersionDetails });
                      this.filterYears();
                        const successNotification = {
                            type:'success',
                            msg:`Budget version ${budgetversion.year} successfully deleted!`
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
        const createBudgetVersionDetailForm = {
            name: "",
            description: "",
          }
          this.setState({createBudgetVersionDetailForm})

    }

    render(){

      const { allBudgetEntries, allAggregates, grandTotals } = this.state;
      const {naira, dollar, in_naira, in_dollar } = grandTotals;

        return (

            <>
                <div className="specific">


                                  <Modal show={this.state.showInstructionsModal} onHide={
                                      ()=>{ this.toggleModal('instructions')}
                                      } {...this.props} id='instructions_modal'>
                                      <Modal.Header closeButton>

                                      <Modal.Title>
                                        <img src="/assets/images/logo.png" alt="Logo" className="modal-logo"  />&nbsp;&nbsp;
                                        Instructions for <b>{this.state?.viewedBudgetVersionDetail?.year}</b>
                                    </Modal.Title>
                                      </Modal.Header>

                                               <Modal.Body>

                                                 <div dangerouslySetInnerHTML={{__html: this.state.viewedBudgetVersionDetail.instructions}} />

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



                <Modal show={this.state.showEditModal} onHide={
                                                      ()=>{ this.toggleModal('edit')}
                                                      } {...this.props} id='edit_modal'>
                                                      <Modal.Header closeButton>
                                                      <Modal.Title>
                                                        <img src="/assets/images/logo.png" alt="Logo" className="modal-logo"  />&nbsp;&nbsp;

                                                        Update budget version <b>{this.state.editedBudgetVersionDetail.year}</b>
                                                    </Modal.Title>
                                                      </Modal.Header>

                                                      <Formik
                                                      initialValues={this.state.updateBudgetVersionDetailForm}
                                                      validationSchema={this.updateBudgetVersionDetailSchema}
                                                      onSubmit={this.updateBudgetVersionDetail}
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
                                                                      <label htmlFor="budgetversion_name">
                                                                          <b>Year<span className='text-danger'>*</span></b>
                                                                      </label>

                                                                    <select
                                                                      className="form-control"
                                                                      id="budgetversion_name"
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
                                                                      <label htmlFor="budgetversion_name">
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
                                                                      <label htmlFor="budgetversion_name">
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
                                                                      <label htmlFor="budgetversion_name">
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
                                                                      <label htmlFor="edit_budgetversion_description">
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
                                                                          className={`btn btn-${utils.isValid(this.updateBudgetVersionDetailSchema, this.state.editBudgetVersionDetailForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
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

                      Create Budget Version
                    </Modal.Title>
                    </Modal.Header>

                    <Formik
                    initialValues={this.state.createBudgetVersionDetailForm}
                    validationSchema={this.createBudgetVersionDetailSchema}
                    onSubmit={this.createBudgetVersionDetail}
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
                                    <label htmlFor="budgetversion_name">
                                        <b>Year<span className='text-danger'>*</span></b>
                                    </label>

                                  <select
                                    className="form-control"
                                    id="budgetversion_name"
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
                                    <label htmlFor="budgetversion_name">
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
                                    <label htmlFor="budgetversion_name">
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
                                    <label htmlFor="budgetversion_name">
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
                                    <label htmlFor="create_budgetversion_description">
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
                                        className={`btn btn-${utils.isValid(this.createBudgetVersionDetailSchema, this.state.createBudgetVersionDetailForm) ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
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

                  <Dropdown>
                     <Dropdown.Toggle variant='success' className="mr-3 mb-3" size="sm">
                    <FaCog/> Manage
                     </Dropdown.Toggle>
                     <Dropdown.Menu>
                     <Dropdown.Item onClick={()=> {
                         console.log('void');
                     }} className='border-bottom'>
                         <FaCheck className ="text-success"/> Post budget
                     </Dropdown.Item>
                     <Dropdown.Item className='border-bottom'>
                         <i className="i-Money-Bag text-info font-weight-bold"> </i>Export to Excel
                     </Dropdown.Item>

                     <Dropdown.Item className='border-bottom'>
                         <i className="i-Money-Bag text-warning font-weight-bold"> </i> Export to CSV
                     </Dropdown.Item>

                     {/* <Dropdown.Item className='text-danger' onClick={
                        () => {console.log('void');}
                         }>
                         <i className="i-Close-Window"> </i> Delete
                     </Dropdown.Item> */}
                     </Dropdown.Menu>
                 </Dropdown>
              </div>


                <div className="breadcrumb">
                    <h1>
                        {this.state.viewedBudgetVersionDetail?.budgetcycle?.year} {this.state.viewedBudgetVersionDetail?.version_code?.name} ({this.state.viewedBudgetVersionDetail?.version_code?.code})
                  </h1>
                    <ul>
                        <li><a href="#">View</a></li>
                        <li>Detail</li>
                      <li>
                        <marquee className="text-info">Conversion Rate: <b>1USD=&#x20a6;{utils.formatNumber(this.state.viewedBudgetVersionDetail?.budgetcycle?.currency_conversion_rate)}</b></marquee>
                      </li>
                    </ul>
                </div>

                {/* <div className="separator-breadcrumb border-top"></div> */}
                <div className="row mb-4">

                    {/* <div className="col-md-4 mb-4">
                    </div> */}

                    <div className="col-md-12 mb-4">
                        <div className="card shadow-lg text-left">
                            <div className="card-body">


                            {/* <div style={{"maxHeight":"500px", "overflowY":"scroll"}}> */}

                            <div className="table-responsive">
                                    <table className="display tablex table-sm table-stripedx table-hoverx " id="zero_configuration_table" style={{"width":"100%"}}>
                                        <thead>
                                            <tr className="ul-widget6__tr--sticky-th">
                                                <th>Date Created</th>
                                                <th>Date Approved</th>
                                                <th>Status</th>
                                                <th>Progress</th>
                                                <th>Tracking Account</th>
                                                <th className="text-center">Ledger Activity</th>
                                                <th className="text-center">Grand Totals</th>

                                                {/* <th>Action</th> */}
                                            </tr>
                                        </thead>
                                        <tbody>

                                          {
                                            this.state.isFetching ?
                                            (
                                                  <tr>
                                                      <td className='text-center' colSpan='9'>
                                                      <FetchingRecords isFetching={this.state.isFetching} />
                                                      </td>
                                                  </tr>
                                              )
                                             :(

                                            <tr key={this.state.viewedBudgetVersionDetail.id} className={this.state.viewedBudgetVersionDetail.temp_flash ? 'bg-success text-white':''}>

                                                {/* <td>
                                                    {budgetcycle?.year} {version_code?.name} ({version_code?.code})
                                                </td> */}

                                                <td>
                                                {utils.formatDate(this.state.viewedBudgetVersionDetail.created_at)}
                                                </td>

                                                <td>
                                                  {this.state.viewedBudgetVersionDetail?.approval_date ? utils.formatDate(this.state.viewedBudgetVersionDetail?.approval_date) : 'Pending'}
                                                </td>

                                                <td>
                                                <Form>

                                                     <Form.Check
                                                            checked={this.state.viewedBudgetVersionDetail.is_active}
                                                            type="switch"
                                                            id={`custom-switch${this.state.viewedBudgetVersionDetail.id}`}
                                                            label={this.state.viewedBudgetVersionDetail.is_active ? 'Running' : 'Closed'}
                                                            className={this.state.viewedBudgetVersionDetail.is_active ? 'text-success' : 'text-danger'}
                                                            onChange={()=> this.toggleBudgetVersionDetail(this.state.viewedBudgetVersionDetail)}
                                                        />


                                                    </Form>
                                                </td>

                                                <td>
                                                  <CustomProgressBar departmentaggregate={{}} budgetVersion={this.state.viewedBudgetVersionDetail} allApprovals={this.state.allApprovals}/>
                                                </td>

                                                <td>
                                                  {this.state.viewedBudgetVersionDetail?.account_system}
                                                </td>

                                                  <td>

                                                  <div className="table-responsive">
                                                    <table className="table table-striped">
                                                      <thead>
                                                        <tr>
                                                          <th>
                                                            #
                                                          </th>
                                                          <th>
                                                            Status
                                                          </th>
                                                          <th>
                                                            Log
                                                          </th>
                                                          <th>
                                                            Processed At
                                                          </th>
                                                        </tr>

                                                      </thead>

                                                      <tbody>
                                                        <tr>
                                                          <td colSpan="4">

                                                          </td>
                                                        </tr>
                                                      </tbody>

                                                    </table>

                                                  </div>

                                                </td>

                                                <td>

                                                <div className="table-responsivex">
                                                  <table className="table table-stripedx">

                                                    <tbody>
                                                      <tr>
                                                        <th className="text-mutedx">Naira Part:</th>
                                                      <td>&#x20a6;{utils.formatNumber(naira)}</td>
                                                      </tr>
                                                      <tr>
                                                        <th className="text-mutedx">Dollar Part:</th>
                                                      <td>${utils.formatNumber(dollar)}</td>
                                                      </tr>
                                                      <tr>
                                                        <th className="text-mutedx">Total in Naira:</th>
                                                      <td>&#x20a6;{utils.formatNumber(in_naira)}</td>
                                                      </tr>
                                                      <tr>
                                                        <th className="text-mutedx">Total in USD:</th>
                                                      <td>${utils.formatNumber(in_dollar)}</td>
                                                      </tr>
                                                    </tbody>

                                                  </table>

                                                </div>

                                              </td>



                                                {/* <td>
                                                 <Dropdown key={budgetversion.id}>
                                                    <Dropdown.Toggle variant='secondary_custom' className="mr-3 mb-3" size="sm">
                                                    Manage
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                    <Dropdown.Item onClick={()=> {
                                                        this.editBudgetVersionDetail(budgetversion);
                                                    }} className='border-bottom'>
                                                        <i className="nav-icon i-Eye text-primary font-weight-bold"> </i> View
                                                    </Dropdown.Item>
                                                    <Dropdown.Item className='text-danger' onClick={
                                                        ()=>{this.deleteBudgetVersionDetail(budgetversion);}
                                                    }>
                                                        <i className="i-Close-Window"> </i> Delete
                                                    </Dropdown.Item>
                                                    <Dropdown.Item className='border-bottom'>
                                                        <i className="i-Money-Bag text-info font-weight-bold"> </i>Disable Capture
                                                    </Dropdown.Item>

                                                    <Dropdown.Item className='border-bottom'>
                                                        <i className="i-Money-Bag text-warning font-weight-bold"> </i> Archive Version
                                                    </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>

                                                </td> */}

                                            </tr>


                                            )
                                          }



                                        </tbody>

                                    </table>
                                </div>
                            </div>

                            </div>
                        </div>

                      <div className="col-md-12">

                          <div className="table-responsive ">

                            <table className="table">

                              <thead>
                                <tr>
                                <th>
                                    <h4>Department</h4>
                                </th>
                                <th colSpan="9">
                                    <h4 className="text-center">Entries</h4>
                                </th>
                                </tr>

                              </thead>



                              {
                                  allAggregates.length ?  allAggregates.map((aggregate)=>{
                                    const { entries } = aggregate

                                  return (
                                    <>
                                      {this.buildVersionRows(aggregate)}
                                    </>
                                  )

                                  }) : (
                                    <tr>
                                        <td className='text-center' colSpan='11'>
                                        <FetchingRecords isFetching={this.state.isFetching} />
                                        </td>
                                    </tr>
                                  )
                              }




                          </table>

                          </div>


                      </div>



                </div>

                </div>

            </>
        )



    }

createBudgetVersionDetailSchema = yup.object().shape({
        year: yup.string().required("Year is required"),
        instructions: yup.string().required("instructions is required"),
        start_date: yup.string().required("Start date is required"),
        end_date: yup.string().required("End date is required"),
        currency_conversion_rate: yup.number().required("Conversion rate is required"),
      });


updateBudgetVersionDetailSchema = yup.object().shape({
          year: yup.string().required("Year is required"),
          instructions: yup.string().required("instructions is required"),
          start_date: yup.string().required("Start date is required"),
          end_date: yup.string().required("End date is required"),
          currency_conversion_rate: yup.number().required("Conversion rate is required"),
        });

}




export default BudgetVersionDetailsComponent
