export function getBabySize(week: number): string {
    const sizes: Record<number, string> = {
        4: 'Poppy Seed',
        5: 'Sesame Seed',
        6: 'Lentil',
        7: 'Blueberry',
        8: 'Raspberry',
        9: 'Cherry',
        10: 'Strawberry',
        11: 'Fig',
        12: 'Lime',
        13: 'Lemon',
        14: 'Peach',
        15: 'Apple',
        16: 'Avocado',
        17: 'Pear',
        18: 'Bell Pepper',
        19: 'Mango',
        20: 'Banana',
        21: 'Carrot',
        22: 'Papaya',
        23: 'Grapefruit',
        24: 'Cantaloupe',
        25: 'Cauliflower',
        26: 'Lettuce',
        27: 'Cabbage',
        28: 'Eggplant',
        29: 'Butternut Squash',
        30: 'Cucumber',
        31: 'Coconut',
        32: 'Jicama',
        33: 'Pineapple',
        34: 'Cantaloupe',
        35: 'Honeydew Melon',
        36: 'Romaine Lettuce',
        37: 'Swiss Chard',
        38: 'Leek',
        39: 'Mini Watermelon',
        40: 'Small Pumpkin',
    };
    return sizes[week] || 'Unknown';
}

export function getTrimester(week: number): { number: number; name: string } {
    if (week <= 13) return { number: 1, name: '1st Trimester' };
    if (week <= 26) return { number: 2, name: '2nd Trimester' };
    return { number: 3, name: '3rd Trimester' };
}

export function getWeeksRemaining(currentWeek: number): number {
    return Math.max(0, 40 - currentWeek);
}

export function getDaysUntilDue(dueDate: string | Date): number {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatDueDate(dueDate: string | Date): string {
    const date = new Date(dueDate);
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}

export function getMilestone(week: number): string | null {
    const milestones: Record<number, string> = {
        8: 'Baby\'s heart is beating!',
        12: 'End of first trimester',
        16: 'You might feel baby\'s first movements',
        20: 'Halfway there!',
        24: 'Baby can hear your voice',
        28: 'Third trimester begins',
        32: 'Baby is gaining weight rapidly',
        36: 'Baby is full term',
        37: 'Baby could arrive any day!',
    };
    return milestones[week] || null;
}
