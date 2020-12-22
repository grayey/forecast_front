import React, { Component } from "react";
import { Row, Col, Tab, Tabs, Button, TabContent, Nav,  Dropdown, Accordion, Card, Form, ButtonToolbar, Modal,} from "react-bootstrap";
import { FaList, FaCheck, FaTimes, FaPlusCircle, FaMinusCircle  } from "react-icons/fa";
import { FetchingRecords, ReportsFilter } from "../../appWidgets";
import * as utils from "@utils";

import { MultipleBarChart } from "../../appCharts";








class DepartmentalOverview extends Component {


  state = {
    reportData:{},
    isFetching:false,
    entryTypes:[

    ],
    graphColors:[],
  }


  constructor(props) {
    super(props);

  }

  componentDidMount() {
    const entryTypes = JSON.parse( localStorage.getItem('ENTITIES'));
    this.setState({ entryTypes })
  }


  renderReportData = (reportData) => {
    console.log(reportData);
    const graphColors = utils.getGraphColors();
    this.setState({ reportData, graphColors })

  }

  displayEntityCategoryGraph = (aggregate) =>{
    const { graphColors } = this.state;



    // console.log('graphColors',graphColors)
    //
    return (
      <MultipleBarChart caller='entity_category' colors={graphColors} chartData={aggregate}/>

    )
  }

  buildGroupedEntries = (aggregates) =>{

    const { entryTypes } = this.state;
    aggregates.forEach((aggregate) =>{
    aggregate['summary'] = {};
      const entries = aggregate['entries'];
      entryTypes.forEach((entryType)=>{
        aggregate['summary'][entryType] = this.buildEntriesByType(entries, entryType)
      })
    })
    console.log('BUILD AVGREGATe',aggregates);

    return aggregates;
  }


  buildEntriesByType = (entries, entryType)=>{
    const entry_type_entries = `${entryType}_ENTRIES`;
    const summaryItem = {
      total_naira_part:0,
      total_currency_part:0,
      total_in_naira:0,
      total_in_currency:0,
       [entry_type_entries]:[]
    };
    entries.forEach((entry)=>{
      if(entry.entity == entryType){
        summaryItem.total_naira_part += entry.naira_portion
        summaryItem.total_currency_part += entry.currency_portion
        summaryItem.total_in_naira+= entry.total_naira
        summaryItem.total_in_currency += entry.total_currency
        summaryItem[entry_type_entries].push(entry);

      }
    })
    return summaryItem;
  }


  buildVersionRows = (aggregate) =>{

    const { department, summary, total_naira_portion, total_currency_portion, total_functional_currency, total_functional_naira } = aggregate;




    const OtherRows = () => Object.keys(summary).map((key)=>{

      const key_entries = `${key}_ENTRIES`;
      const entries = summary[key][key_entries];
      const entries_length = entries.length;
      const { total_in_naira, total_in_currency, total_naira_part,  total_currency_part } = summary[key];

      return  (
        <>
        <tr key={`${key}_${aggregate.id}`}>
          <td colSpan="9" className="text-center">
            <b><em>{key}</em></b>
          </td>
        </tr>

                {
                  entries_length ? entries.map((entry,index)=>{
                    const { costitem, currency_portion, description, unit_value,quantity, naira_portion, total_currency, total_naira }  = entry;
                    const { category } = costitem;
                    return (
                    <tr key={`${index}_${aggregate.id}`}>
                    <td>{category?.name} ({category?.code})</td>
                    <td>{costitem?.name} ({costitem?.code})</td>
                    <td>{description}</td>
                    <td>{utils.formatNumber(unit_value, false)}</td>
                    <td>{utils.formatNumber(quantity, false)}</td>
                    <td className="text-right">{utils.formatNumber(naira_portion)}</td>
                    <td className="text-right">{utils.formatNumber(currency_portion)}</td>
                    <td className="text-right">{utils.formatNumber(total_naira)}</td>
                    <td className="text-right">{utils.formatNumber(total_currency)}</td>
                  </tr>

                )
              }) : (
                <tr>
                <td colSpan="9" className='text-center'>
                  <FetchingRecords emptyMsg="No entries"/>
                </td>

              </tr>)}


              <tr className="sub_row line_entries">
                <th className="text-muted">
                  <h6 className="text-muted"><em><b>{key} Total:</b></em></h6>
                </th>
                <th colSpan="4">
                  <div className="dash-mid w-100"></div>
              </th>
                <th className="text-right text-muted">{utils.formatNumber(total_naira_part)}
                  <div className="dash-mid-2 w-100"></div>

                </th>
                <th className="text-right text-muted">{utils.formatNumber(total_currency_part)}
                  <div className="dash-mid-2 w-100"></div>

                </th>
                <th className="text-right text-muted">{utils.formatNumber(total_in_naira)}
                  <div className="dash-mid-2 w-100"></div>

                </th>
                <th className="text-right text-muted">{utils.formatNumber(total_in_currency)}
                  <div className="dash-mid-2 w-100"></div>

                </th>

              </tr>


            </>


    )


      })

      const FooterRow = () => (



        <tr className="line_entries_footer line_entries entries_footer">
          <th>
              <h5 className="mt-2"><em>{department?.name}{department?.name?.endsWith('s')?"'":"'s'"} Total:</em></h5>
          </th>

          <th colSpan="9">
            <table className="table">
              <thead>
                <tr>
                  <th colSpan="5"></th>


                  <th className="text-right">
                    {utils.formatNumber(total_naira_portion)}
                    <div className="dash-2"></div>

                  </th>
                  <th className="text-right">
                    {utils.formatNumber(total_currency_portion)}
                    <div className="dash-2 "></div>

                  </th>
                  <th className="text-right">
                    {utils.formatNumber(total_functional_naira)}
                    <div className="dash-2"></div>


                  </th>
                  <th className="text-right">
                    {utils.formatNumber(total_functional_currency)}
                    <div className="dash-2"></div>

                  </th>
                </tr>

              </thead>
            </table>
          </th>


        </tr>

      )

    const BodyRows = () => (
    <>

   <div className='table-responsive'>
     <table className="table table-striped table-hover">
        <thead>
              <tr>
              <th>Category</th>
              <th>
                Cost item
              </th>
              <th>
                Description
              </th>
              <th>
                Unit value
              </th>
              <th>
                Quantity
              </th>
              <th className="text-right">
                Naira part (₦)
              </th>
              <th className="text-right">
                USD part ($)
              </th>
              <th className="text-right">
                Total in Naira (₦)
              </th>
              <th className="text-right">
                Total in USD ($)
              </th>
            </tr>
        </thead>
        <tbody>
          <OtherRows/>
        </tbody>

       {/* <FooterRow/>*/}
     </table>

   </div>

    </>



    )


      return (
        <>
          <BodyRows/>
        </>
      )


  }

  toggleAccordion = async (aggregate, index)=>{
    // const t_aggregate = JSON.parse(JSON.stringify(aggregate))
    // let { allAggregates } = this.state;
    // // allAggregates = allAggregates.map((ag)=>{
    // //   ag.is_open = false;
    // //   return ag;
    // // })
    // t_aggregate.is_open = !t_aggregate.is_open;
    //
    // allAggregates.splice(index, 1, t_aggregate);
    // // allAggregates = await this.buildGroupedEntries(allAggregates);
    // this.setState({ allAggregates });
    //
    console.log('toggling')

  }




  render(){

    const { reportData, isFetching, graphColors } = this.state;
    const yearsData = Object.keys(reportData);

    return (
      <>


        <div className='row pb-2'>
          <div className='col-3'>
            <div className="breadcrumb">
                <h1>Departmental</h1>
                <ul>
                    <li><a href="#">Report</a></li>
                  <li>Overview</li>
                </ul>
            </div>
          </div>

          <div className='col-9'>
              <ReportsFilter  caller="departmentalOverview" setFetching = {(isFetching)=> this.setState({isFetching})} refresh={(reportData)=>this.renderReportData(reportData)}/>
          </div>

        </div>







        <div className="separator-breadcrumb border-top"></div>
          <div className="row mb-4">

            <div className="col-md-12 mb-4">
              <div className="cardx text-left">
                  <div className="card-body">


                      <Tab.Container id="left-tabs-example" defaultActiveKey="list_view">
                        <Nav variant="pills" className="d-flex  px-2">
                          <Nav.Item className="mr-2 flex-grow-1 text-center shadow">
                            <Nav.Link eventKey="list_view">
                              <b className='text-whitex'>List <em>(Table)</em> View <FaList/></b>
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item className="mr-2 flex-grow-1 text-center shadow">
                            <Nav.Link eventKey="graph_view">

                              <b className='text-whitex'>Graph <em>(Charts)</em> View </b>


                             </Nav.Link>
                          </Nav.Item>

                        </Nav>
                        <Tab.Content>
                          <Tab.Pane eventKey="list_view">

                            <div className='horizontal-scrollable'>

                              <div className="rowx d-flex">

                                {
                                yearsData.length && !isFetching ?  yearsData.map((year, index)=>{

                                  const versionAggregates = this.buildGroupedEntries(reportData[year]);

                                    return (
                                        <div className='colx-6 pr-5'>


                                          <div className='rowx'>
                                            <div className='col-12x'>
                                              <h3 className='card-headerx text-center'>{year}</h3>
                                            </div>
                                            <div className='col-12x'>
                                            {
                                            versionAggregates.length ?  versionAggregates.map((aggregate, ag_index)=>{
                                              const eventKey = `${index}_${ag_index}_${year}`

                                                return (

                                                  <Card key={aggregate?.id} className="shadow-sm mb-3">
                                                    <Accordion>
                                                      <Card.Header className="d-flex align-items-center justify-content-between">
                                                        <Accordion.Toggle
                                                          className="cursor-pointer mb-0 text-primary"
                                                          as="span"
                                                          eventKey={eventKey}
                                                          onClick={()=>this.toggleAccordion(aggregate,ag_index)}
                                                        >
                                                          <a href='#' onClick={(e)=> e.preventDefault()} className="underline">{aggregate?.budgetversion?.version_code?.name} ({aggregate?.budgetversion?.version_code?.code})</a>&nbsp;
                                                          {
                                                            aggregate?.is_open ? <FaMinusCircle className="text-danger"/> : <FaPlusCircle/>
                                                          }
                                                        </Accordion.Toggle>



                                                        <div className="d-flex">

                                                          <table className="table">
                                                            <thead>
                                                              <tr>

                                                                <th className="text-right">Total Naira part(&#x20a6;)</th>
                                                                  <th className="text-right">Total USD part($)</th>
                                                                <th className="text-right">Total in Naira(&#x20a6;)</th>
                                                                <th className="text-right">Total in USD($)</th>

                                                              </tr>
                                                              <tr>
                                                                <th className="text-right">
                                                                  <b><a className="underline" href="#">{utils.formatNumber(aggregate?.total_naira_portion)}</a></b>

                                                                </th>
                                                                <th className="text-right">
                                                                  <b><a className="underline" href="#">{utils.formatNumber(aggregate?.total_currency_portion)}</a></b>

                                                                </th>

                                                                <th className="text-right">
                                                                    <b><a className="underline" href="#">{utils.formatNumber(aggregate?.total_functional_naira)}</a></b>

                                                                </th>
                                                                <th className="text-right">
                                                                  <b><a className="underline" href="#">{utils.formatNumber(aggregate?.total_functional_currency)}</a></b>

                                                                </th>
                                                              </tr>
                                                            </thead>
                                                          </table>
                                                          <div>

                                                          </div>


                                                        {/*  <i className="mx-1 i-Reload"> </i>
                                                          <i className="mx-1 i-Close-Window"></i>

                                                          <i className="mx-1 i-Drag"> </i>
                                                          <i className="mx-1 i-Full-Screen-2"></i>
                                                          <i className="mx-1 i-Close-Window"></i>
                                                          */}
                                                        </div>
                                                      </Card.Header>
                                                      <Accordion.Collapse eventKey={eventKey}>
                                                        <Card.Body>
                                                          <div>
                                                            {this.buildVersionRows(aggregate)}
                                                          </div>

                                                          <div>
                                                            {
                                                              this.displayEntityCategoryGraph(aggregate)
                                                            }
                                                          </div>

                                                        </Card.Body>
                                                      </Accordion.Collapse>
                                                    </Accordion>
                                                  </Card>

                                                )

                                            }) : (
                                              <Card key={'empty'} className="shadow-sm mb-3">
                                                <Accordion>
                                                  <Card.Header className="d-flex align-items-center justify-content-between text-center">
                                                    <Accordion.Toggle
                                                      className="cursor-pointer mb-0 text-primary"
                                                      as="span"
                                                      eventKey={'no_data'}

                                                    >

                                                    </Accordion.Toggle>



                                                    <div className="empty_data text-center">



                                                        <h5 className='mt-4'>No records for <b> {year}</b></h5>

                                                    </div>
                                                  </Card.Header>
                                                  <Accordion.Collapse eventKey={'no_data'}>
                                                    <Card.Body>

                                                      Nothing here
                                                    </Card.Body>
                                                  </Accordion.Collapse>
                                                </Accordion>
                                              </Card>
                                            )
                                            }
                                            </div>

                                          </div>


                                        </div>

                                    )

                                  }):  (
                                    <div className="col-12">
                                      <div className='row'>
                                        <div className='col-md-12 text-center mt-5 pb-5 '>
                                          <FetchingRecords  isFetching={isFetching} emptyMsg={(<h5><b><em>No filtered records.</em></b></h5>)}/>
                                        </div>
                                      </div>
                                    </div>

                                  )
                                }

                              </div>





                            </div>

                          </Tab.Pane>
                          <Tab.Pane eventKey="graph_view">

                            <div className='card-header text-center pb-4'>
                              <h4>Year to year version comparisons</h4>
                            </div>

                            <div className='cardx'>

                              <MultipleBarChart caller='department_versions' colors={graphColors} chartData={reportData}/>
                            </div>

                          </Tab.Pane>
                        </Tab.Content>
                      </Tab.Container>

                  </div>



              </div>
            </div>
          </div>
        </>
      )
  }

}


export default DepartmentalOverview;
