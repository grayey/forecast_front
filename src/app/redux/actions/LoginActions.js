import jwtAuthService from "../../services/jwtAuthService";
import FirebaseAuthService from "../../services/firebase/firebaseAuthService";
import AppMainService from "../../services/appMainService";
import { setUserData } from "./UserActions";
import history from "@history.js";

import * as utils from "@utils";
import AppNotification from "../../appNotifications";

export const LOGIN_ERROR = "LOGIN_ERROR";
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGIN_LOADING = "LOGIN_LOADING";
export const RESET_PASSWORD = "RESET_PASSWORD";

export function loginWithEmailAndPassword({ email, password }) {
  return dispatch => {
    dispatch({
      type: LOGIN_LOADING
    });

    jwtAuthService.loginWithEmailAndPassword(email, password).then(
      async (user_access) => {
        await forwardUserIntoApp(user_access);
        // return dispatch({
        //   type: LOGIN_SUCCESS
        // });
      })
      .catch(error => {
        new AppNotification({
          type:"error",
          msg:utils.processErrors(error)
        })
        return dispatch({
          type: LOGIN_ERROR,
          payload: error
        });
      });
  };
}

export async  function forwardUserIntoApp(user_access){
  const { user_id } = jwtAuthService.decode_token(user_access);
  let pathname = "/user-departments";
  let activeUser = null;
  let activeDepartmentRole = null;
  let userDepartmentRoles = [];

  const appMainService = new AppMainService();
  await appMainService.getUserLoginInfo(user_id).then(
    (loginInfoResponse)=>{
      const { department_roles, profile } = loginInfoResponse;
      activeUser = profile.user;
      userDepartmentRoles = department_roles.map((dr)=>{
        dr.userprofile = undefined; // delete userprofile from department_role
        return dr;
      })
      if(userDepartmentRoles.length == 1){ // user belongs to just one department
        pathname = '/dashboard/v1';
        activeDepartmentRole = userDepartmentRoles[0]; // user's active department is his first (and only) department
      }

    }).catch((error)=>{
       pathname = "/";
       new AppNotification({
         type:"warning",
         msg:"Could not determine your login information. Please contact admin."
       })
       throw error;
  });

  //

 // dispatch(setUserData(activeUser));
 jwtAuthService.setUser(activeUser);
 jwtAuthService.setActiveDepartmentRole(activeDepartmentRole);
 jwtAuthService.setUserDepartmentRoles(userDepartmentRoles);

 history.push({ pathname });

}

export function resetPassword({ email }) {
  return dispatch => {
    dispatch({
      payload: email,
      type: RESET_PASSWORD
    });
  };
}

export function firebaseLoginEmailPassword({ email, password }) {
  return dispatch => {
    FirebaseAuthService.signInWithEmailAndPassword(email, password)
      .then(user => {
        if (user) {
          dispatch(
            setUserData({
              userId: "1",
              role: "ADMIN",
              displayName: "Watson Joyce",
              email: "watsonjoyce@gmail.com",
              photoURL: "/assets/images/face-7.jpg",
              age: 25,
              token: "faslkhfh423oiu4h4kj432rkj23h432u49ufjaklj423h4jkhkjh",
              ...user
            })
          );

          history.push({
            pathname: "/"
          });

          return dispatch({
            type: LOGIN_SUCCESS
          });
        } else {
          return dispatch({
            type: LOGIN_ERROR,
            payload: "Login Failed"
          });
        }
      })
      .catch(error => {
        return dispatch({
          type: LOGIN_ERROR,
          payload: error
        });
      });
  };
}
