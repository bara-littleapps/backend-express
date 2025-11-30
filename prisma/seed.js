// prisma/seed.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const jobStatuses = [
    {
      code: 'ACTIVE',
      label: 'Active',
      description: 'Job is visible to users and open for applications',
    },
    {
      code: 'SUSPENDED',
      label: 'Suspended',
      description: 'Job is temporarily hidden and cannot receive new applications',
    },
    {
      code: 'ARCHIVED',
      label: 'Archived',
      description: 'Job is closed and archived',
    },
  ];

  for (const status of jobStatuses) {
    await prisma.jobStatus.upsert({
      where: { code: status.code },
      update: {
        label: status.label,
        description: status.description,
      },
      create: status,
    });
  }

  console.log('JobStatus seed completed');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
