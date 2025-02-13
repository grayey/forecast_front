import React from "react";
import { Redirect } from "react-router-dom";
import dashboardRoutes from "./views/dashboard/dashboardRoutes";
import uiKitsRoutes from "./views/ui-kits/uiKitsRoutes";
import formsRoutes from "./views/forms/formsRoutes";
import sessionsRoutes from "./views/sessions/sessionsRoutes";
import AuthGuard from "./auth/AuthGuard";
import widgetsRoute from "./views/widgets/widgetsRoute";
import chartsRoute from "./views/charts/chartsRoute";
import dataTableRoute from "./views/dataTable/dataTableRoute";
import extraKitsRoutes from "./views/extra-kits/extraKitsRoutes";
import pagesRoutes from "./views/pages/pagesRoutes";
import iconsRoutes from "./views/icons/iconsRoutes";
import invoiceRoutes from "./views/app/invoice/invoiceRoutes";
import inboxRoutes from "./views/app/inbox/inboxRoutes";
import chatRoutes from "./views/app/chat/chatRoutes";
import calendarRoutes from "./views/app/calendar/calendarRoutes";
import taskManagerRoutes from "./views/app/task-manager/taskManagerRoutes";
import ecommerceRoutes from "./views/app/ecommerce/ecommerceRoutes";
import contactRoutes from "./views/app/contact/contactRoutes";
import departmentRoutes from "./views/departments/departmentsRoute";
import rolesRoutes from "./views/roles/rolesRoutes";
import tasksRoutes from "./views/tasks/tasksRoutes";
import approvalsRoutes from "./views/approvals/approvalsRoutes";
import usersRoutes from "./views/users/usersRoutes";
import processingRoutes from "./views/processing/processing.routes";
import preparationRoutes from "./views/preparation/preparation.routes";
import itemCategoriesRoutes from "./views/itemcategories/itemCategoriesRoutes";
import costItemRoutes from "./views/costitems/costitemsRoutes";
import entityRoutes from "./views/entities/entitiesRoutes";
import versionCodesRoutes from "./views/versioncodes/versionCodesRoutes";
import reviewRoutes from "./views/review/reviewRoutes";
import reportRoutes from "./views/reports/reportRoutes";
import emailTemplatesRoutes from "./views/emailtemplates/emailTemplatesRoutes";
import integrationRoutes from "./views/integrations/integrationRoutes";








const redirectRoute = [
  {
    path: "/",
    exact: true,
    component: () => <Redirect to="/dashboard" />
  }
];

const errorRoute = [
  {
    component: () => <Redirect to="/session/404" />
  }
];

const routes = [
  ...sessionsRoutes,
  {
    path: "/",
    component: AuthGuard,
    routes: [
      ...dashboardRoutes,
      ...departmentRoutes,
      ...rolesRoutes,
      ...tasksRoutes,
      ...approvalsRoutes,
      ...usersRoutes,
      ...processingRoutes,
      ...preparationRoutes,
      ...itemCategoriesRoutes,
      ...emailTemplatesRoutes,
      ...costItemRoutes,
      ...entityRoutes,
      ...versionCodesRoutes,
      ...reviewRoutes,
      ...reportRoutes,
      ...integrationRoutes,
      ...uiKitsRoutes,
      ...formsRoutes,
      ...widgetsRoute,
      ...chartsRoute,
      ...dataTableRoute,
      ...extraKitsRoutes,
      ...pagesRoutes,
      ...iconsRoutes,
      ...invoiceRoutes,
      ...inboxRoutes,
      ...chatRoutes,
      ...taskManagerRoutes,
      ...calendarRoutes,
      ...ecommerceRoutes,
      ...contactRoutes,


      // Load these last
      ...redirectRoute,
      ...errorRoute,

    ]
  }
];

export default routes;
