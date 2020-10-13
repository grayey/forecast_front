import { lazy } from "react";
import { authRoles } from "app/auth/authRoles";

const Departments = lazy(() => import("./DepartmentsComponent"));


const departmentRoutes = [
  {
    path: "/dashboard/departments",
    component: Departments,
  }

];

export default departmentRoutes;
