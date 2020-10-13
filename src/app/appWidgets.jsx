import React from "react";

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