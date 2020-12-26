import { lazy } from "react";
import { authRoles } from "app/auth/authRoles";

import { ADMINISTRATION } from "app/appConstants";


const Users = lazy(() => import("./UsersComponent"));


const usersRoutes = [
  {
    exact:true,
    path: "/admin/users",
    component: Users,
    auth:ADMINISTRATION.Users
  }

];

export default usersRoutes;
