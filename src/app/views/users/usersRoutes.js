import { lazy } from "react";
import { authRoles } from "app/auth/authRoles";

import { ADMINISTRATION } from "app/appConstants";


const Users = lazy(() => import("./UsersComponent"));
const UserDetail = lazy(() => import("./UserDetailComponent"));


const usersRoutes = [
  {
    exact:true,
    path: "/admin/users",
    component: Users,
    auth:ADMINISTRATION.Users
  },
  {
    exact:true,
    path: "/dashboard/user-profile/:slug",
    component: UserDetail,
  },


];

export default usersRoutes;
