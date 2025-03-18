import React, { createContext, useContext, useState } from "react";

export const ToggleContext = createContext();

export const ToggleProvider = ({ children }) => {
  const [intoggle, setInToggle] = useState(false);
  console.log("ToggleProvider rendered, toggle:", intoggle); // Debug log

  return (
    <ToggleContext.Provider value={{ intoggle, setInToggle }}>
      {children}
    </ToggleContext.Provider>
  );
};

export const useToggle = () => {
  const context = useContext(ToggleContext);
  if (!context) {
    console.error("useToggle is used outside ToggleProvider!");
    throw new Error("useToggle must be used within a ToggleProvider");
  }
  console.log("useToggle context:", context); // Debug log
  return context;
};