import { lazy } from "react";

const Signup = lazy(() => import("./Signup"));

const Signin = lazy(() => import("./Signin"));

const ForgotPassword = lazy(() => import("./ForgotPassword"));

const ResetPassword = lazy(() => import("./ResetPassword"));

const Error404 = lazy(() => import("./Error"));

const UserDepartments = lazy(() => import("./UserDepartments"));


const sessionsRoutes = [
  {
    exact: true,
    path: "/",
    component: Signin
  },
  {
    exact: true,
    path:"/user-departments",
    component:UserDepartments
  },
  {
    exact: true,
    path: "/session/signup",
    component: Signup
  },
  {
    exact: true,
    path: "/forgot-password",
    component: ForgotPassword
  },
  {
    exact: true,
    path: "/reset-password",
    component: ResetPassword
  },
  {
    exact: true,
    path: "/404",
    component: Error404
  }
];

export default sessionsRoutes;
