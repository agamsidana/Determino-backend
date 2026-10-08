import { SeedDataSource } from "../data-source";
import { GoalEntity } from "src/modules/goal/entities/goal.entity";

const goals = [
    {
        name: 'Daily Motivation',
        icon: 'mdi:lightning-bolt-outline',
        iconColor: '#F59E0B',
        isActive: true
    },
    {
        name: 'Challenges',
        icon: 'mdi:trophy-outline',
        iconColor: '#EF4444',
        isActive: true
    },
    {
        name: 'Guidance',
        icon: 'mdi:compass-outline',
        iconColor: '#8B5CF6',
        isActive: true
    },
    {
        name: 'Discussion',
        icon: 'mdi:forum-outline',
        iconColor: '#3B82F6',
        isActive: true
    },
    {
        name: 'Study Partner',
        icon: 'mdi:account-group-outline',
        iconColor: '#6366F1',
        isActive: true
    },
    {
        name: 'Notes & Resources',
        icon: 'mdi:notebook-outline',
        iconColor: '#10B981',
        isActive: true
    }
];

async function run(){

    await SeedDataSource.initialize();

    const repo = SeedDataSource.getRepository(GoalEntity);

    let created = 0;
    let updated = 0;


    for (const goal of goals) {

        const existing = await repo.findOneBy({
            name: goal.name
        });

        if(existing){

             await repo.update(
                { id: existing.id },
                {
                    icon: goal.icon,
                    iconColor: goal.iconColor,
                    isActive: goal.isActive
                }
            );

            updated++;
        }
          else {

            const newGoal = repo.create({
                name: goal.name,
                icon: goal.icon,
                iconColor: goal.iconColor,
                isActive: goal.isActive
            });

            await repo.save(newGoal);

            created++;
        }
    }

     console.log(
        `Goal seed complete — created: ${created}, updated: ${updated}`
    );

    await SeedDataSource.destroy();
}


run().catch((err) => {
    console.error('Goal seed failed:', err);
    process.exit(1);
});
    
