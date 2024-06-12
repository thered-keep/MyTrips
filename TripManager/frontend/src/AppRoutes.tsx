import { Navigate, Route, RouteProps, Routes } from "react-router-dom";
import { DestinationPage } from "./pages/DestinationsPage";
import { TripsPage } from "./pages/TripsPage";
import { HomePage } from "./pages/HomePage";
export type RouteConfig = RouteProps & {
  path: string;
};
export const routes: RouteConfig[] = [
  {
    path: "/",
    element: <Navigate to="/home" replace />,
    index: true,
  },
  { path: "/home", element: <HomePage /> },
  { path: "/trips", element: <TripsPage /> },
  { path: "/destinations", element: <DestinationPage /> },
];

const renderRouteMap = (route: RouteConfig) => {
  
  return <Route key={route.path}{...route} />;
};

export const AppRoutes = () => {
  return (
    <Routes>{routes.map((route: RouteConfig) => renderRouteMap(route))}</Routes>
  );
};
