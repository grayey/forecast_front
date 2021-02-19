import React, { Component } from "react";
import { Formik } from "formik";
import * as yup from "yup";
import { loginWithEmailAndPassword } from "app/redux/actions/LoginActions";
import jwtAuthService from "app/services/jwtAuthService";
import AppMainService from "app/services/appMainService";
import AppNotification from "app/appNotifications";
import * as utils from "@utils";


import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link, Redirect } from "react-router-dom";
import { Button } from "react-bootstrap";
import { FaCog, FaCheckCircle, FaTimesCircle, FaArrowLeft } from "react-icons/fa";
import queryString from "query-string";
import { FetchingRecords } from "app/appWidgets";




const ResetPasswordSchema = yup.object().shape({
  password: yup
    .string().min(8, "Password must be 8 character long")
    .required("Password is required"),
    confirm_email: yup
      .string()
      .required("Please confirm password"),

});

class ResetPassword extends Component {
  appMainService;

  constructor(props){
    super(props);
    this.appMainService = new AppMainService();
  }

  state = {
    password: "",
    confirm_password: "",
    isLoading:false,
    isSubmitting:false,
    PRIMARY_COLOR:"rgb(36,47,106)" ,
    SECONDARY_COLOR:"rgb(23,162,184)",
    COMPANY_NAME:"",
    resetErrorResponse:"",
    tokenExpired:false,
    canReset:false,
    reset_token:"",
    redirect_url:"",
    redirectTimer:null,
    isXTK:false,
    isXSR:false,
    showBackButton:false
  };

  handleChange =  event => {
    // event.persist();
    const { name, value } = event.target;
    this.setState({ [name]: value });

  };

  handleSubmit = (value, { isSubmitting }) => {

    // this.checkResetPassword(value);
  };

  goBack = () =>{
    window.history.back();
  }

  componentDidMount = () => {
    const { PRIMARY_COLOR, SECONDARY_COLOR, COMPANY_NAME } = jwtAuthService.getAppSettings() || {};
    this.setState({ PRIMARY_COLOR, SECONDARY_COLOR, COMPANY_NAME });
    const urlParams = queryString.parse(this.props.location.search);
    const {XTK, XSR} = urlParams;
    if(XTK){
      this.setState({isXTK:true})
      this.checkResetToken(XTK);
    }else if(XSR){
      this.setState({canReset:true, isXSR:true})
    }

  this.setState({
    showBackButton:!!localStorage.getItem('RESET_EMAIL')
  })

  }

  componentWillUnmount = () =>{
    const { redirectTimer } = this.state;
    clearTimeout(redirectTimer);
  }

  passwordsMatch = () => {
    const { password, confirm_password } = this.state;
    return password && password==confirm_password
  }

  checkResetToken = (xtk) => {
    this.setState({isLoading:true})
    this.appMainService.checkResetToken(xtk).then(
        async(resetTokenResponse)=> {
          this.setState({canReset:true, isLoading:false, reset_token:xtk})
        }
    ).catch((error)=>{
      const msg = utils.processErrors(error).replace('NOT_FOUND','').replace('TOKEN_EXPIRED','').replace('UNKNOWN','');
        this.setState({isLoading:false, resetErrorResponse:`${msg}. Reset again.`});
        const errorNotification = {
            type:'error',
            msg
        }
        new AppNotification(errorNotification)
    })
  }

  resetUserPassword = async(event) => {
    event.preventDefault();
    let { password, confirm_password, reset_token, redirect_url, isXSR } = this.state;
    if(password !== confirm_password) {
      return new AppNotification({
      type:"error",
      "msg":"Passwords do not match!"
    })}
    this.setState({isSubmitting:true});
    const data = { password, reset_token };
    redirect_url = "/";
    if(isXSR){
      delete data.reset_token;
      data['email'] = await localStorage.getItem('RESET_EMAIL');
      redirect_url = await localStorage.getItem('RESET_REDIRECT_URL');
    }
   this.appMainService.resetPassword(data).then(
       async(resetPasswordResponse) => {
         let { msg } = resetPasswordResponse;
         msg += data['email'] ? " Redirecting .." :" You may log in .."
         const successNotification = {
             type:'success',
             msg
         }
         new AppNotification(successNotification);
         const redirectTimer = setTimeout(()=>{
           this.setState({ redirect_url })
         },1500)
         localStorage.setItem('RESET_EMAIL', null)
         localStorage.setItem('RESET_REDIRECT_URL', null)
         this.setState({isSubmitting:false,redirectTimer})
       }
   ).catch((error)=>{
     this.setState({isSubmitting:false})
       const errorNotification = {
           type:'error',
           msg:utils.processErrors(error)
       }
       new AppNotification(errorNotification)
   })

  }

  render() {
    const { PRIMARY_COLOR, SECONDARY_COLOR, COMPANY_NAME, isLoading, resetErrorResponse, canReset, showBackButton, redirect_url} = this.state;
    return redirect_url ? <Redirect to={redirect_url}/> : (
      <div
        className="auth-layout-wrap"
        style={{
          backgroundImage: "url(/assets/images/user-depts_bg.png)"
        }}
      >
        <div className="auth-content">
          {
            isLoading ? (
              <FetchingRecords isFetching={isLoading}/>
            ): null
          }
          <div className="card o-hidden">
            <div className="row">
              <div className="col-md-6">
                <div className="p-4">
                  <div className="auth-logo text-center mb-4">
                    <img src="/assets/images/logo.png" alt="" />
                  </div>

                  <h1 className="mb-3 text-18">Reset Password</h1>


                  <Formik
                    initialValues={this.state}
                    validationSchema={ResetPasswordSchema}
                    onSubmit={()=>console.log('')}
                  >
                    {({
                      values,
                      errors,
                      touched,
                      handleChange,
                      handleBlur,
                      handleSubmit,
                      isSubmitting
                    }) => (
                      <form onSubmit={this.resetUserPassword}>
                        <div className="form-group">
                          <label htmlFor="password">New password</label>
                          <input
                            className="form-control form-control-rounded position-relative"
                            type="password"
                            name="password"
                            onChange={this.handleChange}
                            onBlur={handleBlur}
                            id="password"
                            value={this.state.password || ""}
                          />
                          {errors.password && (
                            <div className="text-danger mt-1 ml-2">
                              {errors.password}
                            </div>
                          )}
                        </div>

                        <div className="form-group">
                          <label htmlFor="confirm_password">Confirm password</label>
                          <input
                            className="form-control form-control-rounded position-relative"
                            type="password"
                            name="confirm_password"
                            onChange={this.handleChange}
                            onBlur={handleBlur}
                            id="confirm_password"
                            value={this.state.confirm_password || ""}
                          />
                          {errors.password && (
                            <div className="text-danger mt-1 ml-2">
                              {errors.confirm_password}
                            </div>
                          )}
                        </div>
                        {
                          canReset ? (
                            <button
                              className="btn btn-rounded btn-primary btn-block mt-2"
                              type="submit"
                              disabled={this.state.isSubmitting || !this.passwordsMatch()}
                            >
                              Reset Password {
                                this.state.isSubmitting ? (
                                  <FaCog className='spin'/>
                                ):null
                              }
                            </button>
                          ) : null
                        }

                      </form>
                    )}
                  </Formik>
                  {
                    resetErrorResponse ? (
                      <div className='text-center'>
                        <Link to="/forgot-password"  className='underline  text-danger w-100 p-1'><FaTimesCircle/> {resetErrorResponse}</Link>
                      </div>
                    ):null
                  }


                  <div className="mt-3 text-center">

                    <Link to="/" className="text-muted mr-4">
                      <u>Signin</u>
                    </Link>
                    <Link to="/forgot-password" className="text-muted">
                      <u>Forgot Password</u>
                    </Link>
                  </div>
                </div>
              </div>
              <div
                className="col-md-6 text-center "
                style={{
                  backgroundSize: "cover",
                  backgroundImage: "url(/assets/images/photo-long-3.jpg)"
                }}
              >
                <div className="pr-3 auth-right">
                  <h3 className="text-white mb-1"><em>{COMPANY_NAME}</em></h3>
                  <h4 className="text-white"><b>Budget Management Portal</b></h4>
                  {
                    showBackButton ? (
                      <div className='mt-5'>
                        <button onClick={this.goBack} className="btn btn-secondary text-muted mr-4">
                          <FaArrowLeft/> Go Back
                      </button>
                      </div>
                    ): null
                  }
                  {/* <Button className="btn btn-rounded btn-outline-primary btn-outline-email btn-block btn-icon-text">
                    <i className="i-Mail-with-At-Sign"></i> Sign up with Email
                  </Button>
                  <Button className="btn btn-rounded btn-outline-google btn-block btn-icon-text">
                    <i className="i-Google-Plus"></i> Sign up with Google
                  </Button>
                  <Button className="btn btn-rounded btn-block btn-icon-text btn-outline-facebook">
                    <i className="i-Facebook-2"></i> Sign up with Facebook
                  </Button> */}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }
}

const mapStateToProps = state => ({
  loginWithEmailAndPassword: PropTypes.func.isRequired,
  user: state.user
});

export default connect(mapStateToProps, {
  loginWithEmailAndPassword
})(ResetPassword);
