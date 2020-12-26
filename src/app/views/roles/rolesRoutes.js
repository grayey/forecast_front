import { lazy } from "react";
import { authRoles } from "app/auth/authRoles";

import { ADMINISTRATION } from "app/appConstants";


const Roles = lazy(() => import("./RolesComponent"));
const RoleDetailComponent = lazy(() => import("./RoleDetailComponent"));


const rolesRoutes = [
  {
    exact: true,
    path: "/admin/roles",
    component: Roles,
    auth:ADMINISTRATION.Roles
  },
  {
   exact: true,
   path:"/admin/roles/:slug",
   component:RoleDetailComponent,
   auth:ADMINISTRATION.Roles

 }

];

export default rolesRoutes;
