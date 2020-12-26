import { lazy } from "react";
import { authRoles } from "app/auth/authRoles";
import { ADMINISTRATION } from "app/appConstants";


const Departments = lazy(() => import("./DepartmentsComponent"));


const departmentRoutes = [
  {
    exact:true,
    path: "/admin/departments",
    component: Departments,
    auth:ADMINISTRATION.Departments
  }

];

export default departmentRoutes;
