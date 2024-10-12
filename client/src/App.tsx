/* eslint-disable */
import React from 'react';
import {
  AccountCircleOutlined,
  ChatBubbleOutline,
  ManageAccounts,
  PeopleAltOutlined,
  StarOutlineRounded,
  VillaOutlined,
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
import routerProvider, { BrowserRouter, Route, Routes } from '@pankod/refine-react-router-v6';
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
    suppressConsoleErrors();
  }, []);

  const authProvider: AuthProvider = {
    login: async ({ credential }: CredentialResponse) => {
      const profileObj = credential ? parseJwt(credential) : null;
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
          setIsAdmin(data.isAdmin);
        } else {
          return Promise.reject();
        }
      }

      localStorage.setItem('token', `${credential}`);

      return Promise.resolve();
    },
    logout: () => {
      return new Promise<void>((resolve) => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
    
        if (token && user && typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          axios.defaults.headers.common = {};
          
          if (window.google?.accounts?.id) {
            try {
              window.google.accounts.id.revoke(token, () => {
                resolve();
              });
            } catch (error) {
              // Silently catch any errors during revoke
              resolve();
            }
          } else {
            resolve();
          }
        } else {
          resolve();
        }
    
        setIsAdmin(false);
      });
    },
    
    checkError: () => Promise.resolve(),
    checkAuth: async () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      if (token && user) {
        const userData = JSON.parse(user);
        setIsAdmin(userData.isAdmin);
        return Promise.resolve();
      }
      return Promise.reject();
    },
    getPermissions: () => Promise.resolve(),
    getUserIdentity: async () => {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        setIsAdmin(userData.isAdmin);
        return Promise.resolve(userData);
      }
      
      // Return null if no user data exists
      return Promise.resolve(null);
    },
    
  };

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
      name: 'procurements', // LINK
      list: AllProcurements,
      show: ProcurementDetails,
      create: CreateProcurement,
      edit: EditProcurement,
      icon: <VillaOutlined />,
    },
    {
      name: 'deployments', // LINK
      list: AllDeployments,
      show: DeploymentDetails,
      create: CreateDeployment,
      edit: EditDeployment,
      icon: <VillaOutlined />,
    },
    {
      name: 'sales', // LINK
      list: AllSales,
      show: SaleDetails,
      create: CreateSale,
      edit: EditSale,
      icon: <VillaOutlined />,
    },
    {
      name: 'agents',
      list: Agents,
      show: AgentProfile,
      icon: <PeopleAltOutlined />,
    },
    {
      name: 'review',
      list: Home,
      icon: <StarOutlineRounded />,
    },
    {
      name: 'message',
      list: Home,
      icon: <ChatBubbleOutline />,
    },
    {
      name: 'my-profile',
      options: { label: 'My Profile' },
      list: MyProfile,
      icon: <AccountCircleOutlined />,
    },
  ];

  const resources = React.useMemo(() => {
    if (isAdmin) {
      return [
        ...baseResources,
        {
          name: 'user-management',
          list: UserManagement,
          options: { label: 'User Management' },
          icon: <ManageAccounts />,
        },
      ];
    }
    return baseResources;
  }, [isAdmin]);

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
            resources={resources}
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
