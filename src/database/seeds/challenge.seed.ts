import { ChallengeType } from "src/modules/challenge/enums/challenge-type.enum";
import { SeedDataSource } from "../data-source";
import { ChallengeEntity } from "src/modules/challenge/entities/challenge.entity";
import { ResetPeriod } from "src/modules/challenge/enums/reset-period.enum";
import { HabitGoalType } from "src/modules/challenge/enums/habit-goal-type.enum";


type SeedChallenge = {
    id: string;
    title: string;
    description: string;
    type: ChallengeType;
    goalType: HabitGoalType | null;
    targetValue: number | null;
    resetPeriod: ResetPeriod;
    isActive: boolean;
};

const challenges: SeedChallenge[] = [
    {
        id: '57b04546-8101-400f-b03f-c74f847bff6b',
        title: 'Daily GK Quiz',
        description: '10 fresh general-knowledge and current-affairs questions. Same quiz for every aspirant, with a new set every day.',
        type: ChallengeType.QUIZ,
        goalType: null,
        targetValue: null,
        resetPeriod: ResetPeriod.DAILY,
        isActive: true,
    },
    {
        id: '58e5a548-4371-44f2-90b8-5aaed033fd44',
        title: 'Question Solver',
        description: 'Answer 3 questions today.',
        type: ChallengeType.HABIT,
        goalType: HabitGoalType.ANSWER_QUESTIONS,
        targetValue: 3,
        resetPeriod: ResetPeriod.DAILY,
        isActive: true,
    },
    {
        id: '881e60cc-2e37-46f8-84b3-7d67c0c4ddbe',
        title: 'Daily Study Sprint',
        description: 'Study for 60 minutes today.',
        type: ChallengeType.HABIT,
        goalType: HabitGoalType.STUDY_MINUTES,
        targetValue: 60,
        resetPeriod: ResetPeriod.DAILY,
        isActive: true,
    },
    {
        id: 'ad4e3ef7-4e87-4b8c-b100-e54dd388a698',
        title: 'Helpful Aspirant',
        description: 'Get 3 of your answers accepted this week.',
        type: ChallengeType.HABIT,
        goalType: HabitGoalType.ACCEPTED_ANSWERS,
        targetValue: 3,
        resetPeriod: ResetPeriod.WEEKLY,
        isActive: true,
    },
];

async function run() {

    await SeedDataSource.initialize();

    const repo = SeedDataSource.getRepository(ChallengeEntity);

    let created = 0;
    let updated = 0;

    for (const challenge of challenges) {

        const existing = await repo.findOneBy({ title: challenge.title });

        if (existing) {

            await repo.update({ id: existing.id }, {
                description: challenge.description,
                type: challenge.type,
                goalType: challenge.goalType as HabitGoalType,
                targetValue: challenge.targetValue ?? undefined,
                resetPeriod: challenge.resetPeriod,
                isActive: challenge.isActive
            });

            updated++;
        }
        else {
            const newChallenge = repo.create({
                ...challenge,
                goalType: challenge.goalType ?? undefined,
                targetValue: challenge.targetValue ?? undefined,
            });

            await repo.save(newChallenge);

            created++;
        }

    }

    console.log(`Challenge seed complete — created: ${created}, updated: ${updated}`);
    await SeedDataSource.destroy();

}

run().catch((err) => {
    console.error('Challenge seed failed:', err);
    process.exit(1);
});