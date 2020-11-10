import { lazy } from "react";
import { authRoles } from "app/auth/authRoles";

const IndexRoute = lazy(() => import("./indexComponent"));
const DepartmentApprovalRoute = lazy(() => import("./departmentApproval"));



const ReviewRoutes = [
  {
    exact:true,
    path: "/review/:approval",
    component: IndexRoute,
  },
  {
    exact:true,
    path: "/review/:approval/:departmentSlug",
    component: DepartmentApprovalRoute,
  },

];

export default ReviewRoutes;
