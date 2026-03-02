import { createContext, useContext, useState, useEffect } from "react";
import defaultDatabase from "../data/bacteria";

const DatabaseContext = createContext(null);

const STORAGE_KEY = "yogurt-app-database";

export function DatabaseProvider({ children }) {
  const [database, setDatabase] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge stored custom data with defaults so built-in data stays fresh
        return { ...defaultDatabase, ...parsed };
      }
    } catch {
      // ignore parse errors
    }
    return defaultDatabase;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
    } catch {
      // storage full or unavailable
    }
  }, [database]);

  const updateDatabase = (newData) => {
    setDatabase(newData);
  };

  const resetDatabase = () => {
    localStorage.removeItem(STORAGE_KEY);
    setDatabase(defaultDatabase);
  };

  const getSpeciesList = () => Object.keys(database);

  const getSpecies = (name) => database[name] || null;

  const getStrain = (speciesName, strainName) => {
    const species = database[speciesName];
    if (!species) return null;
    return species.strains[strainName] || null;
  };

  const getStrainsList = (speciesName) => {
    const species = database[speciesName];
    if (!species) return [];
    return Object.keys(species.strains);
  };

  const getAllStrains = () => {
    const result = [];
    for (const [speciesName, species] of Object.entries(database)) {
      for (const [strainName, strain] of Object.entries(species.strains)) {
        result.push({
          speciesName,
          strainName,
          species,
          strain
        });
      }
    }
    return result;
  };

  return (
    <DatabaseContext.Provider
      value={{
        database,
        updateDatabase,
        resetDatabase,
        getSpeciesList,
        getSpecies,
        getStrain,
        getStrainsList,
        getAllStrains
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
}
