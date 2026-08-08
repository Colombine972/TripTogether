import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";

import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import { router } from "./router";

const rootElement = document.getElementById("root");

if (rootElement == null) {
  throw new Error(
    `Your HTML Document should contain a <div id="root"></div>`,
  );
}

createRoot(rootElement).render(
  <AuthProvider>
    <SocketProvider>
      <RouterProvider router={router} />
    </SocketProvider>
  </AuthProvider>,
);