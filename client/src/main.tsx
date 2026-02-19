import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { router } from "./router";

const rootElement = document.getElementById("root");
if (rootElement == null) {
  throw new Error(`Your HTML Document should contain a <div id="root"></div>`);
}

import { AuthProvider } from "./contexts/AuthContext";

createRoot(rootElement).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>,
);
