// mobile/app/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthContextType = {
  isAuthenticated: boolean;
  isGuest: boolean;
  userToken: string | null;
  userData: any | null;
  login: (token: string, user: any) => Promise<void>;
  continueAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const user = await AsyncStorage.getItem("userData");
      const guestMode = await AsyncStorage.getItem("isGuest");

      if (token && user) {
        setUserToken(token);
        setUserData(JSON.parse(user));
        setIsAuthenticated(true);
        setIsGuest(false);
      } else if (guestMode === "true") {
        setIsGuest(true);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token: string, user: any) => {
    try {
      await AsyncStorage.setItem("authToken", token);
      await AsyncStorage.setItem("userData", JSON.stringify(user));
      await AsyncStorage.removeItem("isGuest");

      setUserToken(token);
      setUserData(user);
      setIsAuthenticated(true);
      setIsGuest(false);
    } catch (error) {
      console.error("Error saving auth data:", error);
      throw error;
    }
  };

  const continueAsGuest = async () => {
    try {
      await AsyncStorage.setItem("isGuest", "true");
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("userData");

      setIsGuest(true);
      setIsAuthenticated(false);
      setUserToken(null);
      setUserData(null);
    } catch (error) {
      console.error("Error setting guest mode:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear all auth data from AsyncStorage
      await AsyncStorage.multiRemove(["authToken", "userData", "isGuest"]);

      // Reset all state
      setIsAuthenticated(false);
      setIsGuest(false);
      setUserToken(null);
      setUserData(null);

      console.log("User logged out successfully");
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  };

  const refreshUserData = async () => {
    try {
      const user = await AsyncStorage.getItem("userData");

      if (user) {
        const parsedUser = JSON.parse(user);
        setUserData(parsedUser);
        console.log("User data refreshed:", parsedUser);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isGuest,
        userToken,
        userData,
        login,
        continueAsGuest,
        logout,
        refreshUserData,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
