import { lazy } from "react";
import { authRoles } from "app/auth/authRoles";
import { PREPARATION } from "app/appConstants";

const AggregateEntriesRoute = lazy(() => import("./budgetentries/aggregateList"));
const BudgetEntriesRoute = lazy(() => import("./budgetentries/createEntries"));
const ListEntriesDetailsRoute = lazy(()=>import("./budgetentries/listEntries"));


const PreparationRoutes = [
  {
    exact:true,
    path: "/preparation/budget-entries",
    component: AggregateEntriesRoute,
    auth:PREPARATION.Default
  },
  {
    exact:true,
    path: "/preparation/budget-entries/create",
    component: BudgetEntriesRoute,
    auth:PREPARATION.Default

  },
  {
    exact:true,
    path: "/preparation/budget-entries/:slug",
    component: ListEntriesDetailsRoute,
    auth:PREPARATION.Default
  },



];

export default PreparationRoutes;
