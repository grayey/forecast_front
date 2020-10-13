import { lazy } from "react";
import { authRoles } from "app/auth/authRoles";

const BudgetCycleRoute = lazy(() => import("./budgetcycles/budgetcycles.component"));


const ProcessingRutes = [
  {
    path: "/processing/budget-cycles",
    component: BudgetCycleRoute,
  }

];

export default ProcessingRutes;
