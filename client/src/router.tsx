import { createBrowserRouter } from "react-router";
import App from "./App";
import Account from "./components/Account";
import CGU from "./pages/CGU";
import Confidentialite from "./pages/Confidentialite";
import CreateTrip from "./pages/CreateTrip";
import Home from "./pages/Home";
import Invitation from "./pages/Invitation";
import Invitations from "./pages/Invitations";
import Login from "./pages/Login";
import MentionsLegales from "./pages/MentionsLegales";
import MyTrips from "./pages/MyTrips";
import Register from "./pages/Register";
import Steps from "./pages/Steps";
import Trip from "./pages/Trip";
import TripBudgetPage from "./pages/TripBudgetPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "account",
        element: <Account />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "privacy",
        element: <Confidentialite />,
      },
      {
        path: "legal",
        element: <MentionsLegales />,
      },
      {
        path: "terms",
        element: <CGU />,
      },
      {
        path: "my-trips",
        element: <MyTrips />,
      },
      {
        path: "create-trip",
        element: <CreateTrip />,
      },
      {
        path: "trip/:id",
        element: <Trip />,
      },
      {
        path: "trip/:id/steps",
        element: <Steps />,
      },
      {
        path: "trip/:id/invitations",
        element: <Invitations />,
      },
      {
        path: "trip/:id/invitation/:invitationId",
        element: <Invitation />,
      },
      {
        path: "trip/:id/budget",
        element: <TripBudgetPage />,
      },
    ],
  },
] as const);
