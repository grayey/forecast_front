import React, { Component} from "react";
import Footer from "../../GullLayout/SharedComponents/Footer";
import jwtAuthService from "../../services/jwtAuthService";
import { Redirect } from "react-router-dom";



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
      this.setState({ departmentRolesList, activeUser });
  }

  pushUserToDashboard = (departmentRole)=>{
    jwtAuthService.setActiveDepartmentRole(departmentRole);
    this.setState({navigate:true});

  }



render(){

  let itemIndex = 0;
  const { backgroundColors, activeUser } = this.state;
  const setIndex = (departmentIndex) => {
    itemIndex = departmentIndex;
    if(itemIndex > 7){
      itemIndex = 0;
    }
    const backgroundColor = backgroundColors[itemIndex]
    return backgroundColor;
  }





  return this.state.navigate ? (<Redirect to="/dashboard/v1"/>) : (
    <>

    <div className="card"   style={{
        backgroundImage: "url(/assets/images/user-depts_bg.png)",
      }}>

      <div className="card-header border-bottom">
        <button className="float-right btn btn-secondary_custom">
          Logout
        </button>
        <h3>
          <span className="text-success">Welcome,</span> <b>{ activeUser?.first_name }</b>. Continue to one of your departments. You can always switch later on.
        </h3>
      </div>

      <div className="card-body">





        <div className="row">
          {
            this.state.departmentRolesList.map((departmentRole, index)=>{
              return (

                <div className={`col-md-4 mb-3 hover`} key={departmentRole?.slug} onClick={()=>this.pushUserToDashboard(departmentRole)}>
                  <div className={`card ${departmentRole.hover_class ? "shadow-lg":""} text-white bg-${setIndex(index)}`} onMouseEnter={()=>this.setHoverClass(index)}>
                    <div className="card-title">
                      <h4 className="pt-2 text-center text-white">{departmentRole?.department?.name} ({departmentRole?.department?.code})</h4>
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

      <div style={{height:"80px"}}>

      </div>
      <Footer/>


    </div>

    </>


  )
}


}




export default UserDepartmentsComponent;
