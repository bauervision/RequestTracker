"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface UserGroup {
  name: string;
  userNames: string[];
}

interface UserGroupContextType {
  groups: UserGroup[];
  addGroup: (group: UserGroup) => void;
  updateGroup: (index: number, group: UserGroup) => void;
  deleteGroup: (index: number) => void;
}

const UserGroupContext = createContext<UserGroupContextType | undefined>(
  undefined
);

export const UserGroupProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Load groups from localStorage if available
  const [groups, setGroups] = useState<UserGroup[]>(() => {
    if (typeof window !== "undefined") {
      const storedGroups = localStorage.getItem("userGroups");
      return storedGroups ? JSON.parse(storedGroups) : [];
    }
    return [];
  });

  // Save groups to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("userGroups", JSON.stringify(groups));
  }, [groups]);

  const addGroup = (group: UserGroup) => {
    setGroups((prev) => [...prev, group]);
  };

  const updateGroup = (index: number, group: UserGroup) => {
    setGroups((prev) => {
      const updated = [...prev];
      updated[index] = group;
      return updated;
    });
  };

  const deleteGroup = (index: number) => {
    setGroups((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <UserGroupContext.Provider
      value={{ groups, addGroup, updateGroup, deleteGroup }}
    >
      {children}
    </UserGroupContext.Provider>
  );
};

export const useUserGroup = (): UserGroupContextType => {
  const context = useContext(UserGroupContext);
  if (!context) {
    throw new Error("useUserGroup must be used within a UserGroupProvider");
  }
  return context;
};
