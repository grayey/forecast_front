import { lazy } from "react";
import { authRoles } from "app/auth/authRoles";

const Approvals = lazy(() => import("./approvalsList"));


const approvalsRoutes = [
  {
    path: "/admin/approvals",
    component: Approvals,
  }

];

export default approvalsRoutes;
