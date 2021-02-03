import React, { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";


export const AppCustomPagination = (props) => {

  const [pageCount, setPageCount] = useState(0);
  const { rowsDisplayed, totalNumRows } = props;

  useEffect(()=>{
    const numPages = Math.ceil(totalNumRows/rowsDisplayed);
    setPageCount(numPages);
  },[rowsDisplayed,totalNumRows])

const  handlePageChange = data => {
    let pageNumber = data.selected;
    props.onPaginate(pageNumber);
    console.log(pageNumber);
  };




  return (

    <div className="d-flex justify-content-end">
      <ReactPaginate
        previousLabel={"Previous"}
        nextLabel={"Next"}
        breakLabel={"..."}
        breakClassName={"break-me"}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageChange}
        containerClassName={"pagination"}
        subContainerClassName={"pages pagination"}
        activeClassName={"active"}
      />
    </div>

  )


}
