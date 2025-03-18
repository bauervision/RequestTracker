"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";
import { useUser } from "@/app/context/UserContext";
import { Button } from "./ui/button";
import { AccessRole } from "@/app/constants";
import { useUserManagement } from "@/app/context/UserManagementContext";

const RoleDropdown: React.FC = () => {
  const { user, setUser } = useUser();
  const { users, addUser } = useUserManagement();

  const handleUserChange = (index: number) => {
    setUser(users[index]);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="btn">{user.name}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Select User</DropdownMenuLabel>
        {users.map((newUser, i) => (
          <DropdownMenuItem
            key={newUser.name}
            onClick={() => handleUserChange(i)}
          >
            {newUser.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RoleDropdown;
