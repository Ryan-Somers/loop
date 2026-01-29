import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ConvexProvider } from "convex/react";
import App from "./App";
import AuthProvider from "./context/AuthContext";
import { QueryProvider } from "./lib/react-query/QueryProvider";
import { convex } from "./lib/convex/config";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ConvexProvider client={convex}>
    <BrowserRouter>
      <AuthProvider>
        <QueryProvider>
          <App />
        </QueryProvider>
      </AuthProvider>
    </BrowserRouter>
  </ConvexProvider>
);
