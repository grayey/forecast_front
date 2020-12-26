import { lazy } from "react";
import { authRoles } from "app/auth/authRoles";

import { ADMINISTRATION } from "app/appConstants";
const Approvals = lazy(() => import("./approvalsList"));


const approvalsRoutes = [
  {
    exact:true,
    path: "/admin/approvals",
    component: Approvals,
    auth: ADMINISTRATION.Approval_Settings
  }

];

export default approvalsRoutes;
