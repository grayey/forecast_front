import React, {useState} from "react";
import AppMainService from "./services/appMainService";
import { APP_ENVIRONMENT } from './environment/environment';
import AppNotification from "./appNotifications";
import { Dropdown, Modal } from "react-bootstrap";
import { FaUpload, FaFileCsv, FaFileExcel, FaQuestion } from "react-icons/fa";
import * as utils from "@utils";
import { saveAs } from 'file-saver';

import LaddaButton, {
    XL,
    EXPAND_LEFT,
    EXPAND_RIGHT,
    EXPAND_UP,
    CONTRACT,
  } from "react-ladda";




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
            <Dropdown.Toggle variant="warning" className="text-white">
              Download Bulk Template
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={()=>downloadTemplate('Excel')}><FaFileExcel/> Excel</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={()=>downloadTemplate('Csv')}><FaFileCsv/> CSV</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        <button className="btn btn-success" onClick={toggleModal}>Upload Bulk Template <FaUpload/></button>
      </div>
      </>
    )
}
