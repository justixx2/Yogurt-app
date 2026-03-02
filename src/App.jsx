import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DatabaseProvider } from "./context/DatabaseContext";
import Navigation from "./components/Navigation";
import RecipeBuilder from "./pages/RecipeBuilder";
import Archive from "./pages/Archive";
import DataManager from "./pages/DataManager";
import "./App.css";

function App() {
  return (
    <DatabaseProvider>
      <BrowserRouter>
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
