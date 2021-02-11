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
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { FaCog, FaCheckCircle } from "react-icons/fa";


const ForgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email")
    .required("email is required")
});

class ForgotPassword extends Component {
  appMainService;

  constructor(props){
    super(props);
    this.appMainService = new AppMainService();
  }

  state = {
    email: "",
    isLoading:false,
    PRIMARY_COLOR:"rgb(36,47,106)" ,
    SECONDARY_COLOR:"rgb(23,162,184)",
    COMPANY_NAME:"",
    resetResponse:"",
    resetTimer:null
  };

  handleChange = event => {
    event.persist();
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleSubmit = (value, { isSubmitting }) => {

    // this.checkForgotPassword(value);
  };

  componentDidMount = () => {
    const { PRIMARY_COLOR, SECONDARY_COLOR, COMPANY_NAME } = jwtAuthService.getAppSettings() || {};
    this.setState({ PRIMARY_COLOR, SECONDARY_COLOR, COMPANY_NAME });

  }

  componentWillUnmount = () =>{
    const { resetTimer } = this.state;
    clearTimeout(resetTimer);
  }

  checkForgotPassword = (value) => {

    const { email } = value;
    this.setState({isLoading:true})
   this.appMainService.checkForgotPassword(email).then(
       async(forgotPasswordResponse)=> {
         const { msg } = forgotPasswordResponse;
         const successNotification = {
             type:'success',
             msg
         }
         new AppNotification(successNotification);
         this.setState({isLoading:false, resetResponse:`Please check your email at ${email}.`});
         const resetTimer = setTimeout(()=>{
           this.setState({resetResponse:"",email:""});
         },3000)

         this.setState({resetTimer})



           console.log('forgotPasswordResponse ', forgotPasswordResponse)
       }
   ).catch((error)=>{
       this.setState({isLoading:false})
       const errorNotification = {
           type:'error',
           msg:utils.processErrors(error)
       }
       new AppNotification(errorNotification)
   })

  }

  render() {
    const { PRIMARY_COLOR, SECONDARY_COLOR, COMPANY_NAME, isLoading, resetResponse } = this.state;
    return (
      <div
        className="auth-layout-wrap"
        style={{
          backgroundImage: "url(/assets/images/user-depts_bg.png)"
        }}
      >
        <div className="auth-content">
          <div className="card o-hidden">
            <div className="row">
              <div className="col-md-6">
                <div className="p-4">
                  <div className="auth-logo text-center mb-4">
                    <img src="/assets/images/logo.png" alt="" />
                  </div>
                  <h1 className="mb-3 text-18">Forgot Password</h1>
                {
                  resetResponse ? (
                    <p className='text-success w-100 p-1'><FaCheckCircle/> {resetResponse}</p>
                  ):null
                }

                  <Formik
                    initialValues={this.state}
                    validationSchema={ForgotPasswordSchema}
                    onSubmit={this.checkForgotPassword}
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
                      <form onSubmit={handleSubmit}>
                        <div className="form-group">
                          <label htmlFor="email">Email address</label>
                          <input
                            className="form-control form-control-rounded position-relative"
                            type="email"
                            name="email"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.email}
                          />
                          {errors.email && (
                            <div className="text-danger mt-1 ml-2">
                              {errors.email}
                            </div>
                          )}
                        </div>
                        <button
                          className="btn btn-rounded btn-primary btn-block mt-2"
                          type="submit"
                          disabled={isLoading}
                        >
                          Reset Password {
                            isLoading ? (
                              <FaCog className='spin'/>
                            ):null
                          }
                        </button>
                      </form>
                    )}
                  </Formik>

                  <div className="mt-3 text-center">
                    <Link to="/" className="text-muted">
                      <u>Signin</u>
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
})(ForgotPassword);
