import { SeedDataSource } from "../data-source";
import { ExamEntity } from "src/modules/exam/entities/exam.entity";

const exams = [
    { name: 'CMA', icon: 'mdi:finance', iconColor: '#0891B2', isActive: true, isPopular: false },
    { name: 'Railway', icon: 'bi:train-front-fill', iconColor: '#F59E0B', isActive: true, isPopular: true },
    { name: 'IT', icon: 'mdi:laptop', iconColor: '#06B6D4', isActive: true, isPopular: false },
    { name: 'Insurance', icon: 'mdi:shield-check', iconColor: '#16A34A', isActive: true, isPopular: false },
    { name: 'GATE', icon: 'mdi:cpu-64-bit', iconColor: '#EA580C', isActive: true, isPopular: false },
    { name: 'Other', icon: 'mdi:dots-horizontal-circle', iconColor: '#64748B', isActive: true, isPopular: false },
    { name: 'State PSC', icon: 'mdi:map-marker-radius', iconColor: '#3B82F6', isActive: true, isPopular: false },
    { name: 'CAT', icon: 'mdi:briefcase-account', iconColor: '#7C2D12', isActive: true, isPopular: false },
    { name: 'UGC NET', icon: 'mdi:book-education', iconColor: '#0284C7', isActive: true, isPopular: false },
    { name: 'CUET', icon: 'mdi:book-open-page-variant', iconColor: '#0EA5E9', isActive: true, isPopular: false },
    { name: 'Medical', icon: 'mdi:stethoscope', iconColor: '#EC4899', isActive: true, isPopular: false },
    { name: 'NEET', icon: 'mdi:heart-pulse', iconColor: '#DC2626', isActive: true, isPopular: false },
    { name: 'CS', icon: 'mdi:file-document-outline', iconColor: '#4F46E5', isActive: true, isPopular: false },
    { name: 'CA', icon: 'mdi:calculator-variant', iconColor: '#0F766E', isActive: true, isPopular: false },
    { name: 'JEE', icon: 'mdi:atom', iconColor: '#E11D48', isActive: true, isPopular: false },
    { name: 'Defence', icon: 'mdi:shield-star', iconColor: '#DC2626', isActive: true, isPopular: false },
    { name: 'SSC', icon: 'boxicons:landmark', iconColor: '#6366F1', isActive: true, isPopular: true },
    { name: 'Judiciary', icon: 'mdi:scale-balance', iconColor: '#7C3AED', isActive: true, isPopular: false },
    { name: 'CLAT', icon: 'mdi:gavel', iconColor: '#9333EA', isActive: true, isPopular: false },
    { name: 'Teaching', icon: 'mdi:school', iconColor: '#14B8A6', isActive: true, isPopular: false },
    { name: 'Banking', icon: 'fluent:building-bank-16-filled', iconColor: '#10B981', isActive: true, isPopular: true },
    { name: 'Police', icon: 'mdi:police-badge', iconColor: '#2563EB', isActive: true, isPopular: false },
    { name: 'NDA', icon: 'solar:shield-bold-duotone', iconColor: '#EF4444', isActive: true, isPopular: true },
    { name: 'Engineering', icon: 'mdi:hammer-wrench', iconColor: '#F97316', isActive: true, isPopular: false },
    { name: 'UPSC', icon: 'noto:books', iconColor: '#8B5CF6', isActive: true, isPopular: true },
];

async function run() {

    await SeedDataSource.initialize();
    const repo = SeedDataSource.getRepository(ExamEntity);

    let created = 0;
    let updated = 0;

    for (const exam of exams) {

        const existing = await repo.findOneBy({ name: exam.name });

        if (existing) {
            await repo.update({ id: existing.id }, {
                icon: exam.icon,
                iconColor: exam.iconColor,
                isActive: exam.isActive,
                isPopular: exam.isPopular
            });

            updated++;
        }
        else {
            const newExam = repo.create({
                name: exam.name,
                icon: exam.icon,
                iconColor: exam.iconColor,
                isActive: exam.isActive,
                isPopular: exam.isPopular
            });

            await repo.save(newExam);
            created++;
        }

    }

    console.log(`Exam seed complete — created: ${created}, updated: ${updated}`);

    await SeedDataSource.destroy();
}

run().catch((err) => {
    console.error('Exam seed failed:', err);
    process.exit(1);
});