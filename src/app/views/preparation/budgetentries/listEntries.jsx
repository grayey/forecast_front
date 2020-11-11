
import React, { Component } from "react";
import { BudgetEntriesComponent } from "./createEntries";
import { connect } from "react-redux";
import { Link, Redirect, withRouter } from "react-router-dom";
import { getactivebudgetcycle } from "app/redux/actions/BudgetCycleActions";


class ListEntriesComponent extends Component {

  querySlug;

  constructor(props) {
    super(props);
    this.querySlug = this.props.match.params.slug;

  }



  render(){

    return (
      <BudgetEntriesComponent updateentries={true} queryslug={this.querySlug}  {...this.props}/>


      )
  }



}

const mapStateToProps = state => ({
    active_budget_cycle:state.budgetCycle,
});

const mapDispatchToProps = {
  getactivebudgetcycle,
};


export default withRouter(
  connect(mapStateToProps,mapDispatchToProps)(ListEntriesComponent)
);
