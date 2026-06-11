import { PrismaClient, Intent, LifeStage, ChildrenStatus, GroupType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding development data…");

  // Create seed users (their ids must match Supabase Auth users you've created manually)
  // In dev, use fake UUIDs since Supabase Auth is not running locally
  const users = [
    {
      id: "00000000-0000-0000-0000-000000000001",
      phone: "+380671234001",
      displayName: "Оксана",
      birthYear: 1988,
      bio: "Мама двох дітей, шукаю подругу для спільного виховання.",
      city: "Київ",
      lifeStage: LifeStage.single_mother,
      childrenStatus: ChildrenStatus.have,
      childrenCount: 2,
      intents: [Intent.co_parenting, Intent.friendship],
      valuesTags: ["сім'я", "природа", "здоров'я"],
      avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      id: "00000000-0000-0000-0000-000000000002",
      phone: "+380671234002",
      displayName: "Марина",
      birthYear: 1985,
      bio: "Підприємиця, шукаю партнерку для бізнес-проекту в IT.",
      city: "Львів",
      lifeStage: LifeStage.single,
      childrenStatus: ChildrenStatus.none,
      childrenCount: 0,
      intents: [Intent.co_business, Intent.mentorship],
      valuesTags: ["бізнес", "технології", "розвиток"],
    },
    {
      id: "00000000-0000-0000-0000-000000000003",
      phone: "+380671234003",
      displayName: "Анна",
      birthYear: 1990,
      bio: "Переїхала з Харкова. Шукаю подругу для спільного проживання.",
      city: "Одеса",
      lifeStage: LifeStage.divorced,
      childrenStatus: ChildrenStatus.have,
      childrenCount: 1,
      intents: [Intent.co_living, Intent.friendship, Intent.support],
      valuesTags: ["освіта", "діти", "творчість"],
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id },
      create: {
        id: u.id,
        phone: u.phone,
        status: "active",
        profile: {
          create: {
            displayName: u.displayName,
            birthYear: u.birthYear,
            bio: u.bio,
            city: u.city,
            region: "Україна",
            lifeStage: u.lifeStage,
            childrenStatus: u.childrenStatus,
            childrenCount: u.childrenCount,
            languages: ["Українська"],
            occupation: "Не вказано",
            avatarUrl: u.avatarUrl ?? null,
            valuesTags: u.valuesTags,
            dealBreakers: [],
            verifiedLevel: "phone",
            onboardingCompleted: true,
            profileVisibility: "members_only",
          },
        },
        intents: {
          createMany: {
            data: u.intents.map((intent) => ({ intent, active: true })),
          },
        },
      },
      update: {},
    });
  }

  // Seed groups
  const groups = [
    {
      id: "10000000-0000-0000-0000-000000000001",
      name: "Мами Києва",
      slug: "mamy-kyieva",
      description: "Спільнота мам Києва для взаємопідтримки та спільного дозвілля",
      type: GroupType.city,
      city: "Київ",
      createdById: users[0].id,
    },
    {
      id: "10000000-0000-0000-0000-000000000002",
      name: "Жінки в IT",
      slug: "zhinky-v-it",
      description: "Професійна спільнота жінок у сфері технологій",
      type: GroupType.interest,
      city: null,
      createdById: users[1].id,
    },
    {
      id: "10000000-0000-0000-0000-000000000003",
      name: "Підтримка ВПО",
      slug: "pidtrymka-vpo",
      description: "Група підтримки для внутрішньо переміщених жінок",
      type: GroupType.support,
      city: null,
      createdById: users[2].id,
    },
  ];

  for (const g of groups) {
    await prisma.group.upsert({
      where: { id: g.id },
      create: {
        ...g,
        isPrivate: false,
        memberCount: 1,
      },
      update: {},
    });

    await prisma.groupMember.upsert({
      where: { groupId_userId: { groupId: g.id, userId: g.createdById } },
      create: { groupId: g.id, userId: g.createdById, role: "owner" },
      update: {},
    });
  }

  console.log("Seed complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
