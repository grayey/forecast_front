import React, { Component } from "react";
import { Formik } from "formik";
import * as yup from "yup";
import { loginWithEmailAndPassword } from "app/redux/actions/LoginActions";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import AppMainService from "../../services/appMainService";
import * as encryptionService from "../../services/encryption.service";
import LoadingOverlay from 'react-loading-overlay';
import queryString from "query-string";

import { FaCog } from "react-icons/fa";

const SigninSchema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email")
    .required("email is required"),
  password: yup
    .string()
    .min(8, "Password must be 8 character long")
    .required("password is required")
});

class Signin extends Component {
  state = {
    email: "",
    password: "",
    app_settings:{
      SYSTEM_AUTHENTICATION:{},
      SYSTEM_ALIASES:{}
    },
    loadingSettings:true,
    isSubmitting:false
  };
  appMainService;

  constructor(props){
      super(props);
      this.appMainService = new AppMainService();

  }

async componentDidMount(){

  let { loadingSettings } = this.state;

  const urlParams = queryString.parse(this.props.location.search);

  console.log(urlParams, "dsjhjhjdfhjfdhj")
  console.log('Login props',this.props)

  if(!Object.keys(urlParams).length){
    await this.getAppSettings();
  }
  else{
    const user = await this.getUserFromParams(urlParams);
     this.props.loginWithEmailAndPassword(user);
    // loadingSettings = false;
    this.setState({ loadingSettings })

  }
}

getUserFromParams = (urlParams) => {

// decryptparrams

let { usn, usac } = urlParams;
// usn.replace(/" "/g,"+")
// usac.replace(/" "/g,"+")

const email = encryptionService.decryptData(usn);
const password = encryptionService.decryptData(usac);
console.log({email, password})


return {
  email:"er@er.com",
  password:"password123"
}

}

  handleChange = event => {
    event.persist();
    this.setState({ [event.target.name]: event.target.value });
  };

  handleSubmit = (value, { isSubmitting }) => {
    this.setState({isSubmitting:true})
    this.props.loginWithEmailAndPassword(value);
  };

  getAppSettings = async () => {
    const applied= true;
    let { loadingSettings } = this.state;
    loadingSettings = true;
    await this.setState({ loadingSettings })
        this.appMainService.getAppSettings().then(
          async (app_settings) => {
            const { SYSTEM_AUTHENTICATION, SERVER_URL }  = app_settings;
            loadingSettings = SYSTEM_AUTHENTICATION == "ACTIVE_DIRECTORY";
            if(loadingSettings){
              window.location.href = `${SERVER_URL}/ad/logon`;
            }

            this.setState({ loadingSettings, app_settings });

            console.log("app_settings", app_settings)
          }).catch((error)=>{
            loadingSettings = false;
            this.setState({ loadingSettings })

      })
  }

  setAppSettings = (appSettingsResponse)=> {
    let { app_settings } = this.state;
    appSettingsResponse.forEach((setting)=>{
      const { NAME } = setting;
       app_settings[NAME] = setting
    })
    this.setState({app_settings});

    console.log("APP SETTINGS Response",app_settings );

  }

  render() {

    const { loadingSettings } = this.state;

    return loadingSettings ?
      (
        <LoadingOverlay
          active={loadingSettings}
          spinner
          text='Resolving Authentication ...'>
            <div className="full-screen">
              <img src="/assets/images/logo.png" alt="Logo" className="modal-logox"  />

            </div>
        </LoadingOverlay>
      )

    : (
      <div
        className="auth-layout-wrap"
        style={{
          backgroundImage: "url(/assets/images/user-depts_bg.png)"
        }}
      >
        <div className="auth-content shadow-lg">
          <div className="card o-hidden">
            <div className="row">
              <div className="col-md-6">
                <div className="p-4">
                  <div className="auth-logo text-center mb-4">
                    <img src="/assets/images/logo.png" alt="" />
                  </div>
                  <h1 className="mb-3 text-18">Sign In</h1>
                  <Formik
                    initialValues={this.state}
                    validationSchema={SigninSchema}
                    onSubmit={this.handleSubmit}
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
                        <div className="form-group">
                          <label htmlFor="password">Password</label>
                          <input
                            className="form-control form-control-rounded"
                            type="password"
                            name="password"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.password}
                          />
                          {errors.password && (
                            <div className="text-danger mt-1 ml-2">
                              {errors.password}
                            </div>
                          )}
                        </div>
                        <button
                          className="btn btn-rounded btn-primary btn-block mt-2"
                          type="submit"
                          disabled={this.state.isSubmitting}
                        >
                          Sign In {
                            this.state.isSubmitting ? (<FaCog className='spin'/>) : null
                          }
                        </button>
                      </form>
                    )}
                  </Formik>

                  <div className="mt-3 text-center">
                    <Link to="/session/forgot-password" className="text-muted">
                      <u>Forgot Password?</u>
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
                <div className="auth-right">



                    <h4 className="text-white"><b>Budget Management Portal</b></h4>
                  {/* <Link
                    to="/session/signup"
                    className="btn btn-rounded btn-outline-primary btn-outline-email btn-block btn-icon-text"
                  >
                    <i className="i-Mail-with-At-Sign"></i> Sign up with Email
                  </Link>

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
  user: state.user,
  isSubmitting: state.isSubmitting
});

export default connect(mapStateToProps, {
  loginWithEmailAndPassword
})(Signin);
