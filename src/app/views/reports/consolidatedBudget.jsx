import React, { Component } from "react";
import ConsolidatedApproval from "../review/consolidatedApproval";

class ConsolidatedBudget extends Component {


  constructor(props) {
    super(props);

  }



  render(){

    return (<ConsolidatedApproval viewOnly={true}  {...this.props}/>)
  }



}

export default ConsolidatedBudget;
