import { lazy } from "react";
import { authRoles } from "app/auth/authRoles";
import { REPORTS } from "app/appConstants";


const AnalyticsPlaygroundRoute = lazy(() => import("./analyticsPlayground"));
const ConsolidatedBudgetRoute = lazy(() => import("./consolidatedBudget"));
const DepartmentalOverviewRoute = lazy(() => import("./departmentalOverview"));



const ReportsRoutes = [
  {
    exact:true,
    path: "/reports/analytics-playground",
    component: AnalyticsPlaygroundRoute,
  },

  {
    exact:true,
    path: "/reports/consolidated-view",
    component: ConsolidatedBudgetRoute,
    auth:REPORTS.Consolidated_View
  },
  {
    exact:true,
    path: "/reports/by-departments",
    component: DepartmentalOverviewRoute,
    auth:REPORTS.Departmental_View

  },
];

export default ReportsRoutes;
