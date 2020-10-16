import { lazy } from "react";
import { authRoles } from "app/auth/authRoles";

const AggregateEntriesRoute = lazy(() => import("./budgetentries/aggregateList"));
const BudgetEntriesRoute = lazy(() => import("./budgetentries/createEntries"));


const PreparationRoutes = [
  {
    exact:true,
    path: "/preparation/budget-entries",
    component: AggregateEntriesRoute,
  },
  {
    exact:true,
    path: "/preparation/budget-entries/create",
    component: BudgetEntriesRoute,
  }

];

export default PreparationRoutes;
