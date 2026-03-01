import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import AuthPage from "./pages/AuthPage";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorLoginPage from "./pages/DoctorLoginPage";
import EmergencyViewPage from "./pages/EmergencyViewPage";
import LandingPage from "./pages/LandingPage";
import PatientDashboard from "./pages/PatientDashboard";
import ProfileEditPage from "./pages/ProfileEditPage";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: AuthPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: PatientDashboard,
});

const profileEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile/edit",
  component: ProfileEditPage,
});

const emergencyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/emergency/$patientId",
  component: EmergencyViewPage,
});

const doctorLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/doctor/login",
  component: DoctorLoginPage,
});

const doctorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/doctor",
  component: DoctorDashboard,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  authRoute,
  dashboardRoute,
  profileEditRoute,
  emergencyRoute,
  doctorLoginRoute,
  doctorRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
