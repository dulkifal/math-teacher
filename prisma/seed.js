const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  await prisma.learningPlan.upsert({
    where: { slug: 'foundations-arithmetic' },
    update: {},
    create: {
      slug: 'foundations-arithmetic',
      title: 'Foundations: Arithmetic',
      description: 'Core arithmetic topics in order: Addition → Fractions → Rational numbers',
      steps: {
        create: [
          { title: 'Addition', description: 'Basic addition and sums', lessonId: 'addition', order: 1, estimatedMinutes: 10 },
          { title: 'Fractions', description: 'Understanding fractions', lessonId: 'fractions', order: 2, estimatedMinutes: 15 },
          { title: 'Rational Numbers', description: 'Ratios and rational numbers', lessonId: 'rational', order: 3, estimatedMinutes: 15 }
        ]
      }
    }
  })

  console.log('Seeded learning plan: foundations-arithmetic')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
