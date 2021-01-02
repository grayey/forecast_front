import React, { useState, useEffect } from "react";
import AppMainService from "./services/appMainService";
import ProcessingService from './services/processing.service';
import ReportsService from './services/reports.service';
import jwtAuthService from './services/jwtAuthService';

import { APP_ENVIRONMENT } from './environment/environment';
import AppNotification from "./appNotifications";
import { Dropdown, Modal, ProgressBar,  } from "react-bootstrap";
import DropdownMenu from "react-bootstrap/DropdownMenu";
import { FaUpload, FaFileCsv, FaFileExcel, FaQuestion, FaList, FaCog, FaDownload, FaFilter } from "react-icons/fa";
import Slider from "rc-slider";
import Tooltip from "rc-tooltip";
import * as utils from "@utils";
import { saveAs } from 'file-saver';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

import ErrorComponent from "./views/sessions/Error";
import { VIEW_FORBIDDEN } from './appConstants';


import LaddaButton, {
    XL,
    EXPAND_LEFT,
    EXPAND_RIGHT,
    EXPAND_UP,
    CONTRACT,
  } from "react-ladda";


export const TaskIcons = {
    'Dashboard':'i-Bar-Chart',
    'Preparation':'i-Computer-Secure',
    'Processing':'i-Computer-Secure',
    'Review':'i-Computer-Secure',
    'Reports':'i-Bar-Chart',
    'Adiministration':'i-Bar-Chart', //change the spelling later
  }


export  const ErrorView = (props) =>{

    const { errorType } = props;
    const errorObject = {
      VIEW_FORBIDDEN:VIEW_FORBIDDEN
    }

    return <ErrorComponent errorType={errorObject[errorType]}/>
  }


export const FetchingRecords = (props)=>{

    return props.isFetching ? (
        <>
          <div className="loader-bubble loader-bubble-info m-5"></div>
          <div className="loader-bubble loader-bubble-light m-5"></div>
          <div className="loader-bubble loader-bubble-dark m-5"></div>
        </>
    ):
    (
    <>
        <div>
            {props.emptyMsg || 'No records found' }
        </div>
      </>
    )
}

export const CustomProgressBar = (props)=>{

  const { departmentaggregate, allApprovals, budgetVersion, } = props;
  let { approval_stage, is_archived } = departmentaggregate;
  let entries_status = departmentaggregate.entries_status || "0";
  let sub_text = "Submission";
  const isDraftOrSubmitted = entries_status < 2;
  const status_prefixes = {
    "0":"Awaiting",
    "1":"Awaiting",
    "2":"Completed",
  }

  if(budgetVersion){
     approval_stage = budgetVersion.approval;
     entries_status = budgetVersion.post_status + 1; //post status is just 1 once version is approved so increment so that entries_status >=2
     sub_text = `Initial Approvals`;
  }

  // const prefix_key = entries_status ? entries_status.toString() : "3"
  let prefix =  status_prefixes[entries_status.toString()];




    // const { allApprovals } = this.state;
    let padding = 0; // so that the progress bar displays

    let shift = isDraftOrSubmitted ? 1 : 0;
    let progressObject = {
      percentage:0,
      variant:null,
      text:sub_text
    };
    // text-${progressObject.percentage < 100 ? 'info':'success'}

    if(approval_stage){
      let percentage = Math.round(approval_stage.stage/(allApprovals.length) * 100 );
        percentage = prefix == "awaiting" ? percentage - 2 : percentage;
      let variant = percentage < 100  ? "info_custom" : "success";

      // disabled color if discarded
      variant = is_archived ? "secondary_custom" : variant;

      const text = approval_stage.description;
      progressObject = { percentage,variant,text }
      // don't fill the progress bar if still isDraftOrSubmitted
      padding = prefix == "awaiting"  ? -2 : percentage;
    }
    const barAttributes = {
      now:progressObject.percentage + padding,
      label: `${progressObject.percentage}%`,
      variant:progressObject.variant
    }
    if(!is_archived){
      barAttributes.striped = true;
      barAttributes.animated = true;
    }
    return (
      <div>
      <ProgressBar
      {...barAttributes}
      ></ProgressBar>
      <p className={`text-center`}>
        <small><b><em>{prefix} {progressObject.text}</em></b></small>
      </p>
    </div>
    )

}


export const SystemNotifications = (props) => {
    const appMainService = new AppMainService();
    const [allNotifications, setNotifications] = useState([])
    const [fetching_notes, setFetchingNotes] = useState(false)
    const { department, role } = jwtAuthService.getActiveDepartmentRole();
    const user = jwtAuthService.getUser();

    const note_object = {
      INITIATED:{
        color:"info",
        icon:"i-Shop-4"
      },
      CREATED:{
        color:"info_custom",
        icon:"i-Library"
      },
      SUBMITTED:{
        color:"success_custom",
        icon:"i-Drop"
      },
      UPDATED:{
        color:"secondary_custom",
        icon:"i-File-Clipboard-File--Text"
      },
      APPROVED:{
        color:"success",
        icon:"i-Checked-User"
      },
      REJECTED:{
        color:"danger",
        icon:"i-Delete"
      },
      POSTED:{
        color:"pink_custom",
        icon:"i-Ambulance"
      },
      ARCHIVED:{
        color:"secondary_custom",
        icon:"i-Checked"
      },
      DEFAULT:{
        color:"warning",
        icon:"i-default"
      }

    }

    const getAllNotifications = async() => {
      setFetchingNotes(true);
          appMainService.getAllNotifications({user, department, role}).then(
              (notificationsResponse)=>{
                setFetchingNotes(false);
                  setNotifications(notificationsResponse);
                  console.log('Notifications response', notificationsResponse)
              }
          ).catch((error)=>{
              const errorNotification = {
                  type:'info',
                  msg:'Could not retrieve system notifications'
              };
              new AppNotification(errorNotification);
              setFetchingNotes(false);

          })
        }

    useEffect(() => {
      getAllNotifications()
    }, [])

    return (
      <Dropdown>
        <Dropdown.Toggle as="span" className="toggle-hidden cursor-pointer">
          <div
            className="badge-top-container"
            role="button"
            id="dropdownNotification"
            data-toggle="dropdown"
          >
            <span className="badge badge-primary">{allNotifications.length}</span>
            <i className="i-Bell text-muted header-icon"></i>
          </div>
        </Dropdown.Toggle>

        <DropdownMenu className="notification-dropdown rtl-ps-none">
          { allNotifications.length ? allNotifications.map((note, index) => {
            const { n_type, description, created_at, redirect_url } = note;
            const noted = note_object[n_type];

            return (

              <div key={index} className="dropdown-item d-flex">
                <div className="notification-icon">
                  <i className={`${noted?.icon} text-${noted?.color} mr-1`}></i>
                </div>
                <div className="notification-details flex-grow-1">
                  <p className="m-0 d-flex align-items-center">
                    <span>{utils.toTiltle(n_type)}</span>
                    <span
                      className={`badge badge-pill badge-${noted?.color} ml-1 mr-1`}
                    >
                      {note.status}
                    </span>
                    <span className="flex-grow-1"></span>
                    <span className="text-small text-muted ml-auto">
                      {utils.getTimeDifference(new Date(created_at))} ago
                    </span>
                  </p>
                  <p className="text-small text-muted m-0">
                    {description}
                  </p>
                </div>
              </div>
            )

          }) :
          (
            <div  className=" ml-1">
              <FetchingRecords className='text-center' isFetching={fetching_notes} emptyMsg="No new notifcations" />
            </div>
          )
        }
        </DropdownMenu>
      </Dropdown>
    )


}


export const ReportsFilter = (props) =>{
  const appMainService = new AppMainService();
  const processingService = new ProcessingService();
  const reportsService = new ReportsService();
  const animatedComponents = makeAnimated();

  const [allDepartments, setDepartments] = useState([]);
  const [allBudgetCycles, setBudgetCycles] = useState([]);
  const [selectedBudgetCycle, setSelectedBudgetCycle] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  const [reportsForm, setReportsForm] = useState({
    'department_id':''
  })

  const getAllBudgetCycles = async() => {

    processingService.getAllBudgetCycles().then(
        async (budgetcyclesResponse)=>{
          const budgetCycles =   budgetcyclesResponse.map((b)=>{
                  const value = b.id;
                  const label = `${b.year}`;
                  const id = value;

                  return { id, value, label };
              });
              setBudgetCycles(budgetCycles);
        }
    ).catch((error)=>{
        const errorNotification = {
            type:'error',
            msg:utils.processErrors(error)
        }
        new AppNotification(errorNotification)
    })
  }

  const getAllDepartments = async()=>{
    appMainService.getAllDepartments().then(
        (departmentsResponse)=>{
            setDepartments(departmentsResponse);
            console.log('Departments response', departmentsResponse)
        }
    ).catch((error)=>{
        const errorNotification = {
            type:'error',
            msg:utils.processErrors(error)
        }
        new AppNotification(errorNotification)
    })
  }

  const handleMultiSelectChange =  async (event, fieldName) => {
    if(fieldName=='budget_cycle'){
      await setSelectedBudgetCycle(event);
    }
  }

  const handleReportFilterChange = (event)=>{
    const {name, value} = event.target;
    setReportsForm({ [name]:value });
  }

  const getReportByDepartment = (event)=> {
    let fetching = true;
    props.setFetching(fetching);
    setIsFetching(fetching);

    const budget_years= [];
    const budgetcycle_ids = selectedBudgetCycle.map((c) => {
      budget_years.push(c.label);
      return c.id;
    });
   const filter_action = event.target.id
    const filterObject = {...reportsForm, filter_action, budgetcycle_ids};
    reportsService.getReportByDepartment(filterObject).then(
        (reportsResponse)=>{
          fetching = false;
          props.setFetching(fetching);
          setIsFetching(fetching)


          if(!filter_action.includes('export')){
            const responseData = groupByYears(budget_years, reportsResponse);
            props.refresh(responseData);
          }else{

            //download file
            console.log('Downloading fileee')
          }


        }
    ).catch((error)=>{
        const errorNotification = {
            type:'error',
            msg:utils.processErrors(error)
        }
        console.log('errooror', error)
        new AppNotification(errorNotification);
        fetching = false;
        props.setFetching(fetching);
        setIsFetching(fetching)
    })
  }

  const groupByYears = (budget_years, responseData) =>{
    const groupObject  = {};
    budget_years.forEach((b_y) =>{
      groupObject[b_y] = responseData.filter(rc => rc.budgetcycle.year == b_y);
    });
    return groupObject;

  }

  useEffect(()=>{
    getAllBudgetCycles();
    getAllDepartments();
  }, [])


  return (

    <>


      <div className='row filter'>

        <div className='col-1'>
          <div className='mt-2'>
            <b>
              <u>
                <em>Filter <small><FaFilter/></small></em>
              </u>
            </b>

          </div>
        </div>
        <div className='col-4'>
          <div className='input-group mt-1'>
            <div className="input-group-prepend">
              <span className="input-group-text bg-info_custom text-white">
                <b>
                  Department:
                </b>
              </span>
            </div>
            <select className='form-control' name="department_id" value={reportsForm.department_id} onChange={handleReportFilterChange}>
              <option>Select</option>
            {
              allDepartments.map((department, index)=>{
                return(
                  <option value={department.id} key={department.code}>{department?.name} ({department?.code})</option>
                )
              })
            }
            </select>
          </div>

        </div>
        <div className='col-1'>
          <div className='mt-2'>
              <span className='float-right'><b>Year<em>(s)</em>:</b></span>
          </div>
        </div>
        <div className='col-5'>

            <div className='input-groupx '>

              {/* <div className="input-group-prepend">
                <span className="input-group-text bg-info_custom text-white">
                  <b>
                  Budgtet year<em>(s)</em>:
                  </b>
                </span>
              </div> */}

              <Select
                   value={selectedBudgetCycle}
                   components={animatedComponents}
                   onChange={(event)=>handleMultiSelectChange(event,'budget_cycle')}
                   options={allBudgetCycles}
                   isMulti
                   placeholder="Search budget years (cycles)"
                   noOptionsMessage={ () => "No budget years (cycles)" }

               />
          </div>
        </div>

        <div className='col-1'>
          <div className='mt-1'>
          <Dropdown    className=''>
              <Dropdown.Toggle variant="secondary_custom" className="text-white">
                 <FaCog className={isFetching ? 'spin':''}/>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item id='get_view' onClick={getReportByDepartment}><FaList/> View</Dropdown.Item>
                <Dropdown.Divider />
              <Dropdown.Header className='border-bottom'><h5><em>Export <FaDownload/></em></h5></Dropdown.Header>
            <Dropdown.Item id='export_excel' onClick={getReportByDepartment}><FaFileExcel/> Excel</Dropdown.Item>
          <Dropdown.Item id='export_csv' onClick={getReportByDepartment}><FaFileCsv/> CSV</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

          </div>
        </div>

      </div>
    </>

  )

}

export const BulkTemplateDownload = (props) =>{

  const appMainService = new AppMainService();
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showBulkModal, setBulkModal] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState('');
  const [selectedFile, setFile] = useState({})
  const [fileIcon, setFileIcon] = useState(null)
  const [createMsg, setCreateMsg] = useState('Upload')
  const bulkTemplateComponents = {
    itemcategories:"itemcategories",
    users:"users",
    costitems:"costitems"
  }


    const downloadTemplate = async(downloadType)=> {
      const component_url = bulkTemplateComponents[props.caller];
      const template_url = `${APP_ENVIRONMENT.base_url}/${component_url}/download_template`;
      await setDownloadUrl(template_url);
      document.getElementById('download_link').click();
      new AppNotification(
        {
          type:"success",
          msg:`${downloadType} bulk template downloaded.`
        }
      )

    }

    const selectFile =  (event) => {
      const file = event.target.files[0];
      const icon = file ? (file.name.endsWith('.xlsx') ? <FaFileExcel className="text-success"/> : <FaFileCsv className="text-success"/>) : null;
      setFile(file);
      setFileIcon(icon)
    }



    /**
     *
     * @param {*} modalName
     * This method toggles a modal
     */
    const toggleModal = (event,modalName='upload_bulk')=> {
        if(modalName == 'upload_bulk'){
             return setBulkModal(!showBulkModal);
        }
    }

    const uploadBulkFile = (event)=> {
      event.preventDefault();
      if(!selectedFile){
        return   new AppNotification({type:"error", msg:"Please select a file!"})
      }
      setUploading(true);

      appMainService.uploadBulkFile(props.caller, selectedFile).then(
        (uploadResponse)=>{
          const feedbackFile = new Blob([uploadResponse], { type: "application/octet-stream" })
          saveAs(feedbackFile, "categories_upload_feedback.xlsx");
          setUploading(false);
          // "Please check status of your upload in the downloaded feedback file";
          const successNotification = {
            type:"info",
            msg:`Your bulk-upload feedback record has been downloaded.`
          }
          new AppNotification(successNotification);
          setFile({})
          setFileIcon(null)
          toggleModal();
          props.refresh()
        }).catch((error)=>{
          setUploading(false);
          console.log("errorrr", error)
          const errorNotification = {
            type:"error",
            msg:utils.processErrors(error)
          }
          new AppNotification(errorNotification)

        })

    }


    return (
      <>

              <Modal show={showBulkModal} onHide={
                  ()=>{toggleModal('upload_bulk')}
                  } {...props} id='upload_bulk_modal'>

                  <form encType="multipart/form-data" onSubmit={uploadBulkFile}>
                  <Modal.Header closeButton>
                  <Modal.Title>
                    <img src="/assets/images/logo.png" alt="Logo" className="modal-logo"  />&nbsp;&nbsp;

                    Bulk Upload
                  </Modal.Title>
                  </Modal.Header>


                           <Modal.Body>
                              <div className="form-row">
                              <div
                                  className="col-md-12"
                              >
                              <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                  <span
                                    className="input-group-text"
                                    id="inputGroupFileAddon01"
                                  >
                                    { fileIcon ||  <FaQuestion className="text-danger"/>}
                                  </span>
                                </div>
                                <div className="custom-file">
                                  <input
                                    type="file"
                                    className="custom-file-input"
                                    id="inputGroupFile01"
                                    aria-describedby="inputGroupFileAddon01"
                                    onChange={selectFile}
                                    accept='.xlsx,.csv'
                                    name="bulk_file"


                                  />
                                  <label
                                    className="custom-file-label"
                                    htmlFor="inputGroupFile01"
                                  >
                                    {selectedFile?.name || 'Select bulk file'}
                                  </label>
                                </div>
                              </div>


                                  <div className="valid-feedback"></div>

                              </div>

                              </div>
                          </Modal.Body>

                          <Modal.Footer>

                                  <LaddaButton
                                      className="btn btn-secondary_custom border-0 mr-2 mb-2 position-relative"
                                      loading={false}
                                      progress={0.5}
                                      type='button'
                                      onClick={()=>toggleModal('upload_bulk')}

                                      >
                                      Close
                                  </LaddaButton>

                                  <LaddaButton
                                      className={`btn btn-${selectedFile.name ? 'success':'info_custom'} border-0 mr-2 mb-2 position-relative`}
                                      loading={uploading}
                                      progress={0.5}
                                      disabled={!selectedFile.name}
                                      type='submit'

                                      data-style={EXPAND_RIGHT}
                                      >
                                      {createMsg}
                                  </LaddaButton>
                                  </Modal.Footer>
                                  </form>
              </Modal>


      <div className="btn-group ml-5">
        <a className='d-none' id="download_link" href={downloadUrl} download></a>
          <Dropdown>
            <Dropdown.Toggle variant="info_custom" className="text-white">
              Download bulk template
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={()=>downloadTemplate('Excel')}><FaFileExcel/> Excel</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={()=>downloadTemplate('Csv')}><FaFileCsv/> CSV</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        <button className="btn btn-success" onClick={toggleModal}>Upload bulk records <FaUpload/></button>
      </div>
      </>
    )
}

// SLIDER AREA
//
 export const CustomSlider = (props) => {

    const [value, setValue] = useState(10);

   const { budget_versions, allVersionCodes } = props;
   const marks = {};
   const bv_steps = [];

   const version_steps = allVersionCodes.map((vc) => {
     let { step, code } = vc;
     step = step*10;
     marks[step] = code
     return step;
   });
   const max_version_step = Math.max(...version_steps);



   const handleChange = value => {
     setValue(value);
   };

   const handle = props => {
     const { value, dragging, index, ...restProps } = props;
     return (
       <Tooltip
         prefixCls="rc-slider-tooltip"
         overlay={value}
         visible={dragging}
         placement="top"
         key={index}
       >
         <Slider.Handle value={value} {...restProps} />
       </Tooltip>
     );
   };



   useEffect(() =>{
     budget_versions.forEach((bv, index)=>{
       const { version_code } = bv;
       let { step } = version_code;
       step = step*10;
       bv_steps.push(step);
     })
     const max_bv_steps = Math.max(...bv_steps);
     setValue(max_bv_steps);
   },[value])

   const marks_ = {
     "-10": "-10°C",
     0: <strong>0°C</strong>,
     26: {
       style: {
         color: "green"
       },
       label: <strong>26°C</strong>
     },
     37: "37°C",
     50: "50°C",
     100: {
       style: {
         color: "red"
       },
       label: <strong>100°C</strong>
     }
   };

   return (
     <div className="px-3 pb-3">
       <Slider
         step={5}
         min={10}
         dots={true}
         included={true}
         marks={marks}
         value={value}
         handle={handle}
         onChange={handleChange}
       />
     </div>
   );

 }
