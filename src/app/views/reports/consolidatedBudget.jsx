import React, { Component } from "react";
import ConsolidatedApproval from "../review/consolidatedApproval";
import jwtAuthService  from "../../services/jwtAuthService";
import * as utils from "@utils";
import { VIEW_FORBIDDEN } from "../../appConstants";
import {  ErrorView } from "../../appWidgets";



class ConsolidatedBudget extends Component {

  CAN_VIEW_ALL = '';


  constructor(props) {
    super(props);

    const componentName = "Reports___Consolidated_View";
    const componentPermissions = utils.getComponentPermissions(componentName, props.route.auth);
    this.userPermissions = utils.comparePermissions(jwtAuthService.getUserTasks(), componentPermissions);
    this.CAN_VIEW_ALL = this.userPermissions.includes(`${componentName}__CAN_VIEW_ALL`);
  }



  render(){

    const { CAN_VIEW_ALL } = this;

    return !CAN_VIEW_ALL ? <ErrorView errorType={VIEW_FORBIDDEN}/>  : (
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
