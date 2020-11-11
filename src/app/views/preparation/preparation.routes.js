import { lazy } from "react";
import { authRoles } from "app/auth/authRoles";

const AggregateEntriesRoute = lazy(() => import("./budgetentries/aggregateList"));
const BudgetEntriesRoute = lazy(() => import("./budgetentries/createEntries"));
const ListEntriesDetailsRoute = lazy(()=>import("./budgetentries/listEntries"));


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
  },
  {
    exact:true,
    path: "/preparation/budget-entries/:slug",
    component: ListEntriesDetailsRoute,
  },



];

export default PreparationRoutes;
