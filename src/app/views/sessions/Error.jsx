import React, { Component } from "react";
import { Link, Redirect, NavLink, withRouter } from "react-router-dom";
import { VIEW_FORBIDDEN } from "../../appConstants";
import AppNotification  from "../../appNotifications";
import { logoutUser } from "app/redux/actions/UserActions";
import PropTypes from "prop-types";
import { connect } from "react-redux";



class Error extends Component {
  intervalRef = null

  state = {
    timeLeft:5000,
  };

  getErrorView = () =>{

    const { errorType } = this.props;
    const { timeLeft } = this.state;
    const errorObject = {
      VIEW_FORBIDDEN : (
        <div className="not-found-wrap text-center">
          <h1 className="text-60">403</h1>
        <p className="text-36 subheading mb-3">Access Denied</p>
          <p className="mb-5  text-muted text-18">
            Please contact admin if you require access. For now, you may move on <b>OR</b> be logged out in <b>{Math.round(timeLeft/1000)}</b> second{timeLeft > 1000 ? 's':''} ...
          </p>
        </div>
      )
    }

    if(errorType){
      const view = errorObject[errorType];
      return view;
    }

    return (
      <div className="not-found-wrap text-center">
        <h1 className="text-60">404</h1>
        <p className="text-36 subheading mb-3">Error!</p>
        <p className="mb-5  text-muted text-18">
          Sorry! The page you were looking for doesn't exist.
        </p>
        <Link to="/dashboard" className="btn btn-lg btn-primary btn-rounded">
          Go back to home
        </Link>
      </div>
    );

  }

  componentDidMount  = () =>{
    const { errorType, logoutUser } = this.props;
    let { timeLeft } = this.state;
    if(errorType == VIEW_FORBIDDEN){
    this.intervalRef = setInterval(()=>{
      timeLeft = timeLeft - 1000;
      if(!timeLeft){
        new AppNotification({
          type:"warning",
          msg:"You attempted illegal access."
        })
        logoutUser();
      }else{
        this.setState({ timeLeft })
      }
      }, 1000)
    }

  }


  render() {
    return this.getErrorView();
  }

  componentWillUnmount = () =>{
    clearInterval(this.intervalRef)
  }
}

Error.propTypes = {
  logoutUser: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  logoutUser: PropTypes.func.isRequired,
});


export default withRouter(
  connect(mapStateToProps, {
    logoutUser
  })(Error)
);
