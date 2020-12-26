
export const DASHBOARD = ["Dashboard_V1"];

export const PREPARATION = {
    "Default":[
        "CAN_VIEW_ALL",
        "CAN_CREATE",
        "CAN_EDIT",
        "CAN_VIEW_DETAIL",
        "CAN_SUBMIT",
        "CAN_VIEW_HISTORY",
        "CAN_IMPORT_PREVIOUS_ENTRIES",
        "CAN_BULK_UPLOAD_ENTRIES"
    ]
};


export const PROCESSING = {
    "Budget_Cycles":[
        "CAN_VIEW_ALL",
        "CAN_CREATE",
        "CAN_EDIT",
        "CAN_ENABLE_NEW_VERSION",
        "CAN_TOGGLE_STATUS"

    ],
    "Budget_Versions":[
        "CAN_VIEW_ALL",
        "CAN_VIEW_DETAIL",
        "CAN_TOGGLE_CAPTURE",
        "CAN_ARCHIVE_VERSION",
    ]
};

export const REVIEW = {
   "Default":[
    "CAN_VIEW_ALL",
    "CAN_APPROVE_OR_REJECT"
   ]
};


export const REPORTS = {
    "Consolidated_View":[
        "CAN_VIEW_ALL"
    ],
    "Departmental_View":[
        "CAN_VIEW_ALL",
        "CAN_EXPORT"
    ]
};


export const ADMINISTRATION = {
    "Users":[
        "CAN_VIEW_ALL",
        "CAN_CREATE",
        "CAN_EDIT",
        "CAN_DELETE",
        "CAN_TOGGLE_STATUS"
    ],
    "Departments":[
        "CAN_VIEW_ALL",
        "CAN_CREATE",
        "CAN_EDIT",
        "CAN_TOGGLE_STATUS"
    ],
    "Entry_Types":[
        "CAN_VIEW_ALL",
        "CAN_CREATE",
        "CAN_TOGGLE_STATUS"
    ],
    "Roles":[
        "CAN_VIEW_ALL",
        "CAN_CREATE",
        "CAN_EDIT",
        "CAN_VIEW_DETAIL",
        "CAN_ASSIGN_TASKS"
    ],
    "Budget_Items":{
        "Item_Categories":[
        "CAN_VIEW_ALL",
        "CAN_CREATE",
        "CAN_EDIT"
        ],
        "Cost_Items":[
        "CAN_VIEW_ALL",
        "CAN_CREATE",
        "CAN_EDIT"
        ],
        "Department-Items_Mapping":[
        "CAN_VIEW_ALL",
        "CAN_ASSIGN"
        ]
    },
    "Versioning":[
        "CAN_VIEW_ALL",
        "CAN_CREATE",
        "CAN_EDIT"
    ],
    "Approval_Settings":[
        "CAN_VIEW_ALL",
        "CAN_CREATE",
        "CAN_EDIT",
        "CAN_REARRANGE"
    ],
    "Email_Templates":[
        "CAN_VIEW_ALL",
        "CAN_CREATE",
        "CAN_EDIT",
        "CAN_DELETE",
    ],
    "Tasks":[
      "CAN_VIEW_ALL",
      "CAN_GENERATE",

    ]
  };

  // OTHER CONSTANTS

  export const VIEW_FORBIDDEN = 'VIEW_FORBIDDEN';
