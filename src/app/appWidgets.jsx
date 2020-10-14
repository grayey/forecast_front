import React, {useState} from "react";
import AppMainService from "./services/appMainService";
import { APP_ENVIRONMENT } from './environment/environment';
import AppNotification from "./appNotifications";
import { Dropdown, Modal } from "react-bootstrap";
import { FaUpload, FaFileCsv, FaFileExcel } from "react-icons/fa";




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
const [downloadUrl, setDownloadUrl] = useState('');
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


  return (
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
      <button className="btn btn-success">Upload Bulk Template <FaUpload/></button>
    </div>
  )
}
