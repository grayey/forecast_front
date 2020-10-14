import { lazy } from "react";
import { authRoles } from "app/auth/authRoles";

const CostItems = lazy(() => import("./costitemsComponent"));


const costItemRoutes = [
  {
    path: "/admin/cost-items",
    component: CostItems,
  }

];

export default costItemRoutes;
