import React, { Component } from "react";
import { Breadcrumb } from "@gull";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import { SimpleCard } from "@gull";
import axios from "axios";

class SearchableDataTable extends Component {
  state = {
    userList: []
  };

  defaultSorted = [
    {
      dataField: "name",
      order: "asc"
    }
  ];

  componentDidMount() {
    axios.get("/api/user/all").then(({ data }) => {
      let userList = data.map(
        ({ id, name, email, age, company, balance }, ind) => ({
          id,
          name,
          email,
          age,
          balance,
          company,
          index: ind + 1
        })
      );
      this.setState({ userList });
    });
  }

  columns = this.props.columns;

  sortableColumn = this.props.sortableColumn;

  paginationOptions = this.props.paginationOptions;

  render() {
    let { userList } = this.state;
    let { SearchBar } = Search;

    return (
      <div>
         <button className="float-right">xxxxxxxxxxxxx</button>
        <Breadcrumb
          routeSegments={this.props.routeSegments}
        />
        <SimpleCard title={this.props.tableTitle}>
          <ToolkitProvider
            striped
            keyField="id"
            data={this.props.dataList}
            columns={this.props.sortableColumn}
            search
          >
            {props => (
              <>
                <div className="d-flex justify-content-end align-items-center">
                  <span className="mb-2 mr-1">Search:</span>
                  <SearchBar {...props.searchProps} className="mb-0" />
                </div>
                <BootstrapTable
                  {...props.baseProps}
                  bootstrap4
                  pagination={paginationFactory(this.props.paginationOptions)}
                  noDataIndication={this.props.noDataIndication}
                />
              </>
            )}
          </ToolkitProvider>
        </SimpleCard>
      </div>
    );
  }
}

export default SearchableDataTable;
