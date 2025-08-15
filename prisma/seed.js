// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.role.createMany({
    data: [
      { id: 1, name: 'admin' },
      { id: 2, name: 'user' },
      { id: 3, name: 'guest' },
    ],
    skipDuplicates: true,
  });

  const permissions = await prisma.permission.createMany({
    data: [
      { id: 1, name: 'create_note' },
      { id: 2, name: 'edit_own_note' },
      { id: 3, name: 'edit_any_note' },
      { id: 4, name: 'delete_own_note' },
      { id: 5, name: 'delete_any_note' },
      { id: 6, name: 'read_note' },
      { id: 7, name: 'assign_roles' },
    ],
    skipDuplicates: true,
  });

  // Assign permissions to roles
  await prisma.rolePermission.createMany({
    data: [
      // Admin gets all
      { role_id: 1, permission_id: 1 },
      { role_id: 1, permission_id: 2 },
      { role_id: 1, permission_id: 3 },
      { role_id: 1, permission_id: 4 },
      { role_id: 1, permission_id: 5 },
      { role_id: 1, permission_id: 6 },
      { role_id: 1, permission_id: 7 },

      // User
      { role_id: 2, permission_id: 1 },
      { role_id: 2, permission_id: 2 },
      { role_id: 2, permission_id: 4 },
      { role_id: 2, permission_id: 6 },

      // Guest
      { role_id: 3, permission_id: 6 },
    ],
    skipDuplicates: true,
  });

  console.log('Seed data inserted');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
