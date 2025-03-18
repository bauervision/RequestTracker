"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { USERS, AccessRole, User } from "@/app/constants";

interface UserManagementContextType {
  users: User[];
  addUser: (user: User) => void;
}

const UserManagementContext = createContext<
  UserManagementContextType | undefined
>(undefined);

export const UserManagementProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  // Load the initial state from localStorage or fallback to USERS constant.
  const [users, setUsers] = useState<User[]>(() => {
    const stored = localStorage.getItem("users");
    return stored ? JSON.parse(stored) : USERS;
  });

  // Save users to localStorage whenever the state changes.
  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  const addUser = (user: User) => {
    setUsers((prev) => [...prev, user]);
  };

  return (
    <UserManagementContext.Provider value={{ users, addUser }}>
      {children}
    </UserManagementContext.Provider>
  );
};

export const useUserManagement = (): UserManagementContextType => {
  const context = useContext(UserManagementContext);
  if (context === undefined) {
    throw new Error(
      "useUserManagement must be used within a UserManagementProvider"
    );
  }
  return context;
};
