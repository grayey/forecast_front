import { lazy } from "react";
import { authRoles } from "app/auth/authRoles";

const Roles = lazy(() => import("./RolesComponent"));


const rolesRoutes = [
  {
    path: "/admin/roles",
    component: Roles,
  }

];

export default rolesRoutes;
