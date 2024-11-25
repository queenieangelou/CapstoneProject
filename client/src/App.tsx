import React from 'react';
import {
  AccountCircleOutlined,
  AttachMoneyOutlined,
  ChatBubbleOutline,
  ManageAccounts,
  NoCrashOutlined,
  PeopleAltOutlined,
  StarOutlineRounded,
  VillaOutlined,
  WalletOutlined,
  WarehouseOutlined,
} from '@mui/icons-material';
import { AuthProvider, Refine } from '@pankod/refine-core';
import {
  CssBaseline,
  ErrorComponent,
  GlobalStyles,
  notificationProvider,
  ReadyPage,
  RefineSnackbarProvider,
} from '@pankod/refine-mui';
import routerProvider from '@pankod/refine-react-router-v6';
import dataProvider from '@pankod/refine-simple-rest';
import axios, { AxiosRequestConfig } from 'axios';

import { Header, Layout, Sider, Title } from 'components/layout';
import { ColorModeContextProvider } from 'contexts';
import { CredentialResponse } from 'interfaces/google';
import { parseJwt } from 'utils/parse-jwt';

import {
  AgentProfile,
  Agents,
  AllProperties,
  CreateProcurement,
  CreateProperty,
  EditProcurement,
  EditProperty,
  Home,
  Login,
  MyProfile,
  ProcurementDetails,
  PropertyDetails,
} from 'pages';
import AllProcurements from 'pages/all-procurements';
import UserManagement from 'pages/user-management';
import { UnauthorizedPage } from 'pages/unauthorized';
import SaleDetails from 'pages/sale-details';
import AllSales from 'pages/all-sales';
import CreateSale from 'pages/create-sale';
import EditSale from 'pages/edit-sale';
import AllDeployments from 'pages/all-deployment';
import DeploymentDetails from 'pages/deployment-details';
import CreateDeployment from 'pages/create-deployment';
import EditDeployment from 'pages/edit-deployment';
import ClientPortal from 'pages/client-portal';
import AllExpenses from 'pages/all-expenses';
import CreateExpense from 'pages/create-expense';
import EditExpense from 'pages/edit-expense';
import ExpenseDetails from 'pages/expense-details';

const axiosInstance = axios.create();
axiosInstance.interceptors.request.use((request: AxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (request.headers) {
    request.headers.Authorization = `Bearer ${token}`;
  } else {
    request.headers = {
      Authorization: `Bearer ${token}`,
    };
  }
  return request;
});

const suppressConsoleErrors = () => {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (
      args[0]?.includes('POST https://accounts.google.com/gsi/revoke') ||
      args[0]?.includes('The specified user is not signed in.')
    ) {
      return;
    }
  };
};

const App = () => {
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user); // Safe to parse as user is not null
      if (parsedUser.isAdmin) {
        setIsAdmin(parsedUser.isAdmin);
      }
    }
    suppressConsoleErrors();
  }, []);

  const authProvider: AuthProvider = {
    login: async ({ credential }: CredentialResponse) => {
      const profileObj = credential ? parseJwt(credential) : null;

      // Save user to MongoDB
      if (profileObj) {
        const response = await fetch('http://localhost:8080/api/v1/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: profileObj.name,
            email: profileObj.email,
            avatar: profileObj.picture,
          }),
        });

        const data = await response.json();

        if (response.status === 200) {
          localStorage.setItem(
            'user',
            JSON.stringify({
              ...profileObj,
              avatar: profileObj.picture,
              userid: data._id,
              isAdmin: data.isAdmin,
            }),
          );
          setIsAdmin(data.isAdmin); // Set isAdmin after login
        } else {
          return Promise.reject();
        }
      }

      localStorage.setItem('token', `${credential}`);

      return Promise.resolve();
    },
    logout: () => {
      const token = localStorage.getItem('token');

      if (token && typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        axios.defaults.headers.common = {};
        window.google?.accounts.id.revoke(token, () => Promise.resolve());
      }

      return Promise.resolve();
    },
    checkError: () => Promise.resolve(),
    checkAuth: async () => {
      const token = localStorage.getItem('token');

      if (token) {
        return Promise.resolve();
      }
      return Promise.reject();
    },

    getPermissions: () => Promise.resolve(),
    getUserIdentity: async () => {
      const user = localStorage.getItem('user');
      if (user) {
        return Promise.resolve(JSON.parse(user));
      }
    },
  };

  const generateResources = () => {
    const baseResources = [
      {
        name: 'properties',
        list: AllProperties,
        show: PropertyDetails,
        create: CreateProperty,
        edit: EditProperty,
        icon: <VillaOutlined />,
      },
      {
        name: 'procurements',
        list: AllProcurements,
        show: ProcurementDetails,
        create: CreateProcurement,
        edit: EditProcurement,
        icon: <WarehouseOutlined />,
      },
      {
        name: 'deployments',
        list: AllDeployments,
        show: DeploymentDetails,
        create: CreateDeployment,
        edit: EditDeployment,
        icon: <NoCrashOutlined />,
      },
      {
        name: 'expenses',
        list: AllExpenses,
        show: ExpenseDetails,
        create: CreateExpense,
        edit: EditExpense,
        icon: <WalletOutlined/>,
      },
      {
        name: 'sales',
        list: AllSales,
        show: SaleDetails,
        create: CreateSale,
        edit: EditSale,
        icon: <AttachMoneyOutlined/>,
      },
      {
        name: 'agents',
        list: Agents,
        show: AgentProfile,
        icon: <PeopleAltOutlined />,
      },
      {
        name: 'my-profile',
        options: { label: 'My Profile' },
        list: MyProfile,
        icon: <AccountCircleOutlined />,
      },
    ];

    // Add user management resource only for admin users
    if (isAdmin) {
      baseResources.push({
        name: 'user-management',
        list: UserManagement,
        options: { label: 'User Management' },
        icon: <ManageAccounts />,
      });
    }
    return baseResources;
  };

  return (
    <ColorModeContextProvider>
      <CssBaseline />
      <GlobalStyles styles={{ html: { WebkitFontSmoothing: 'auto' } }} />
      <RefineSnackbarProvider>
        <Refine
          dataProvider={dataProvider('http://localhost:8080/api/v1')}
          notificationProvider={notificationProvider}
          ReadyPage={ReadyPage}
          catchAll={<ErrorComponent />}
          resources={generateResources()}
          Title={Title}
          Sider={Sider}
          Layout={Layout}
          Header={Header}
            routerProvider={{
              ...routerProvider,
              routes: [
                {
                  path: '/unauthorized',
                  element: <UnauthorizedPage />
                },
                {
                  path: '/client-portal',
                  element: <ClientPortal />
                },
              ],
            }}
          authProvider={authProvider}
          LoginPage={Login}
          DashboardPage={Home}
        />
      </RefineSnackbarProvider>
    </ColorModeContextProvider>
  );
};


export default App;
