import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { DatabaseProvider } from "./context/DatabaseContext";
import Navigation from "./components/Navigation";
import RecipeBuilder from "./pages/RecipeBuilder";
import Archive from "./pages/Archive";
import DataManager from "./pages/DataManager";
import "./App.css";

// Handle GitHub Pages SPA redirect (404.html redirects to /?route=/path)
function GitHubPagesRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const route = params.get("route");
    if (route) {
      navigate(route, { replace: true });
    }
  }, []);

  return null;
}

function App() {
  return (
    <DatabaseProvider>
      <BrowserRouter basename="/Yogurt-app">
        <GitHubPagesRedirect />
        <div className="app">
          <Navigation />
          <div className="app-content">
            <Routes>
              <Route path="/" element={<RecipeBuilder />} />
              <Route path="/archive" element={<Archive />} />
              <Route path="/data" element={<DataManager />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </DatabaseProvider>
  );
}

export default App;
