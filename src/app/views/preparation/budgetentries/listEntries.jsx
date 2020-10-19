
import React, { Component } from "react";
import { BudgetEntriesComponent } from "./createEntries";


class ListEntriesComponent extends Component {

  querySlug;

  constructor(props) {
    super(props);
    this.querySlug = this.props.match.params.slug;
  }



  render(){

    return (

      <BudgetEntriesComponent updateEntries={true} querySlug={this.querySlug}/>

      )
  }



}

export default ListEntriesComponent;
