import axios from "axios";
import localStorageService from "./localStorageService";
import * as apiService  from "./apiService";
import jwt_decode from "jwt-decode";

class JwtAuthService {

  user = {
    userId: "1",
    role: 'ADMIN',
    displayName: "Watson Joyce",
    email: "watsonjoyce@gmail.com",
    photoURL: "/assets/images/face-7.jpg",
    age: 25,
    token: "faslkhfh423oiu4h4kj432rkj23h432u49ufjaklj423h4jkhkjh"
  }



  loginWithToken = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(this.user);
      }, 100);
    }).then(data => {
      this.setSession(data.token);
      this.setUser(data);
      return data;
    });
  };



  logout = () => {
    this.setSession(null);
    this.removeUser();
  }


  // MAIN LOGIN METHOD
  //
   app_login =  (data) => {
     const url = 'token-jwt/';
    // const url = 'users/auth_login/';
    return apiService.post(url, data);
  }

  loginWithEmailAndPassword = (email, password) => {
    const loginData = { username:email, password };
    return this.app_login(loginData).then(data => {
      console.log("Login response dtat", data)
      const { access, refresh } = data;
      this.setSession(access);
      // this.setUser(data);
      return access;
    }).catch(error =>{
      throw error;
    });
  };

  decode_token = (token) =>{
    return jwt_decode(token);
  }

  setSession = token => {
    if (token) {
      localStorage.setItem("bms_user_token", token);
      axios.defaults.headers.common["Authorization"] = "Token " + token;
      return;
    }
      localStorage.clear();
      delete axios.defaults.headers.common["Authorization"];
  };



  setUserTasks = (userTasks) => {
    localStorageService.setItem("USER_TASKS", userTasks);
  }

  getUserTasks = () => {
    return localStorageService.getItem("USER_TASKS");
  }


  setUser = (user) => {
    localStorageService.setItem("bms_auth_user", user);
  }

  getUser = () => {
    return localStorageService.getItem("bms_auth_user");
  }
  removeUser = () => {
    localStorage.removeItem("bms_auth_user");
  }


  setAppSettings =  (appSettings) =>{
    localStorageService.setItem("app_settings",appSettings);

  }
  getAppSettings =  () =>{

    return localStorageService.getItem("app_settings");

  }

  setActiveDepartmentRole = (department) => {
    localStorageService.setItem("bms_user_active_department_role",department);
  }

  getActiveDepartmentRole = () => {
    return localStorageService.getItem("bms_user_active_department_role");
  }
  removeActiveDepartment = () => {
    localStorage.removeItem("bms_user_active_department_role");
  }


  setUserDepartmentRoles = (departmentRoles) => {
    localStorageService.setItem("bms_user_department_roles", departmentRoles);
  }
  getUserDepartmentRoles = () => {
    return localStorageService.getItem("bms_user_department_roles");
  }
  removeUserDepartmentRoles = () => {
    localStorage.removeItem("bms_user_department_roles");
  }



}

export default new JwtAuthService();
