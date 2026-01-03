import { BABY_SIZES } from './pregnancy-data';

export type PregnancyProgress = {
    currentWeek: number;
    daysIntoWeek: number;
    trimester: number;
    trimesterName: string;
    daysRemaining: number;
    weeksRemaining: number;
    isOverdue: boolean;
};

/**
 * Calculates pregnancy progress based on due date
 */
export function getPregnancyProgress(dueDateStr: string | Date): PregnancyProgress {
    const dueDate = new Date(dueDateStr);
    const now = new Date();

    // Average pregnancy is 280 days (40 weeks) from LMP
    // So LMP = Due Date - 280 days
    const lmpDate = new Date(dueDate.getTime() - (280 * 24 * 60 * 60 * 1000));

    const diffInTime = now.getTime() - lmpDate.getTime();
    const diffInDays = Math.floor(diffInTime / (1000 * 60 * 60 * 24));

    const currentWeek = Math.max(1, Math.min(42, Math.floor(diffInDays / 7)));
    const daysIntoWeek = diffInDays % 7;

    const daysRemaining = Math.max(0, Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const weeksRemaining = Math.ceil(daysRemaining / 7);

    let trimester = 1;
    let trimesterName = 'First Trimester';

    if (currentWeek >= 28) {
        trimester = 3;
        trimesterName = 'Third Trimester';
    } else if (currentWeek >= 14) {
        trimester = 2;
        trimesterName = 'Second Trimester';
    }

    return {
        currentWeek,
        daysIntoWeek: Math.max(0, daysIntoWeek),
        trimester,
        trimesterName,
        daysRemaining,
        weeksRemaining,
        isOverdue: now > dueDate
    };
}

export function getBabySize(week: number) {
    return BABY_SIZES.find(s => s.week === week) || BABY_SIZES[BABY_SIZES.length - 1];
}

export function formatDueDate(dueDate: string | Date): string {
    const date = new Date(dueDate);
    return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}
