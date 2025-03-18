"use client";
import React, { useState, useMemo, useCallback, useRef } from "react";
import RequestsLayout from "../../RequestsLayout";
import { Button } from "@/components/ui/button";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AccessRole, User } from "@/app/constants"; // adjust the import path as needed
import { useUserManagement } from "@/app/context/UserManagementContext";
import { useUserGroup, UserGroup } from "@/app/context/UserGroupContext";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

function AdminUserManagementPage() {
  // Local state for managing users
  const { users, addUser } = useUserManagement();
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState<AccessRole>(AccessRole.USER);

  // Handler for adding a new user
  const handleAddUser = () => {
    if (!newUserName.trim()) {
      // Optionally display an error message.
      return;
    }
    const newUser: User = {
      name: newUserName.trim(),
      role: newUserRole,
    };
    addUser(newUser);
    setNewUserName("");
    setNewUserRole(AccessRole.USER);
  };

  // Define grid column definitions
  const columnDefs: ColDef<User>[] = useMemo(
    () => [
      { headerName: "Name", field: "name", sortable: true, filter: true },
      { headerName: "Role", field: "role", sortable: true, filter: true },
    ],
    []
  );

  const availableRoles = useMemo(
    () => Object.values(AccessRole).filter((role) => role !== AccessRole.GUEST),
    []
  );

  const gridApiRef = useRef<any>(null);
  const onGridReady = useCallback((params: any) => {
    gridApiRef.current = params.api;
  }, []);

  // *** User Group Module State ***
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedUsersForGroup, setSelectedUsersForGroup] = useState<string[]>(
    []
  );

  // *** User Group Module State handled by context ***
  const { groups, addGroup, updateGroup, deleteGroup } = useUserGroup();

  // For editing an existing group:
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGroupIndex, setEditingGroupIndex] = useState<number | null>(
    null
  );
  const [editingGroupData, setEditingGroupData] = useState<UserGroup>({
    name: "",
    userNames: [],
  });

  // For delete confirmation
  const [isDeleteGroupDialogOpen, setIsDeleteGroupDialogOpen] = useState(false);
  const [groupToDeleteIndex, setGroupToDeleteIndex] = useState<number | null>(
    null
  );

  // Handle change in the multi-select for group assignment (both for new and edit)
  const handleGroupUserSelectionChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    setter: (users: string[]) => void
  ) => {
    const options = e.target.options;
    const selected: string[] = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setter(selected);
  };

  // Handler to add a new user group.
  const handleAddGroup = () => {
    if (!newGroupName.trim()) {
      return;
    }
    const newGroup: UserGroup = {
      name: newGroupName.trim(),
      userNames: selectedUsersForGroup,
    };
    addGroup(newGroup);
    setNewGroupName("");
    setSelectedUsersForGroup([]);
  };

  // Handler for opening the edit dialog.
  const handleEditGroup = (index: number) => {
    setEditingGroupIndex(index);
    setEditingGroupData(groups[index]);
    setIsEditDialogOpen(true);
  };

  // Handler for saving changes in the edit dialog.
  const handleSaveGroupEdit = () => {
    if (editingGroupIndex === null) return;
    updateGroup(editingGroupIndex, editingGroupData);
    setIsEditDialogOpen(false);
    setEditingGroupIndex(null);
  };

  // Handler to open delete confirmation dialog.
  const openDeleteGroupDialog = (index: number) => {
    setGroupToDeleteIndex(index);
    setIsDeleteGroupDialogOpen(true);
  };

  // Handler to delete a group.
  const handleDeleteGroup = () => {
    if (groupToDeleteIndex === null) return;
    deleteGroup(groupToDeleteIndex);
    setIsDeleteGroupDialogOpen(false);
    setGroupToDeleteIndex(null);
  };

  return (
    <RequestsLayout title="Catēna Administration">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">User Management</h1>

        {/* New User Creation Form */}
        <div className="mb-6 border p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Create New User</h2>
          <div className="flex flex-col gap-4 max-w-md">
            <input
              type="text"
              placeholder="Enter user name"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="border p-2 rounded"
            />
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as AccessRole)}
              className="border p-2 rounded"
            >
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <Button onClick={handleAddUser} className="bg-blue-800 text-white">
              Add User
            </Button>
          </div>
        </div>

        {/* User List Table */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Current Users</h2>
          <div
            className="ag-theme-quartz mx-auto"
            style={{ height: "400px", width: "90%" }}
          >
            <AgGridReact<User>
              rowData={users}
              columnDefs={columnDefs}
              onGridReady={onGridReady}
              pagination={true}
              paginationPageSize={10}
            />
          </div>
        </div>

        {/* User Group Module */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">User Groups</h2>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Group Creation Form */}
            <div className="border p-4 rounded shadow flex-1">
              <h3 className="text-lg font-semibold mb-2">Create New Group</h3>
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Enter group name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="border p-2 rounded"
                />
                <Label>Select Users to assign:</Label>
                <select
                  multiple
                  value={selectedUsersForGroup}
                  onChange={(e) =>
                    handleGroupUserSelectionChange(e, setSelectedUsersForGroup)
                  }
                  className="border p-2 rounded h-32"
                >
                  {users.map((u) => (
                    <option key={u.name} value={u.name}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleAddGroup}
                  className="bg-blue-800 text-white"
                >
                  Create Group
                </Button>
              </div>
            </div>

            {/* Existing Groups List */}
            <div
              className="border p-4 rounded shadow flex-1"
              style={{ maxHeight: "300px", overflowY: "auto" }}
            >
              <h3 className="text-lg font-semibold mb-2">Existing Groups</h3>
              {groups.length > 0 ? (
                <ul className="space-y-2">
                  {groups.map((group, index) => (
                    <li
                      key={index}
                      className="border-b pb-2 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold">{group.name}</p>
                        <p className="text-sm">
                          Users: {group.userNames.join(", ") || "None"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditGroup(index)}
                          className="bg-yellow-500 text-white"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => openDeleteGroupDialog(index)}
                          className="bg-red-500 text-white"
                        >
                          Delete
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No groups created yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Edit Group Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Group</DialogTitle>
              <DialogDescription>
                Modify the group name and update the assigned users.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Group Name"
                value={editingGroupData.name}
                onChange={(e) =>
                  setEditingGroupData({
                    ...editingGroupData,
                    name: e.target.value,
                  })
                }
                className="border p-2 rounded"
              />
              <Label>Select Users:</Label>
              <select
                multiple
                value={editingGroupData.userNames}
                onChange={(e) =>
                  handleGroupUserSelectionChange(e, (selected) =>
                    setEditingGroupData({
                      ...editingGroupData,
                      userNames: selected,
                    })
                  )
                }
                className="border p-2 rounded h-32"
              >
                {users.map((u) => (
                  <option key={u.name} value={u.name}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button
                onClick={handleSaveGroupEdit}
                className="bg-green-500 text-white"
              >
                Save Changes
              </Button>
              <Button
                onClick={() => setIsEditDialogOpen(false)}
                className="bg-gray-300 text-black"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Group Confirmation Dialog */}
        <Dialog
          open={isDeleteGroupDialogOpen}
          onOpenChange={setIsDeleteGroupDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete Group</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this group? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={handleDeleteGroup}
                className="bg-red-500 text-white"
              >
                Delete
              </Button>
              <Button
                onClick={() => setIsDeleteGroupDialogOpen(false)}
                className="bg-gray-300 text-black"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RequestsLayout>
  );
}

export default AdminUserManagementPage;
