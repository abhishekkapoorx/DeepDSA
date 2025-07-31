// Desktop FlexLayout configuration
export const desktopLayoutConfig = {
  global: {
    tabEnableClose: false,
    tabEnableFloat: false,
    tabEnableDrag: true,
    tabEnableRename: false,
    "splitterEnableHandle": true,
    "tabEnablePopout": false,
    "tabSetEnableActiveIcon": true,
    "borderMinSize": 500,
    "borderEnableTabScrollbar": true,
    "relativeTabSize": true,
  },
  borders: [],
  layout: {
    type: "row",
    weight: 100,
    children: [
      {
        type: "tabset",
        weight: 50,
        children: [
          {
            type: "tab",
            name: "Description",
            component: "description",
            id: "description",
          },
          {
            type: "tab",
            name: "Editorial",
            component: "editorial",
            id: "editorial",
          },
          {
            type: "tab",
            name: "Solutions",
            component: "solutions",
            id: "solutions",
          },
          {
            type: "tab",
            name: "Submissions",
            component: "submissions",
            id: "submissions",
          },
        ],
      },
      {
        type: "col",
        weight: 50,
        children: [
          {
            type: "tabset",
            weight: 50,
            children: [
              {
                type: "tab",
                name: "Code",
                component: "editor",
                id: "editor",
              },
              {
                type: "tab",
                name: "AI Interview",
                component: "ai-interview",
                id: "ai-interview",
              },
              {
                type: "tab",
                name: "Code Visualization",
                component: "code-visualization",
                id: "code-visualization",
              },
            ],
          },
          {
            type: "tabset",
            weight: 50,
            children: [
              {
                type: "tab",
                name: "Testcase",
                component: "testcase",
                id: "testcase",
              },
              {
                type: "tab",
                name: "Test Results",
                component: "test-results",
                id: "test-results",
              },
            ],
          },
        ],
      },
    ],
  },
};

// Mobile FlexLayout configuration
export const mobileLayoutConfig = {
  global: {
    tabEnableClose: false,
    tabEnableFloat: false,
    tabEnableDrag: false,
    tabEnableRename: false,
    "splitterEnableHandle": false,
    "tabEnablePopout": false,
    "tabSetEnableActiveIcon": false,
    "borderMinSize": 200,
    "borderEnableTabScrollbar": true,
    "relativeTabSize": true,
  },
  borders: [],
  layout: {
    type: "row",
    weight: 100,
    children: [
      {
        type: "col",
        weight: 100,
        children: [
          {
            type: "tabset",
            weight: 40,
            children: [
              {
                type: "tab",
                name: "Description",
                component: "description",
                id: "description",
              },
              {
                type: "tab",
                name: "Editorial",
                component: "editorial",
                id: "editorial",
              },
              {
                type: "tab",
                name: "Solutions",
                component: "solutions",
                id: "solutions",
              },
              {
                type: "tab",
                name: "Submissions",
                component: "submissions",
                id: "submissions",
              },
            ],
          },
          {
            type: "tabset",
            weight: 60,
            children: [
              {
                type: "tab",
                name: "Code",
                component: "editor",
                id: "editor",
              },
              {
                type: "tab",
                name: "AI Interview",
                component: "ai-interview",
                id: "ai-interview",
              },
              {
                type: "tab",
                name: "Code Visualization",
                component: "code-visualization",
                id: "code-visualization",
              },
              {
                type: "tab",
                name: "Testcase",
                component: "testcase",
                id: "testcase",
              },
              {
                type: "tab",
                name: "Test Results",
                component: "test-results",
                id: "test-results",
              },
            ],
          },
        ],
      },
    ],
  },
}; 