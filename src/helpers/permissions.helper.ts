import { Roles } from "../types/types";

type PermissionsMap = {
  [key: string]: Roles[];
};

type RolePermissions = {
  [role: string]: string[];
};

export const migratePermissionsMapToRolePermissionsMap = (permissionsMap: PermissionsMap) => {
  const rolePermissions: RolePermissions = {};

  Object.keys(permissionsMap).forEach(permission => {
    permissionsMap[permission].forEach((role: any) => {
      if (!rolePermissions[role]) {
        rolePermissions[role] = [];
      }
      rolePermissions[role].push(permission);
    });
  });

  return Object.keys(rolePermissions).map(role => ({
    role,
    permissions: rolePermissions[role],
  }));
};
