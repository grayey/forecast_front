
import jwtAuthService from "./services/jwtAuthService";
import TaskIcons from "./appWidgets";

const activeBudgetCycle = JSON.parse(localStorage.getItem('ACTIVE_BUDGET_CYCLE'));
const activeDepartmentRole = jwtAuthService.getActiveDepartmentRole();
const userTasks = jwtAuthService.getUserTasks() || [];
const ACTIVE_USER = jwtAuthService.getUser() || {};
const dashboard = [{
  name: "Dashboard",
  description: "Lorem ipsum dolor sit.",
  type: "link",
  icon: "i-Bar-Chart",
  path: "/dashboard",
  // sub: [
  //   {
  //     icon: "i-Clock-3",
  //     name: "Version 1",
  //     path: "/dashboard",
  //     type: "link"
  //   },
  //   {
  //     icon: "i-Clock-4",
  //     name: "Version 2",
  //     path: "/dashboard/v2",
  //     type: "link"
  //   }
  // ]
}]

const { department, role } = activeDepartmentRole || { department:{}, role:{} };
const { active_version } = activeBudgetCycle || {};
const approval_path = role.name ? role.name.toLowerCase().split(' ').join('') + '-approval':"";
if(role.name && role.name.split(' ').length > 1){
  let pseudo_name = '';
  role.name.split(' ').forEach((word)=>{
    pseudo_name+=word[0].toUpperCase();
  })
  role.name = pseudo_name;
}

// console.log("Navigationsss", userTasks)



export const navigations = () =>{
  const dummy = dummyMenu();

  const sideBarNavigations = [];
  if(ACTIVE_USER.is_superuser){
    const mainMenu = Object.keys(AppMenu).map(key => AppMenu[key]).concat(dummy);
    return dashboard.concat(mainMenu)
  }
  let module_names = [];
  let views = [];
  userTasks.forEach((userTask) =>{
    const full_link = userTask.split('___'); //three undersores
    const module_name  = full_link[0];
    // console.log(`Splitting ${full_link[1]}`, full_link[1].split('__'))
    let view = full_link[1].split('__')[0];  //two undersores

    module_names.push(module_name);
    views.push(view);


  })
  module_names = new Set(module_names);
  for(const m_ of module_names){
    const  app_menu = AppMenu[m_] || {};
    const { sub } = app_menu;
    if(sub){
      sub.forEach((inner_link, i_index)=>{
        const link = `${inner_link.view_name}`;
        // console.log('LINKED IN...', link);
        if(!views.includes(link)){
          sub.splice(i_index, 1);
        }
      })
      if(!sub.length){
          app_menu.sub = undefined; //delete the sub. redundant anyway
          app_menu.type = 'link;' // so that it will not open an empty drawer
      }

    }

    if(app_menu){
      sideBarNavigations.push(app_menu)
    }

  }
  // console.log('module_names NAVIGATIONS',module_names)
  return dashboard.concat(sideBarNavigations.concat(dummy));

}

export const AppMenu = {
  // "Dashboard":{
  //   name: "Dashboard",
  //   description: "Lorem ipsum dolor sit.",
  //   type: "dropDown",
  //   icon: "i-Bar-Chart",
  //   sub: [
  //     {
  //       icon: "i-Clock-3",
  //       name: "Version 1",
  //       path: "/dashboard",
  //       type: "link"
  //     },
  //     {
  //       icon: "i-Clock-4",
  //       name: "Version 2",
  //       path: "/dashboard/v2",
  //       type: "link"
  //     }
  //   ]
  // },
  "Preparation":{
    name: "Preparation",
    description: "Budget entries & aggregates",
    type: "link",
    icon: "i-Computer-Secure",
    path: "/preparation/budget-entries",
  },

  "Processing":  {
      name: "Processing",
      description: "Budget cycles & Versions",
      type: "dropDown",
      icon: "i-Computer-Secure",

      sub: [
        { icon: "i-Email", name: "Budget Cycles", path: "/processing/budget-cycles", type: "link", view_name:"Budget_Cycles" },
        { icon: "i-Speach-Bubble-3", name: "Budget Versions", path:"/processing/budget-versions", type: "link",  view_name:"Budget_Versions"},
      ]
    },
    "Review":  {
        name: "Review",
        description: "Budget approvals & task delegation",
        type: "link",
        icon: "i-Computer-Secure",
        pseudo_info:`${role.name} Approval`,
        path: `/review/${approval_path}`,
        // sub: [
        //   { icon: "i-Email", name: `${role.name} Approval`, path: `/review/${approval_path}`, type: "link", view_name:"Default" },
        //   { icon: "i-Speach-Bubble-3", name: "Delegate task", path: "/chat", type: "link" },
        // ]
      },
      "Reports":{
        name: "Reports",
        description: "Lorem ipsum dolor sit.",
        type: "dropDown",
        icon: "i-Bar-Chart",
        sub: [
          {
            icon: "i-Clock-3",
            name: "Consolidated View",
            path: "/reports/consolidated-view",
            type: "link",
            view_name:"Consolidated_View"
          },
          {
            icon: "i-Clock-3",
            name: "Departmental overview",
            path:"/reports/by-departments",
            type: "link",
            view_name:"Departmental_View"

          },
          {
            icon: "i-Clock-3",
            name: "Audit trail",
            path: "/reports/analytics-playground",
            type: "link",
            view_name:"Audit_Trail"

          },
        ]
      },
      "Administration":  {
          name: "Administration",
          description: "Configure system roles, approvals' heirarchy",
          type: "dropDown",
          icon: "i-Bar-Chart",
          sub: [
            {
              icon: "i-Clock-3",
              name: "Users",
              path: "/admin/users",
              type: "link",
              view_name:"Users"

            },
            {
              icon: "i-Clock-3",
              name: "Departments",
              path: "/admin/departments",
              type: "link",
              view_name:"Departments"

            },

            {
              icon: "i-Clock-3",
              name: "Entry Types",
              path: "/admin/entry-types",
              type: "link",
              view_name:"Entry_Types"

            },

            {
              icon: "i-Clock-3",
              name: "Roles",
              path: "/admin/roles",
              type: "link",
              view_name:"Roles"

            },
            {
              icon: "i-Clock-3",
              name: "Budget items",
              type: "dropDown",
              sub:[
                {
                  icon: "i-Clock-3",
                  name: "Item categories",
                  path: "/admin/item-categories",
                  type: "link",
                  view_name:"Roles"

                },
                {
                  icon: "i-Clock-3",
                  name: "Cost items",
                  path: "/admin/cost-items",
                  type: "link"
                },
                {
                  icon: "i-Clock-3",
                  name: "Department-items mapping",
                  path: "/admin/department-items-mapping",
                  type: "link"
                },


              ]
            },
            {
              icon: "i-Clock-3",
              name: "Versioning",
              path: "/admin/versioning",
              type: "link",
              view_name:"Versioning"


            },
            {
              icon: "i-Clock-3",
              name: "Approval settings",
              path: "/admin/approvals",
              type: "link",
              view_name:"Approval_Settings"

            },
            {
              icon: "i-Clock-3",
              name: "Email templates",
              path: "/admin/email-templates",
              type: "link",
              view_name:"Email_Templates"

            },
            {
              icon: "i-Clock-3",
              name: "System tasks",
              path: "/admin/system-tasks",
              type: "link",
              view_name:"Tasks"

            },
          ]
        },

}

export const dummyMenu =  () => {

return [
    {
      name: "Integrations",
      description: "3rd-party integrations",
      type: "dropDown",
      icon: "i-Bar-Chart",
      sub: [
        {
          icon: "i-Clock-3",
          name: "User Authentication",
          description: "Application database(default) or Active Directory ",
          path: "/integration/user-authentication",
          type: "link"
        },
        {
          icon: "i-Clock-3",
          name: "Accounting systems",
          path: "/integrations/accounting-systems",
          type: "link"
          // sub:[
          //   {
          //     icon: "i-Clock-3",
          //     name: "QuickBooks",
          //     path: "/dashboard/roles",
          //     type: "link"
          //   },
          //   {
          //     icon: "i-Clock-3",
          //     name: "Odoo",
          //     path: "/dashboard/roles",
          //     type: "link"
          //   },
          //   {
          //     icon: "i-Clock-3",
          //     name: "Sun system",
          //     path: "/dashboard/roles",
          //     type: "link"
          //   },
          //   {
          //     icon: "i-Clock-3",
          //     name: "Sage",
          //     path: "/dashboard/roles",
          //     type: "link"
          //   },
          //   {
          //     icon: "i-Clock-3",
          //     name: "Xero",
          //     path: "/dashboard/roles",
          //     type: "link"
          //   },
          //   {
          //     icon: "i-Clock-3",
          //     name: "Open ERP",
          //     path: "/dashboard/roles",
          //     type: "link"
          //   },
          // ]
        },
      ]
    },

    {
      name: "UI kits",
      description: "Lorem ipsum dolor sit.",
      type: "dropDown",
      icon: "i-Library",
      sub: [
        { icon: "i-Bell", name: "Alerts", path: "/uikits/alerts", type: "link" },
        {
          icon: "i-Split-Horizontal-2-Window",
          name: "Accordions",
          path: "/uikits/accordions",
          type: "link"
        },
        {
          icon: "i-Medal-2",
          name: "Badges",
          path: "/uikits/badges",
          type: "link"
        },
        {
          icon: "i-Arrow-Right-in-Circle",
          name: "Buttons",
          path: "/uikits/buttons",
          type: "link"
        },
        {
          icon: "i-One-Window",
          name: "Tabs",
          path: "/uikits/tabs",
          type: "link"
        },
        { icon: "i-ID-Card", name: "Cards", path: "/uikits/cards", type: "link" },
        {
          icon: "i-Line-Chart-2",
          name: "Cards metrics",
          path: "/uikits/cards-metrics",
          type: "link"
        },
        {
          icon: "i-Film-Video",
          name: "Carousel",
          path: "/uikits/carousel",
          type: "link"
        },
        {
          icon: "i-Film-Video",
          name: "Collapsibles",
          path: "/uikits/collapsibles",
          type: "link"
        },
        {
          icon: "i-Belt-3",
          name: "Lists",
          path: "/uikits/lists",
          type: "link"
        },
        {
          icon: "i-Arrow-Next",
          name: "Pagination",
          path: "/uikits/paginations",
          type: "link"
        },
        {
          icon: "i-Speach-Bubble-3",
          name: "Popover",
          path: "/uikits/popover",
          type: "link"
        },
        {
          icon: "i-Loading",
          name: "Progress Bar",
          path: "/uikits/progressbar",
          type: "link"
        },
        {
          icon: "i-File-Horizontal-Text",
          name: "Tables",
          path: "/uikits/tables",
          type: "link"
        },
        {
          icon: "i-Duplicate-Window",
          name: "Modals",
          path: "/uikits/modals",
          type: "link"
        },
        {
          icon: "i-Width-Window",
          name: "Sliders",
          path: "/uikits/sliders",
          type: "link"
        },
        {
          icon: "i-Credit-Card",
          name: "Cards widget",
          path: "/uikits/cards-widget",
          type: "link"
        },
        {
          icon: "i-Full-Cart",
          name: "Cards ecommerce",
          path: "/uikits/cards-ecommerce",
          type: "link"
        },
        {
          icon: "i-Duplicate-Window",
          name: "Modals",
          path: "/uikits/modals",
          type: "link"
        },
        {
          icon: "i-Speach-Bubble-3",
          name: "Popover",
          path: "/uikits/popover",
          type: "link"
        },
        {
          icon: "i-Speach-Bubble-8",
          name: "Tooltip",
          path: "/uikits/tooltip",
          type: "link"
        },
        { icon: "i-Like", name: "Rating", path: "/uikits/rating", type: "link" },
        {
          icon: "i-Loading-3",
          name: "Loaders",
          path: "/uikits/loaders",
          type: "link"
        }
      ]
    },
    {
      name: "Extra Kits",
      description: "Lorem ipsum dolor sit.",
      type: "dropDown",
      icon: "nav-icon i-Suitcase",
      sub: [
        {
          icon: "i-Arrow-Down-in-Circle",
          name: "Dropdown",
          path: "/extra-kits/dropdown",
          type: "link"
        },
        {
          icon: "i-Crop-2",
          name: "Image Cropper",
          path: "/extra-kits/image-cropper",
          type: "link"
        },
        {
          icon: "nav-icon i-Loading-3",
          name: "Ladda Buttons",
          path: "/extra-kits/loaders",
          type: "link"
        },
        {
          icon: "i-Sand-watch-2",
          name: "Ladda Buttons",
          path: "/extra-kits/ladda-buttons",
          type: "link"
        },
        {
          icon: "i-Bell",
          name: "Toastr",
          path: "/extra-kits/toastr",
          type: "link"
        },
        {
          icon: "i-Christmas-Bell",
          name: "Sweet Alert",
          path: "/extra-kits/sweet-alert",
          type: "link"
        },
        {
          icon: "i-Plane",
          name: "User Tour",
          path: "/extra-kits/user-tour",
          type: "link"
        },
        {
          icon: "i-Upload",
          name: "Upload",
          path: "/extra-kits/upload",
          type: "link"
        }
      ]
    },
    {
      name: "Apps",
      description: "Lorem ipsum dolor sit.",
      type: "dropDown",
      icon: "i-Computer-Secure",

      sub: [
        {
          icon: "i-Add-File",
          name: "Invoice Builder",
          type: "dropDown",
          sub: [
            {
              icon: "i-Receipt-4",
              name: "Invoice List",
              path: "/invoice/list"
            },
            {
              icon: "i-Receipt-4",
              name: "Create Invoice",
              path: "/invoice/create"
            }
          ]
        },
        { icon: "i-Email", name: "Inbox", path: "/inbox", type: "link" },
        { icon: "i-Speach-Bubble-3", name: "Chat", path: "/chat", type: "link" },
        { icon: "i-Calendar", name: "Calendar", path: "/calendar", type: "link" },
        {
          icon: "i-Receipt",
          name: "Task Manager",
          type: "dropdown",
          sub: [
            {
              icon: "i-Receipt",
              name: "Task Manager",
              type: "link",
              path: "/task-manager"
            },
            {
              icon: "i-Receipt",
              name: "Task Manager",
              type: "link",
              path: "/todo/list"
            },
            {
              icon: "i-Receipt",
              name: "Task Manager List",
              type: "link",
              path: "/task-manager-list"
            }
          ]
        },
        {
          icon: "i-Cash-Register",
          name: "Ecommerce",
          type: "dropDown",
          sub: [
            {
              icon: "i-Receipt",
              name: "Products",
              type: "link",
              path: "/ecommerce/products"
            },
            {
              icon: "i-Cash-register-2",
              name: "Product Details",
              type: "link",
              path: "/ecommerce/product-details"
            },
            {
              icon: "i-Cart-Quantity",
              name: "Cart",
              type: "link",
              path: "/ecommerce/cart"
            },
            {
              icon: "i-Checkout",
              name: "Checkout",
              type: "link",
              path: "/ecommerce/checkout"
            }
          ]
        },
        {
          icon: "i-Address-Book",
          name: "Contact",
          type: "dropDown",
          sub: [
            {
              icon: "i-Business-Mens",
              name: "Contact Table",
              type: "link",
              path: "/contact/table"
            },
            {
              icon: "i-Business-Mens",
              name: "Contact List",
              type: "link",
              path: "/contact/list"
            },

            {
              icon: "i-Find-User",
              name: "Contact Details",
              type: "link",
              path: "/contact/details"
            }
          ]
        },
        { icon: "i-Calendar", name: "Calendar", path: "/calendar", type: "link" }
      ]
    },
    {
      name: "Sessions",
      description: "Lorem ipsum dolor sit.",
      type: "dropDown",
      icon: "nav-icon i-Administrator",
      sub: [
        {
          icon: "i-Checked-User",
          name: "Signin",
          path: "/session/signin",
          type: "link"
        },
        {
          icon: "i-Add-User",
          name: "Signup",
          path: "/session/signup",
          type: "link"
        },
        {
          icon: "i-Find-User",
          name: "Forgot Password",
          path: "/session/forgot-password",
          type: "link"
        },
        {
          icon: "i-Error-404-Window",
          name: "Error 404",
          path: "/session/404",
          type: "link"
        }
      ]
    },
    {
      name: "Forms",
      description: "Lorem ipsum dolor sit.",
      type: "dropDown",
      icon: "i-File-Clipboard-File--Text",
      sub: [
        {
          icon: "i-File-Clipboard-Text--Image",
          name: "Basic components",
          path: "/forms/basic",
          type: "link"
        },
        {
          icon: "i-File-Clipboard-Text--Image",
          name: "Action Bar Form",
          path: "/forms/action-bar",
          type: "link"
        },
        {
          icon: "i-Split-Vertical",
          name: "Form layouts",
          path: "/forms/layouts",
          type: "link"
        },
        {
          icon: "i-Split-Vertical",
          name: "Multi Column Forms",
          path: "/forms/multi-column-forms",
          type: "link"
        },
        {
          icon: "i-Receipt-4",
          name: "Input Group",
          path: "/forms/input-group",
          type: "link"
        },
        {
          icon: "i-File-Edit",
          name: "Form Validation",
          path: "/forms/form-validation",
          type: "link"
        },
        {
          icon: "i-Tag-2",
          name: "Tag Input",
          path: "/forms/tag-input",
          type: "link"
        },
        {
          icon: "i-Width-Window",
          name: "Wizard",
          path: "/forms/forms-wizard",
          type: "link"
        },
        {
          icon: "i-Crop-2",
          name: "Rich Editor",
          path: "/forms/form-editor",
          type: "link"
        }
      ]
    },
    {
      name: "Widgets",
      description: "Lorem ipsum dolor sit.",
      type: "dropDown",
      icon: "i-Windows-2",
      sub: [
        {
          icon: "i-Receipt-4",
          name: "Card",
          path: "/widgets/card",
          type: "link"
        },
        {
          icon: "i-Receipt-4",
          name: "Statistics",
          path: "/widgets/statistics",
          type: "link"
        },
        {
          icon: "i-Receipt-4",
          name: "List",
          path: "/widgets/list",
          type: "link"
        },
        {
          icon: "i-Receipt-4",
          name: "App",
          path: "/widgets/app",
          type: "link"
        },
        {
          icon: "i-Receipt-4",
          name: "Weather App",
          path: "/widgets/weather-app",
          type: "link"
        }
      ]
    },
    {
      name: "Charts",
      description: "Lorem ipsum dolor sit.",
      type: "dropDown",
      icon: "i-Bar-Chart",
      sub: [
        {
          icon: "i-Bar-Chart-2",
          name: "Echart",
          path: "/charts/echart",
          type: "link"
        },
        {
          icon: "i-Bar-Chart-3",
          name: "Victory",
          path: "/charts/victory-chart",
          type: "link"
        },
        {
          icon: "i-Bar-Chart-4",
          name: "Apex",
          type: "dropDown",
          sub: [
            {
              icon: "i-Bar-Chart-4",
              name: "Area Charts",
              path: "/charts/apex-chart/area",
              type: "link"
            },
            {
              icon: "i-Bar-Chart-4",
              name: "Bar Charts",
              path: "/charts/apex-chart/bar",
              type: "link"
            },
            {
              icon: "i-Bar-Chart-4",
              name: "Bubble Charts",
              path: "/charts/apex-chart/bubble",
              type: "link"
            },
            {
              icon: "i-Bar-Chart-4",
              name: "Column Charts",
              path: "/charts/apex-chart/column",
              type: "link"
            },
            {
              icon: "i-Bar-Chart-4",
              name: "Doughnut Charts",
              path: "/charts/apex-chart/doughnut",
              type: "link"
            },
            {
              icon: "i-Bar-Chart-4",
              name: "Line Charts",
              path: "/charts/apex-chart/line",
              type: "link"
            },
            {
              icon: "i-Bar-Chart-4",
              name: "Mix Charts",
              path: "/charts/apex-chart/mix",
              type: "link"
            },
            {
              icon: "i-Bar-Chart-4",
              name: "Radial Bar Charts",
              path: "/charts/apex-chart/radial-bar",
              type: "link"
            },
            {
              icon: "i-Bar-Chart-4",
              name: "Radar Charts",
              path: "/charts/apex-chart/radar",
              type: "link"
            },
            {
              icon: "i-Bar-Chart-4",
              name: "Scatter Charts",
              path: "/charts/apex-chart/scatter",
              type: "link"
            },
            {
              icon: "i-Bar-Chart-4",
              name: "Spark Line Charts",
              path: "/charts/apex-chart/spark-line",
              type: "link"
            }
          ]
        },
        {
          icon: "i-Bar-Chart-2",
          name: "React Vis",
          path: "/charts/react-vis",
          type: "link"
        },
        {
          icon: "i-Bar-Chart-3",
          name: "Rechart",
          path: "/charts/recharts",
          type: "link"
        }
      ]
    },
    {
      name: "Data Tables",
      description: "Lorem ipsum dolor sit.",
      type: "dropDown",
      icon: "i-File-Horizontal-Text",
      sub: [
        {
          icon: "i-File-Horizontal-Text",
          name: "Basic",
          path: "/data-table/basic",
          type: "link"
        },
        {
          icon: "i-Full-View-Window",
          name: "Default Sorted",
          path: "/data-table/default-sorted",
          type: "link"
        },
        {
          icon: "i-Filter-2",
          name: "Multi Column Ordering",
          path: "/data-table/multi-column-ordering",
          type: "link"
        },
        {
          icon: "i-Code-Window",
          name: "Search in Table",
          path: "/data-table/search",
          type: "link"
        },
        {
          icon: "i-Filter-2",
          name: "Cell Editor",
          path: "/data-table/cell-editor",
          type: "link"
        }
      ]
    },
    {
      name: "Sessions",
      description: "Lorem ipsum dolor sit.",
      type: "dropDown",
      icon: "i-Administrator",
      sub: [
        {
          icon: "i-Add-User",
          name: "Sign up",
          path: "/sessions/signup",
          type: "link"
        },
        {
          icon: "i-Checked-User",
          name: "Sign in",
          path: "/sessions/signin",
          type: "link"
        },
        {
          icon: "i-Find-User",
          name: "Forgot",
          path: "/sessions/forgot",
          type: "link"
        }
      ]
    },
    {
      name: "Pages",
      description: "Lorem ipsum dolor sit.",
      type: "dropDown",
      icon: "i-Windows-2",
      sub: [
        {
          icon: "i-Error-404-Window",
          name: "Not Found",
          path: "/sessions/404",
          type: "link"
        },
        {
          icon: "i-Billing",
          name: "Pricing Table",
          path: "/pages/pricing-table",
          type: "link"
        },
        {
          icon: "i-File-Search",
          name: "Search Results",
          path: "/pages/search-results",
          type: "link"
        },
        {
          icon: "i-Administrator",
          name: "User Profile",
          path: "/pages/user-profile",
          type: "link"
        },
        {
          icon: "i-Speach-Bubble-Asking",
          name: "FAQ",
          path: "/pages/faq",
          type: "link"
        },
        {
          icon: "i-File",
          name: "Blank Page",
          path: "/pages/blank-page",
          type: "link"
        }
      ]
    },
    {
      name: "Icons",
      description: "600+ premium icons",
      type: "link",
      icon: "i-Cloud-Sun",
      path: "/icons"
    },
    {
      name: "Others",
      description: "Lorem ipsum dolor sit.",
      type: "dropDown",
      icon: "i-Double-Tap",
      sub: [
        {
          icon: "i-Error-404-Window",
          name: "Not found",
          path: "/others/404",
          type: "link"
        }
      ]
    },
    {
      name: "Doc",
      type: "extLink",
      description: "Lorem ipsum dolor sit.",
      tooltip: "Documentation",
      icon: "i-Safe-Box1",
      path: "http://demos.ui-lib.com/gull-react-doc"
    }
  ];

}
