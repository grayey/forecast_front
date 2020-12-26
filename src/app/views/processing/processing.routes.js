import { lazy } from "react";
import { authRoles } from "app/auth/authRoles";
import { PROCESSING } from "app/appConstants";


const BudgetCycleRoute = lazy(() => import("./budgetcycles/budgetcycles.component"));
const BudgetVersionRoute = lazy(() => import("./budgetversions/budgetversions.component"));
const BudgetVersionDetailRoute = lazy(() => import("./budgetversions/budgetversiondetail.component"));



const ProcessingRoutes = [
  {
    exact:true,
    path: "/processing/budget-cycles",
    component: BudgetCycleRoute,
    auth:PROCESSING.Budget_Cycles
  },

  {
    exact:true,
    path: "/processing/budget-versions",
    component: BudgetVersionRoute,
    auth:PROCESSING.Budget_Versions
  },
  {
    exact:true,
    path: "/processing/budget-versions/:slug",
    component: BudgetVersionDetailRoute,
    auth:PROCESSING.Budget_Versions

  },
];

export default ProcessingRoutes;
