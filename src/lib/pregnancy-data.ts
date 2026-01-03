export type BabySizeData = {
    week: number;
    object: string;
    icon: string;
    length: string;
    weight: string;
};

export type WeeklyInsight = {
    week: number;
    baby: string;
    mother: string;
    tip: string;
    whyItMatters: string;
    checklist: string[];
};

export const BABY_SIZES: BabySizeData[] = [
    { week: 4, object: 'Poppy Seed', icon: '🌱', length: '0.1 cm', weight: '< 1g' },
    { week: 5, object: 'Sesame Seed', icon: '🍬', length: '0.13 cm', weight: '< 1g' },
    { week: 6, object: 'Lentil', icon: '🫘', length: '0.5 cm', weight: '< 1g' },
    { week: 7, object: 'Blueberry', icon: '🫐', length: '1.3 cm', weight: '< 1g' },
    { week: 8, object: 'Raspberry', icon: '🧁', length: '1.6 cm', weight: '1g' },
    { week: 9, object: 'Cherry', icon: '🍒', length: '2.3 cm', weight: '2g' },
    { week: 10, object: 'Strawberry', icon: '🍓', length: '3.1 cm', weight: '4g' },
    { week: 11, object: 'Fig', icon: '🥯', length: '4.1 cm', weight: '7g' },
    { week: 12, object: 'Lime', icon: '🍋', length: '5.4 cm', weight: '14g' },
    { week: 13, object: 'Lemon', icon: '🍋', length: '6.7 cm', weight: '23g' },
    { week: 14, object: 'Peach', icon: '🍑', length: '8.7 cm', weight: '43g' },
    { week: 15, object: 'Apple', icon: '🍎', length: '10.1 cm', weight: '70g' },
    { week: 16, object: 'Avocado', icon: '🥑', length: '11.6 cm', weight: '100g' },
    { week: 17, object: 'Pear', icon: '🍐', length: '13 cm', weight: '140g' },
    { week: 18, object: 'Bell Pepper', icon: '🫑', length: '14.2 cm', weight: '190g' },
    { week: 19, object: 'Mango', icon: '🥭', length: '15.3 cm', weight: '240g' },
    { week: 20, object: 'Banana', icon: '🍌', length: '25.6 cm', weight: '300g' },
    { week: 21, object: 'Carrot', icon: '🥕', length: '26.7 cm', weight: '360g' },
    { week: 22, object: 'Papaya', icon: '🥭', length: '27.8 cm', weight: '430g' },
    { week: 23, object: 'Grapefruit', icon: '🍊', length: '28.9 cm', weight: '500g' },
    { week: 24, object: 'Cantaloupe', icon: '🍈', length: '30 cm', weight: '600g' },
    { week: 25, object: 'Cauliflower', icon: '🥦', length: '34.6 cm', weight: '660g' },
    { week: 26, object: 'Lettuce', icon: '🥬', length: '35.6 cm', weight: '760g' },
    { week: 27, object: 'Cabbage', icon: '🥬', length: '36.6 cm', weight: '875g' },
    { week: 28, object: 'Eggplant', icon: '🍆', length: '37.6 cm', weight: '1 kg' },
    { week: 29, object: 'Butternut Squash', icon: '🎃', length: '38.6 cm', weight: '1.2 kg' },
    { week: 30, object: 'Cucumber', icon: '🥒', length: '39.9 cm', weight: '1.3 kg' },
    { week: 31, object: 'Coconut', icon: '🥥', length: '41.1 cm', weight: '1.5 kg' },
    { week: 32, object: 'Jicama', icon: '🥔', length: '42.4 cm', weight: '1.7 kg' },
    { week: 33, object: 'Pineapple', icon: '🍍', length: '43.7 cm', weight: '1.9 kg' },
    { week: 34, object: 'Cantaloupe', icon: '🍈', length: '45 cm', weight: '2.1 kg' },
    { week: 35, object: 'Honeydew Melon', icon: '🍈', length: '46.2 cm', weight: '2.4 kg' },
    { week: 36, object: 'Romaine Lettuce', icon: '🥬', length: '47.4 cm', weight: '2.6 kg' },
    { week: 37, object: 'Swiss Chard', icon: '🥬', length: '48.6 cm', weight: '2.9 kg' },
    { week: 38, object: 'Leek', icon: '🥬', length: '49.8 cm', weight: '3.1 kg' },
    { week: 39, object: 'Mini Watermelon', icon: '🍉', length: '50.7 cm', weight: '3.3 kg' },
    { week: 40, object: 'Small Pumpkin', icon: '🎃', length: '51.2 cm', weight: '3.5 kg' },
];

export const WEEKLY_INSIGHTS: WeeklyInsight[] = [
    {
        week: 1,
        baby: "Your body is preparing for a potential pregnancy this week. This is a foundational stage for your cycle.",
        mother: "Hormones are shifting to prepare your uterus for a new cycle. It's the start of a clean slate for your body.",
        tip: "Focus on gentle movement and nourishing foods. Taking care of yourself now supports your future health.",
        whyItMatters: "A healthy cycle provides the best environment for future development.",
        checklist: ["Take folic acid", "Stay hydrated", "Gentle stretching"]
    },
    {
        week: 2,
        baby: "Conception may occur at the end of this week as ovulation approaches. Your body is ready for new life.",
        mother: "Your energy levels might feel higher due to rising estrogen. You are at your most fertile right now.",
        tip: "Try to manage stress and get enough rest. A calm body supports healthy ovulation.",
        whyItMatters: "Ovulation is the key moment that makes conception possible.",
        checklist: ["Eat iron-rich foods", "Reduce caffeine", "Good sleep hygiene"]
    },
    {
        week: 3,
        baby: "Fertilization happens and the tiny cells begin to divide and grow. This is the very beginning of your baby.",
        mother: "The fertilized egg is traveling toward your uterus for implantation. You are officially starting your journey.",
        tip: "Continue your healthy habits and listen to your body. Every small effort supports this early growth phase.",
        whyItMatters: "The first cell divisions determine the blueprint for all future development.",
        checklist: ["Eat omega-3s", "Meditate 5 mins", "Avoid high heat/saunas"]
    },
    {
        week: 4,
        baby: "Implantation occurs as the embryo finds its home in your uterus. Your baby is now safely tucked away.",
        mother: "Your body begins producing pregnancy hormones that support development. You might feel a slight change in energy.",
        tip: "Stay patient and positive as your body adapts. This is a significant moment of connection with your baby.",
        whyItMatters: "Implantation is what establishes the physical link between you and your baby.",
        checklist: ["Book first appointment", "Stay hydrated", "Avoid heavy lifting"]
    },
    {
        week: 5,
        baby: "The neural tube, which becomes the brain and spine, begins to form. This is a major step in development.",
        mother: "You may start to feel early symptoms like mild fatigue or nausea. Your body is working hard to protect the baby.",
        tip: "Rest whenever you feel tired and eat small, frequent meals. Listening to your body is the best form of care.",
        whyItMatters: "The neural tube is the foundation for the entire nervous system.",
        checklist: ["Small meal prep", "DHA supplements", "Early bedtime"]
    },
    {
        week: 6,
        baby: "The heart starts beating and blood begins to circulate. This is a beautiful sign of life and growth.",
        mother: "Your morning sickness might be more noticeable now. Your body is undergoing incredible changes to sustain life.",
        tip: "Ginger tea or small crackers can help settle your stomach. Be kind to yourself as you navigate these early changes.",
        whyItMatters: "The first heartbeat is a vital sign that the circulatory system is functioning.",
        checklist: ["Ginger tea", "Comfortable clothes", "Vitamin B6 check"]
    },
    {
        week: 7,
        baby: "The brain is growing rapidly and tiny buds for limbs appear. Your baby is evolving every single day.",
        mother: "You may experience mood shifts as your hormones continue to surge. It's perfectly normal to feel a bit more emotional.",
        tip: "Try journaling your thoughts or talking to a loved one. Sharing your experience can bring much-needed peace.",
        whyItMatters: "Rapid brain growth requires consistent energy and stable nutrition.",
        checklist: ["Focus on protein", "Mood journaling", "Fresh air walks"]
    },
    {
        week: 8,
        baby: "Vital organs like the brain, heart, and lungs are starting to form. Your baby is becoming more defined.",
        mother: "Your uterus is expanding to make more room for your growing baby. You are providing a safe and nurturing home.",
        tip: "Wear comfortable, supportive clothing to stay relaxed. Your comfort is just as important as the baby's growth.",
        whyItMatters: "Organogenesis is the process where all major body systems are established.",
        checklist: ["Stretch gently", "Calcium-rich foods", "Plan 1st scan"]
    },
    {
        week: 9,
        baby: "The embryonic tail is gone and distinct fingers and toes appear. Your baby is looking more like a person.",
        mother: "You might notice your skin looking clearer or glowing. Your body is radiating the strength of new life.",
        tip: "Stay connected with your healthcare provider for guidance. You are doing an amazing job nurturing this life.",
        whyItMatters: "The transition from embryo to fetus is marked by the loss of the tail structure.",
        checklist: ["Book blood tests", "Gentle skin care", "Hydration goal: 2L"]
    }
];

export type ChecklistTask = {
    id: string;
    task: string;
    description: string;
    category: string;
};

export type TrimesterChecklist = {
    trimester: '1st' | '2nd' | '3rd';
    tasks: ChecklistTask[];
};

export const TRIMESTER_CHECKLISTS: TrimesterChecklist[] = [
    {
        trimester: '1st',
        tasks: [
            { id: '1-1', task: 'Book first prenatal appointment', description: 'Usually between weeks 8-12.', category: 'Medical' },
            { id: '1-2', task: 'Start prenatal vitamins', description: 'Ensure they have at least 400mcg of folic acid.', category: 'Nutrition' },
            { id: '1-3', task: 'Review medications', description: 'Talk to your doctor about any current prescriptions.', category: 'Safety' },
            { id: '1-4', task: 'First Ultrasound', description: 'Dating scan to confirm your due date.', category: 'Medical' },
        ]
    },
    {
        trimester: '2nd',
        tasks: [
            { id: '2-1', task: 'Anatomy Scan (Level II Ultrasound)', description: 'A detailed look at baby\'s heart, brain, and organs.', category: 'Medical' },
            { id: '2-2', task: 'Glucose Screening Test', description: 'Checking for gestational diabetes (weeks 24-28).', category: 'Medical' },
            { id: '2-3', task: 'Monitor baby\'s kicks', description: 'Start tracking daily movement patterns.', category: 'Daily' },
        ]
    },
    {
        trimester: '3rd',
        tasks: [
            { id: '3-1', task: 'Pack Hospital Bag', description: 'Items for you, partner, and the baby.', category: 'Preparation' },
            { id: '3-2', task: 'Group B Strep Test', description: 'Routine screening between weeks 35-37.', category: 'Medical' },
            { id: '3-3', task: 'Finalize Birth Plan', description: 'Discuss your preferences with your care team.', category: 'Preparation' },
        ]
    },
];
