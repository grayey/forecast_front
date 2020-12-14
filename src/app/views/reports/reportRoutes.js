import { lazy } from "react";
import { authRoles } from "app/auth/authRoles";

const AnalyticsPlaygroundRoute = lazy(() => import("./analyticsPlayground"));
const ConsolidatedBudgetRoute = lazy(() => import("./consolidatedBudget"));
const DepartmentalOverviewRoute = lazy(() => import("./departmentalOverview"));



const ReportsRoutes = [
  {
    path: "/reports/analytics-playground",
    component: AnalyticsPlaygroundRoute,
  },

  {
    exact:true,
    path: "/reports/consolidated-view",
    component: ConsolidatedBudgetRoute,
  },
  {
    exact:true,
    path: "/reports/by-departments",
    component: DepartmentalOverviewRoute,
  },
];

export default ReportsRoutes;
