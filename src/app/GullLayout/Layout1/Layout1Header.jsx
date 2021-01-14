import React, { Component } from "react";
import { Dropdown } from "react-bootstrap";
import DropdownMenu from "react-bootstrap/DropdownMenu";
import { getTimeDifference } from "@utils";
import DropdownToggle from "react-bootstrap/DropdownToggle";
import { Link, Redirect, NavLink, withRouter } from "react-router-dom";
import { FaCog } from "react-icons/fa";

import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  setLayoutSettings,
  setDefaultSettings
} from "app/redux/actions/LayoutActions";

import { logoutUser } from "app/redux/actions/UserActions";
import { setactivebudgetcycle, getactivebudgetcycle } from "app/redux/actions/BudgetCycleActions";
import { merge } from "lodash";
import MegaMenu from "@gull/components/MegaMenu";

import ProcessingService from "../../services/processing.service";
import jwtAuthService from "../../services/jwtAuthService";
import AppMainService from "../../services/appMainService";

import * as utils from "@utils";
import AppNotification from "../../appNotifications";
import { SystemNotifications } from "app/appWidgets";

class Layout1Header extends Component {

  processingService;
  appMainService;

  constructor(props){
    super(props);
    this.processingService = new ProcessingService();
    this.appMainService = new AppMainService();
  }
  state = {

    activeBudgetCycle:{},
    activeUser:{},
    activeDepartmentRole:{},
    userDepartmentRoles:[],
    allBudgetCycles:[],
    fetching:false,
    toDashboard:false,
    shorcutMenuList: [
      {
        icon: "i-Shop-4",
        link: "#",
        text: "Home"
      },
      {
        icon: "i-Library",
        link: "#",
        text: "Ui Kits"
      },
      {
        icon: "i-Drop",
        link: "#",
        text: "Apps"
      },
      {
        icon: "i-File-Clipboard-File--Text",
        link: "#",
        text: "Form"
      },
      {
        icon: "i-Checked-User",
        link: "#",
        text: "Sessions"
      },
      {
        icon: "i-Ambulance",
        link: "#",
        text: "Support"
      }
    ],
    notificationList: [
      {
        icon: "i-Speach-Bubble-6",
        title: "New message",
        description: "James: Hey! are you busy?",
        time: "2019-10-30T02:10:18.931Z",
        color: "primary",
        status: "New"
      },
      {
        icon: "i-Receipt-3",
        title: "New order received",
        description: "1 Headphone, 3 iPhone",
        time: "2019-03-10T02:10:18.931Z",
        color: "success",
        status: "New"
      },
      {
        icon: "i-Empty-Box",
        title: "Product out of stock",
        description: "1 Headphone, 3 iPhone",
        time: "2019-05-10T02:10:18.931Z",
        color: "danger",
        status: "3"
      },
      {
        icon: "i-Data-Power",
        title: "Server up!",
        description: "Server rebooted successfully",
        time: "2019-03-10T02:10:18.931Z",
        color: "success",
        status: "3"
      }
    ],
    showSearchBox: false
  };

  handleMenuClick = () => {
    let { setLayoutSettings, settings } = this.props;
    setLayoutSettings(
      merge({}, settings, {
        layout1Settings: {
          leftSidebar: {
            open: settings.layout1Settings.leftSidebar.secondaryNavOpen
              ? true
              : !settings.layout1Settings.leftSidebar.open,
            secondaryNavOpen: false
          }
        }
      })
    );
  };

  toggleFullScreen = () => {
    if (document.fullscreenEnabled) {
      if (!document.fullscreen) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    }
  };

  handleSearchBoxOpen = () => {
    let { setLayoutSettings, settings } = this.props;
    setLayoutSettings(
      merge({}, settings, {
        layout1Settings: {
          searchBox: {
            open: true
          }
        }
      })
    );
  };

  componentDidMount = async() => {
    let { activeDepartmentRole, userDepartmentRoles, activeUser } = this.state;
    await this.getactivebudgetcycle();
    activeDepartmentRole = jwtAuthService.getActiveDepartmentRole();
    userDepartmentRoles = jwtAuthService.getUserDepartmentRoles();
    activeUser = jwtAuthService.getUser();
    console.log("ACTIVE USER", activeUser);
    this.getAllEntities();
    this.setState({ activeDepartmentRole, userDepartmentRoles, activeUser })
    // const { activeBudgetCycle } = this.props.bugetcycleData;
    // this.props.setactivebudgetcycle(activeBudgetCycle.id)
  }

  // componentWillReceiveProps(nextProps){
  //   const { activeBudgetCycle } = this.props.bugetcycleData;
  //   if(nextProps.bugetcycleData.activeBudgetCycle.id !== activeBudgetCycle.id){
  //     this.setState({ activeBudgetCycle })
  //   }
  // }

  handleBudgetCycleSelection = (event) => {
    this.setactivebudgetcycle(event.target.value);
  }

  /**
   * This method lists all entities
   */
   getAllEntities = async ()=>{

      this.appMainService.getAllEntities().then(
          (entitiesResponse)=>{
              const allEntities = entitiesResponse.map(e => e.name);
                localStorage.setItem('ENTITIES', JSON.stringify(allEntities));

              console.log('Entities response', allEntities)
          }
      ).catch((error)=>{

          console.log('Error', error)
      })
  }

  getactivebudgetcycle = () => {

    let { fetching } = this.state
    fetching = !fetching;
    this.setState({ fetching })
    this.processingService.getAllBudgetCycles().then(
        (budgetCycleResponse)=>{
          fetching = !fetching;
          const allBudgetCycles = budgetCycleResponse.filter((cycle)=>{
            return cycle.is_current;
          })
          const storedCycle = localStorage.getItem('ACTIVE_BUDGET_CYCLE') ? JSON.parse(localStorage.getItem('ACTIVE_BUDGET_CYCLE')) : allBudgetCycles[0];
          allBudgetCycles.reverse();
          let activeBudgetCycle = {};
          if(storedCycle){
             activeBudgetCycle = allBudgetCycles.find(bc=> bc.id == storedCycle.id) || {};// because the stored cycle might have old active version
            const { budgetversions } = activeBudgetCycle;
            activeBudgetCycle.budgetversions = undefined; //delete budgetversions
            activeBudgetCycle.active_version = budgetversions ? budgetversions.find(version=>version.is_active) : {};

            localStorage.setItem('ACTIVE_BUDGET_CYCLE', JSON.stringify(activeBudgetCycle));
          }

        this.setState({ allBudgetCycles,fetching, activeBudgetCycle })

        }).catch((error)=>{
          fetching = !fetching;
            this.setState({ fetching });
            console.error(error)
        const errorNotification = {
            type:'error',
            msg:utils.processErrors(error)
        }
        // new AppNotification(errorNotification)
    })
  }

  setactivebudgetcycle = (budgetCycleId)  => {
    if(!budgetCycleId) return;

    let { fetching, allBudgetCycles, activeBudgetCycle } = this.state
     activeBudgetCycle = allBudgetCycles.find(c => c.id == budgetCycleId);
     // localStorage.setItem('ACTIVE_BUDGET_CYCLE', JSON.stringify(cycle));

    fetching = !fetching;
    this.setState({ fetching, activeBudgetCycle});

    this.processingService.getBudgetCycleById(budgetCycleId).then(
        (budgetCycleResponse) => {
          const cycle = budgetCycleResponse;
          const { budgetversions } = cycle;
          cycle.active_version = budgetversions.find(version=>version.is_active);
          cycle.budgetversions = undefined; //delete budgetversions
          localStorage.setItem('ACTIVE_BUDGET_CYCLE', JSON.stringify(cycle));
          // const successNotification = {
          //     type:'success',
          //     msg:`Budget cycle selection reset to ${budgetCycleResponse.year}.`
          // }
          // new AppNotification(successNotification);
          window.location.reload();
        }
    ).catch((error)=>{
        const errorNotification = {
            type:'error',
            msg:utils.processErrors(error)
        }
        new AppNotification(errorNotification)
    })

  }

  setActiveDepartment = async (event, departmentRole)=>{
    event.preventDefault();
    const { activeDepartmentRole } = this.state;
    if(activeDepartmentRole.id == departmentRole.id){//no need to reload
      return;
    }
    console.log('ACTIVE DEPPEPPE',departmentRole);
    const { role_tasks } = departmentRole.role;
    const userTasks = role_tasks ? JSON.parse(role_tasks) : [];
  await  jwtAuthService.setActiveDepartmentRole(departmentRole);
  jwtAuthService.setUserTasks(userTasks);

    let href = window.location.href;
    if(href.includes('review') && href.endsWith('approval')){ // keep up appearnces
      const { role } = jwtAuthService.getActiveDepartmentRole();
      let hrefParts = href.split('/');
      const approvalSlug = hrefParts[hrefParts.length - 1];

      if(!role.approval){
          // this.setState({ toDashboard:true })
          hrefParts = href.split('review');
           new AppNotification({
            type:"warning",
            msg:`In the role of ${role.name}, you are not an approver...`
          });
          setTimeout(() =>{
             window.location.href = hrefParts[0]+'preparation/budget-entries';
          }, 2000)
          return;
      }
      const newSlug = `${role.name.toLowerCase().split(' ').join('')}-approval`;
      href = href.replace(approvalSlug,newSlug);
      window.location.href = href;
    }else{
      window.location.reload();
    }


  }



  render() {
    let { shorcutMenuList = [], notificationList = [], allBudgetCycles, activeBudgetCycle, activeDepartmentRole, userDepartmentRoles,activeUser, fetching, toDashboard } = this.state;
    return (

      <div className="main-header">
        <div className="logo">
          <img src="/assets/images/logo.png" alt="" />
        </div>

        <div className="menu-toggle" onClick={this.handleMenuClick}>
          <div></div>
          <div></div>
          <div></div>
        </div>

        <div className="d-none d-lg-flex align-items-center">
          <Dropdown className="mr-3">
            <Dropdown.Toggle as="span" className="toggle-hidden cursor-pointer">
              Mega Menu
            </Dropdown.Toggle>

            <div className="mega-menu">
              <Dropdown.Menu>
                <MegaMenu></MegaMenu>
              </Dropdown.Menu>
            </div>
          </Dropdown>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search"
              onFocus={this.handleSearchBoxOpen}
            />
            <i className="search-icon text-muted i-Magnifi-Glass1"></i>
          </div>

          <div className="ml-5">

            <div className="input-group mt-1 ml-2">
              <div className="input-group-prepend">
                <span className="input-group-text bg-success text-white">
                  Select Budget Cycle
                </span>
              </div>
              <select className="form-control" disabled={fetching} value={activeBudgetCycle?.id} onChange={this.handleBudgetCycleSelection}>
                <option value="">
                  Select
                </option>
                {
                  allBudgetCycles.map((cycle)=>{
                    return (
                      <option key={cycle.id} value={cycle.id} >
                        {cycle.year}
                      </option>
                    )
                  })
                }
              </select>

              <div className="input-group-append">
                     <button className="btn btn-success">
                       {
                         fetching ? <small><FaCog className="spinner small-spin"  /></small> : <span>Go</span>
                       }
                     </button>
                  </div>
            </div>

          </div>
        </div>

        <div style={{ margin: "auto" }}></div>

        <div className="header-part-right">
          <i
            className="i-Full-Screen header-icon d-none d-sm-inline-block"
            data-fullscreen
            onClick={this.toggleFullScreen}
          ></i>

          <Dropdown>
            <Dropdown.Toggle as="span" className="toggle-hidden">
              <i
                className="i-Posterous text-muted header-icon"
                role="button"
              ></i>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <div className="menu-icon-grid">

                {
                  userDepartmentRoles.map(dr => (
                    <Link key={dr.slug} to="#" className={dr.id == activeDepartmentRole.id ? "bg-success text-white" : ""} onClick={
                        (event)=>this.setActiveDepartment(event,dr)}>
                      <i className="i-Shop-4"></i> <small>{dr.department.name}</small> as <small>{dr.role.name}</small>
                    </Link>
                  ))
                }
              </div>
            </Dropdown.Menu>
          </Dropdown>



        <SystemNotifications notificationList={notificationList} />




          <div className="user col align-self-end">
            <Dropdown>
              <DropdownToggle
                as="span"
                className="toggle-hidden cursor-pointer"
              >
                <img
                  src="/assets/images/faces/1.jpg"
                  id="userDropdown"
                  alt=""
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                />
              </DropdownToggle>
              <DropdownMenu>
                <div className="dropdown-header">
                  <i className="i-Lock-User mr-1"></i>
                  {activeUser?.first_name} {activeUser?.last_name}
                </div>
                <Link to="/" className="dropdown-item cursor-pointer">
                Profile
                </Link>
                {/* <Link to="/" className="dropdown-item cursor-pointer">
                  Billing history
                </Link> */}
                <Link
                  to="/"
                  className="dropdown-item cursor-pointer"
                  onClick={this.props.logoutUser}
                >
                  Sign out
                </Link>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
    );
  }
}

Layout1Header.propTypes = {
  setLayoutSettings: PropTypes.func.isRequired,
  setDefaultSettings: PropTypes.func.isRequired,
  logoutUser: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  setDefaultSettings: PropTypes.func.isRequired,
  setLayoutSettings: PropTypes.func.isRequired,
  logoutUser: PropTypes.func.isRequired,
  user: state.user,
  settings: state.layout.settings,
  bugetcycleData: state.budgetCycle
});

export default withRouter(
  connect(mapStateToProps, {
    setLayoutSettings,
    setDefaultSettings,
    setactivebudgetcycle,
    getactivebudgetcycle,
    logoutUser
  })(Layout1Header)
);
