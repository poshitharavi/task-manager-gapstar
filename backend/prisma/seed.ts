import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting Seeding...");

  try {
    const plainPassword = "password";
    const hashedPassword = await hash(plainPassword, 10);

    await prisma.user.create({
      data: {
        userName: "adam",
        password: hashedPassword,
        name: "Adam",
      },
    });

    console.log(`\n First User created`);
  } catch (error) {
    console.error(error);
  }

  console.log(`\n Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
