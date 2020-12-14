import React, { Component } from "react";
import { Dropdown, Row, Col, Accordion, Button, Card, Form, ButtonToolbar, Modal, } from "react-bootstrap";
import {FaCheck, FaTimes, FaList, FaPlusCircle, FaMinusCircle }from "react-icons/fa";
import ProcessingService from "../../services/processing.service";
import AppMainService from "../../services/appMainService";
import jwtAuthService from "../../services/jwtAuthService";
import AppNotification from "../../appNotifications";
import { FetchingRecords, CustomProgressBar } from "../../appWidgets";
import * as utils from "@utils";
import { RichTextEditor } from "@gull";

import LaddaButton, {
    XL,
    EXPAND_LEFT,
    EXPAND_RIGHT,
    EXPAND_UP,

    CONTRACT,
  } from "react-ladda";


class ConsolidatedApproval extends Component {


  processingService;

  constructor(props){
    super(props);
    this.processingService = new ProcessingService();
    this.appMainService = new AppMainService();
  }

  state = {
      editedIndex:0,
      allBudgetVersionDetails:[],
      showEditModal:false,
      showCreateModal:false,
      showHistoryModal:false,
      showApprovalModal:false,
      showRejectionModal:false,
      showInstructionsModal:false,
      activeBudgetCycle:{},
      active_version:{},
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
        "PRINCIPAL",
        "ADD",
        "ADE"
      ],
      grandTotalsN:{
        naira:0,
        dollar:0,
        in_naira:0,
        in_dollar:0
      },
      availableYears:[],
      allApprovals:[],
      user_approval:{},
      rejection_comment:"",
      approval_cooment:"",

  }



   componentDidMount = async () => {
     this.getBudgetVersionBySlug();
      this.getAllApprovals();
   }

  getBudgetVersionBySlug = async ()=>{
      let { viewedBudgetVersionDetail, allBudgetEntries, allAggregates, isFetching, user_approval } = this.state;
      isFetching = !isFetching;
      const activeBudgetCycle  = localStorage.getItem('ACTIVE_BUDGET_CYCLE') ? JSON.parse(localStorage.getItem('ACTIVE_BUDGET_CYCLE')) : {};
      const { active_version }  =  activeBudgetCycle;

      let { role } = jwtAuthService.getActiveDepartmentRole();
      user_approval = role.approval;

      this.setState({ isFetching, activeBudgetCycle, active_version, user_approval });



      // const slug = jwtAuthService.getactivebudgetcycle()
     this.processingService.getBudgetVersionBySlug(active_version.slug).then(
         async (budgetversionsResponse)=>{
           isFetching = !isFetching;

           const { version, aggregates } = budgetversionsResponse;
           viewedBudgetVersionDetail = version;
           allAggregates = this.buildGroupedEntries(aggregates);

           this.setState({ viewedBudgetVersionDetail, allAggregates, isFetching }); // so  is set

             console.log('BudgetVersionDetails response', budgetversionsResponse, viewedBudgetVersionDetail)
         }
     ).catch((error)=>{
       isFetching = !isFetching;
       console.log('ERRERRERE',error)
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

submitApproval = async (event, approved) =>{
  event.preventDefault();
  const { role, department } = jwtAuthService.getActiveDepartmentRole();
  const user = jwtAuthService.getUser();
  let { viewedBudgetVersionDetail, rejection_comment, approval_comment, showApprovalModal, showRejectionModal } = this.state;
  this.setState({isSaving:true })
  const comment = approved ? approval_comment : rejection_comment;
  const approvalObject = { approved, comment, role:role.id, user:+user.id, department:department.id }

  this.processingService.approveBudgetVersion(viewedBudgetVersionDetail, approvalObject).then(
  async  (approvedVersionResponse)=>{
      viewedBudgetVersionDetail = approvedVersionResponse;
      console.log("VEWV V ",viewedBudgetVersionDetail)
      const action = approved ? "Approved":"Rejected";
      const notified  = approved ? "":"";
      const successNotification ={
        msg:`Budget ${action}. A notification has been sent to`,
        type:"success"
      }
    await this.setState({isSaving:false, approvalModal:false, rejectionModal:false,viewedBudgetVersionDetail   });
    // this.getApprovalMessage();
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

handleRichEditorChange = (html, form='approve') => {
  let { rejection_comment, approval_comment} = this.state
  if(form=='approve'){
  approval_comment = html;
  }else{
    rejection_comment = html;
  }
  this.setState({ rejection_comment, approval_comment });

}

setApproval = ()=> {
  if(this.props.viewOnly){
    return null;
  }
  let { user_approval, viewedBudgetVersionDetail } = this.state;
    let { approval, post_status } = viewedBudgetVersionDetail;
  if(!user_approval.id || post_status) return null; //post_status is non-zero once approved etc

  return (approval && approval.stage==user_approval.stage) ? (
      <div className="btn-group">
        <button className="btn btn-success btn-lg" onClick={()=>this.toggleModal('approve')}>Approve <FaCheck/> </button>
      <button className="btn btn-danger btn-lg" onClick={()=>this.toggleModal('reject')}>Reject <FaTimes/></button>
    </div>
  ) : (
    <div>
      <span className="badge badge-info p-2">This budget version is currently not at the <em>{user_approval?.description} desk.</em></span>
    </div>
  );

}

toggleModal = (modalName='approve')=> {

  let { showApprovalModal, showHistoryModal, showRejectionModal } = this.state;
  if(modalName=='approve'){
    showApprovalModal = !showApprovalModal;
  }else if(modalName=='reject'){
    showRejectionModal = !showRejectionModal;
  }else if(modalName=='history'){
    showHistoryModal = !showHistoryModal;
  }

  this.setState({ showApprovalModal, showHistoryModal, showRejectionModal });
}



 toggleAccordion = async (aggregate, index)=>{
   const t_aggregate = JSON.parse(JSON.stringify(aggregate))
   let { allAggregates } = this.state;
   // allAggregates = allAggregates.map((ag)=>{
   //   ag.is_open = false;
   //   return ag;
   // })
   t_aggregate.is_open = !t_aggregate.is_open;

   allAggregates.splice(index, 1, t_aggregate);
   // allAggregates = await this.buildGroupedEntries(allAggregates);
   this.setState({ allAggregates });

 }


     buildGroupedEntries = (allDepartmentAggregates) =>{
       let { entryTypes, grandTotalsN } = this.state;
       allDepartmentAggregates.forEach((aggregate) =>{
         const { total_naira_portion, total_currency_portion, total_functional_currency, total_functional_naira } = aggregate;
         let { naira, dollar, in_naira, in_dollar } = grandTotalsN;
         dollar+=total_currency_portion;
         naira+=total_naira_portion;
         in_dollar+= total_functional_currency;
         in_naira += total_functional_naira;
         grandTotalsN = { naira, dollar, in_naira, in_dollar };

         const { budgetversion } = aggregate;
         aggregate['summary'] = {};
         const entries = aggregate['entries']
         entryTypes.forEach((entryType)=>{
           aggregate['summary'][entryType] = this.buildEntriesByType(entries, entryType)
         })
       })
       this.setState({grandTotalsN });

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


         buildVersionRows = (aggregate) =>{

           const { department, summary, total_naira_portion, total_currency_portion, total_functional_currency, total_functional_naira } = aggregate;




           const OtherRows = () => Object.keys(summary).map((key)=>{
             const key_entries = `${key}_ENTRIES`;
             const entries = summary[key][key_entries];
             const entries_length = entries.length;
             const { total_in_naira, total_in_currency, total_naira_part,  total_currency_part } = summary[key];

             return  (
               <>
               <tr key={`${key}_${aggregate.id}`}>
                 <td colSpan="9" className="text-center">
                   <b><em>{key}</em></b>
                 </td>
               </tr>

                       {
                         entries_length ? entries.map((entry,index)=>{
                           const { costitem, currency_portion, description, unit_value,quantity, naira_portion, total_currency, total_naira }  = entry;
                           const { category } = costitem;
                           return (
                           <tr key={`${index}_${aggregate.id}`}>
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
                         <h6 className="text-muted"><em><b>{key} Total:</b></em></h6>
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

            {/* <FooterRow/>*/}
          </table>


           </>



           )





             return (
               <>
                 <BodyRows/>
               </>
             )


         }






  render(){
    const { activeBudgetCycle, active_version, allAggregates, user_approval, viewedBudgetVersionDetail } = this.state;
    return(

      <>
      <Modal show={this.state.showApprovalModal} onHide={
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


      <Modal show={this.state.showRejectionModal} onHide={
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


      <div className={`card ${user_approval?.stage == viewedBudgetVersionDetail?.approval?.stage ?'success-border':''}`}>
        <div className="card-header">
          <div className="float-right">
            <button className="btn btn-primary">View History <FaList/></button>
          </div>
          <h3><b><em>{activeBudgetCycle?.year} {active_version?.version_code?.name} ({active_version?.version_code?.code})</em></b></h3>



        </div>
        <div className="card-body">

          {
              allAggregates.length ?  allAggregates.map((aggregate, index)=>{
                const { entries } = aggregate

              return (
                <>
                <Card key={aggregate?.id} className="shadow-sm mb-3">
                  <Accordion>
                    <Card.Header className="d-flex align-items-center justify-content-between">
                      <Accordion.Toggle
                        className="cursor-pointer mb-0 text-primary"
                        as="span"
                        eventKey={aggregate?.id?.toString()}
                        onClick={()=>this.toggleAccordion(aggregate,index)}
                      >
                        <a href='#' onClick={(e)=> e.preventDefault()} className="underline">{aggregate?.department?.name} ({aggregate?.department?.code})</a>&nbsp;
                        {
                          aggregate?.is_open ? <FaMinusCircle className="text-danger"/> : <FaPlusCircle/>
                        }
                      </Accordion.Toggle>

                      {
                        viewedBudgetVersionDetail?.approval ? null :(
                          <div >
                            <CustomProgressBar departmentaggregate={aggregate}  allApprovals={this.state.allApprovals}/>

                          </div>
                        )
                      }

                      <div className="d-flex">

                        <table className="table">
                          <thead>
                            <tr>

                              <th className="text-right">Total Naira part(&#x20a6;)</th>
                                <th className="text-right">Total USD part($)</th>
                              <th className="text-right">Total in Naira(&#x20a6;)</th>
                              <th className="text-right">Total in USD($)</th>

                            </tr>
                            <tr>
                              <th className="text-right">
                                <b><a className="underline" href="#">{utils.formatNumber(aggregate?.total_naira_portion)}</a></b>

                              </th>
                              <th className="text-right">
                                <b><a className="underline" href="#">{utils.formatNumber(aggregate?.total_currency_portion)}</a></b>

                              </th>

                              <th className="text-right">
                                  <b><a className="underline" href="#">{utils.formatNumber(aggregate?.total_functional_naira)}</a></b>

                              </th>
                              <th className="text-right">
                                <b><a className="underline" href="#">{utils.formatNumber(aggregate?.total_functional_currency)}</a></b>

                              </th>
                            </tr>
                          </thead>
                        </table>
                        <div>

                        </div>


                      {/*  <i className="mx-1 i-Reload"> </i>
                        <i className="mx-1 i-Close-Window"></i>

                        <i className="mx-1 i-Drag"> </i>
                        <i className="mx-1 i-Full-Screen-2"></i>
                        <i className="mx-1 i-Close-Window"></i>
                        */}
                      </div>
                    </Card.Header>
                    <Accordion.Collapse eventKey={aggregate?.id?.toString()}>
                      <Card.Body>

                        {this.buildVersionRows(aggregate)}
                      </Card.Body>
                    </Accordion.Collapse>
                  </Accordion>
                </Card>
                </>
              )

              }) : (
                <>
                <div className="text-center w-100">
                  <FetchingRecords isFetching={this.state.isFetching} emptyMsg={`No departmental budgets for ${activeBudgetCycle.year} ${active_version?.version_code?.name}  (${active_version?.version_code?.code})`} />

                </div>
                </>
              )
          }



          <div>
          <Card key='grand_total' className="shadow-lg mb-3 bg-info_custom ">
            <Accordion>
              <Card.Header className="d-flex align-items-center justify-content-between text-white">
                <Accordion.Toggle
                  className="cursor-pointer mb-0 text-white"
                  as="span"
                  eventKey='grand_total'
                >
                <b>  GRAND TOTALS:</b>
                </Accordion.Toggle>
                <div className="d-flex">


                  <table className="table text-white">
                    <thead>
                      <tr>
                      <th className="text-right">Total Naira part(&#x20a6;)</th>
                        <th className="text-right">Total USD part($)</th>

                        <th className="text-right">Total in Naira(&#x20a6;)</th>
                        <th className="text-right">Total in USD($)</th>

                      </tr>
                      <tr>
                        <th className="text-right">
                          <b>{utils.formatNumber(this.state?.grandTotalsN?.naira)}</b>

                        </th>
                        <th className="text-right">
                          <b>{utils.formatNumber(this.state?.grandTotalsN?.dollar)}</b>

                        </th>
                        <th className="text-right">
                          <b>{utils.formatNumber(this.state?.grandTotalsN?.in_naira)}</b>

                        </th>
                        <th className="text-right">
                        <b>{utils.formatNumber(this.state?.grandTotalsN?.in_dollar)}</b>

                        </th>
                      </tr>
                    </thead>
                  </table>
                </div>
              </Card.Header>
              <Accordion.Collapse eventKey='grand_total' className="text-white">
                <Card.Body>
                  This represents the grand total of departmental budgets captured for <b><em>{activeBudgetCycle?.year} {active_version?.version_code?.name} ({active_version?.version_code?.code}).</em></b>
                </Card.Body>
              </Accordion.Collapse>
            </Accordion>
          </Card>
          </div>


        </div>
        <div className="card-footer bg-warningx">

          <div className="float-right">{this.setApproval()}</div>
          <div className="row">

            <div className="col-md-10">
              <CustomProgressBar departmentaggregate={{}} budgetVersion={this.state.viewedBudgetVersionDetail} allApprovals={this.state.allApprovals}/>
            </div>

          </div>

        </div>

      </div>


      </>

    )
  }
}

export default ConsolidatedApproval;
