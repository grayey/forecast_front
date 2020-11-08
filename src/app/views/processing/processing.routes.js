import { lazy } from "react";
import { authRoles } from "app/auth/authRoles";

const BudgetCycleRoute = lazy(() => import("./budgetcycles/budgetcycles.component"));
const BudgetVersionRoute = lazy(() => import("./budgetversions/budgetversions.component"));
const BudgetVersionDetailRoute = lazy(() => import("./budgetversions/budgetversiondetail.component"));



const ProcessingRutes = [
  {
    path: "/processing/budget-cycles",
    component: BudgetCycleRoute,
  },

  {
    exact:true,
    path: "/processing/budget-versions",
    component: BudgetVersionRoute,
  },
  {
    exact:true,
    path: "/processing/budget-versions/:slug",
    component: BudgetVersionDetailRoute,
  },
];

export default ProcessingRutes;
