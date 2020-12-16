import React, { Component } from "react";
import ConsolidatedApproval from "../review/consolidatedApproval";

class ConsolidatedBudget extends Component {


  constructor(props) {
    super(props);

  }



  render(){

    return (
      <>
        <div className="breadcrumb">
            <h1>Consolidated</h1>
            <ul>
                <li><a href="#">Report</a></li>
              <li>View</li>
            </ul>
        </div>

        <div className="separator-breadcrumb border-top"></div>
          <div className="row mb-4">

            <div className="col-md-12 mb-4">
                <ConsolidatedApproval viewOnly={true}  {...this.props}/>
            </div>
          </div>
        </>
      )
  }



}

export default ConsolidatedBudget;
