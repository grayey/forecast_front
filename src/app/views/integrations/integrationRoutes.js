import { lazy } from "react";
import { authRoles } from "app/auth/authRoles";

const AccountSystems = lazy(() => import("./accountSystems"));
// const DepartmentMapping = lazy(() => import("./departmentMapping"));


const integrationRoutes = [
  {
    path: "/integrations/accounting-systems",
    component: AccountSystems,
  },
  // {
  //   path: "/admin/department-items-mapping",
  //   component: DepartmentMapping,
  // },


];

export default integrationRoutes;
