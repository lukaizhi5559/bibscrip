"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type UserPlan = "free" | "premium" | "trial";

interface UserContextType {
  plan: UserPlan;
  showAds: boolean;
  isLoggedIn: boolean;
  setUserPlan: (plan: UserPlan) => void;
  login: () => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  // Default to free plan with ads enabled
  const [plan, setPlan] = useState<UserPlan>("free");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  
  // Compute showAds based on the user plan
  const showAds = plan === "free";
  
  // Load user state from localStorage on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedPlan = localStorage.getItem("bibscrip-user-plan");
        const savedLoginState = localStorage.getItem("bibscrip-user-logged-in");
        
        if (savedPlan) {
          setPlan(savedPlan as UserPlan);
        }
        
        if (savedLoginState) {
          setIsLoggedIn(JSON.parse(savedLoginState));
        }
      } catch (error) {
        console.error("Error loading user state from localStorage:", error);
      }
    }
  }, []);
  
  // Save state changes to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bibscrip-user-plan", plan);
      localStorage.setItem("bibscrip-user-logged-in", JSON.stringify(isLoggedIn));
    }
  }, [plan, isLoggedIn]);
  
  const setUserPlan = (newPlan: UserPlan) => {
    setPlan(newPlan);
  };
  
  const login = () => {
    setIsLoggedIn(true);
  };
  
  const logout = () => {
    setIsLoggedIn(false);
    // Reset to free plan on logout
    setPlan("free");
  };
  
  return (
    <UserContext.Provider
      value={{
        plan,
        showAds,
        isLoggedIn,
        setUserPlan,
        login,
        logout
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
