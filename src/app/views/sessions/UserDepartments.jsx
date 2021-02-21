import React, { Component} from "react";

import Footer from "../../GullLayout/SharedComponents/Footer";
import jwtAuthService from "../../services/jwtAuthService";
import { logoutUser } from "app/redux/actions/UserActions";
import AppNotification from "app/appNotifications";

import { Redirect, withRouter } from "react-router-dom";
import { FaCog } from "react-icons/fa";

import PropTypes from "prop-types";
import { connect } from "react-redux";




export class UserDepartmentsComponent extends Component {

  constructor(props){
    super(props)
  }

  state = {
    departmentRolesList:[

    ],
    backgroundColors:[
      'primary',
      'secondary',
      'success',
      'info_custom',
      'secondary_custom',
      'info',
      'warning',
      'danger',
    ],
    activeUser:{},
    navigate:false
  }

  setHoverClass = (index) => {
    let { departmentRolesList } = this.state
    departmentRolesList[index].hover_class = true;
    this.setState({ departmentRolesList });

  }

  componentDidMount(){
    let { departmentRolesList, activeUser } = this.state
      departmentRolesList = jwtAuthService.getUserDepartmentRoles();
      activeUser = jwtAuthService.getUser();
      if(!activeUser){
        new AppNotification({
          msg:"Unauthenticated! Please login.",
          type:"error"
        })
        this.props.logoutUser();
      }
      this.setState({ departmentRolesList, activeUser });
  }

  pushUserToDashboard = (departmentRole)=>{
    jwtAuthService.setActiveDepartmentRole(departmentRole);
    console.log('DEPPAPPA', departmentRole)
    const { role } = departmentRole;
    const { role_tasks } = role;
    const userTasks = role_tasks ? JSON.parse(role_tasks) : [];

    jwtAuthService.setActiveDepartmentRole(departmentRole);
    jwtAuthService.setUserTasks(userTasks);

    let href= window.location.href;
    href = href.replace("user-departments","dashboard");
    window.location.href=href;
    // this.setState({navigate:true});

  }



render(){

  let itemIndex = 0;
  const { backgroundColors, activeUser, departmentRolesList } = this.state;
  const setIndex = (departmentIndex) => {
    itemIndex = departmentIndex;
    if(itemIndex > 7){
      itemIndex = 0;
    }
    const backgroundColor = backgroundColors[itemIndex]
    return backgroundColor;
  }





  return this.state.navigate ? (<Redirect to="/dashboard"/>) : (
    <>

    <div className="cardx"   style={{

      }}>

      <div className="card-header border-bottom ante-header">
        <button className="float-right btn btn-secondary_custom" onClick={this.props.logoutUser}>
          Logout <i className='i-Power-2'></i>
        </button>
        <h3>
          <span className="text-success">Welcome,</span> <b>{ activeUser?.first_name } { activeUser?.last_name }</b>.&nbsp;
          {
            departmentRolesList.length ? (<em>Continue to one of your departments. You can always switch later on.</em>)  :(
                <em className='text-danger'>You do not have any active profile(s) for now. Please contact Admin.</em>
              )
          }

        </h3>
      </div>

      <div className="card-bodyx ante-page" style={{ backgroundImage: "url(/assets/images/photo-long-3.jpg)"}}>

        <div className="row p-3">
          {
          !departmentRolesList.length ? (
          <div className='col-md-12 '>
            <div className='jumbotron mt-6' >
                <textarea className='form-control'/>
            </div>
          </div>
          ):  departmentRolesList.map((departmentRole, index)=>{
              return (

                <div className={`col-md-4 mb-3 hover`} key={departmentRole?.slug} onClick={()=>this.pushUserToDashboard(departmentRole)}>
                  <div className={`card ${departmentRole.hover_class ? "shadow-lg":""} text-white bg-${setIndex(index)}`} onMouseEnter={()=>this.setHoverClass(index)}>
                    <div className="card-title pt-2 pl-3">
                      <h4 className="pt-2 text-white">{departmentRole?.department?.name} ({departmentRole?.department?.code})</h4>
                      <p className="card-text text-white">
                          {departmentRole?.department.description}
                      </p>
                    </div>
                    <div className='text-centerx pl-3'>
                      <h4 className='text-white'>AS</h4>
                    </div>
                    <div className="card-body">
                      <h4 className="text-white">
                        <b>Role:</b> {departmentRole?.role.name}
                      </h4>
                      <p className="card-text">
                        {departmentRole?.role.description}
                      </p>
                    </div>

                  </div>

                </div>

              )
            })
          }


        </div>


      </div>


      <div className='outer-footer'>
        <Footer/>
      </div>


    </div>

    </>


  )
}


}


UserDepartmentsComponent.propTypes = {
  logoutUser: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  logoutUser: PropTypes.func.isRequired,
});

export default withRouter(
  connect(mapStateToProps, {
    logoutUser
  })(UserDepartmentsComponent)
);


// export default UserDepartmentsComponent;
