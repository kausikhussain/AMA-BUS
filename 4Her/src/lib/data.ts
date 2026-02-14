export interface TimelineItem {
    date: string;
    title: string;
    description: string;
    image: string;
}

export const timelineData: TimelineItem[] = [
    {
        date: "The Beginning",
        title: "The Day We Met",
        description: "It felt like the stars aligned just for us.",
        image: "/placeholder/meet.jpg", // User to replace
    },
    {
        date: "First Date",
        title: "Coffee & Sparkles",
        description: "I knew there was something special about you.",
        image: "/placeholder/first-date.jpg",
    },
    {
        date: "Adventures",
        title: "Our First Trip",
        description: "Exploring the world is better with you.",
        image: "/placeholder/trip.jpg",
    },
    {
        date: "Special Moment",
        title: "Saying 'I Love You'",
        description: "Three words that changed my life forever.",
        image: "/placeholder/love.jpg",
    },
];

export interface QuizQuestion {
    question: string;
    options: string[];
    correct: number;
}

export const quizQuestions: QuizQuestion[] = [
    {
        question: "Where did we have our first date?",
        options: ["Coffee Shop", "The Park", "Cinema", "Moon"],
        correct: 0,
    },
    {
        question: "What is my favorite thing about you?",
        options: ["Your Smile", "Your Laugh", "Your Kindness", "Everything"],
        correct: 3, // Trick question, all correct? Logic to handle '3' as specific or handle all
    },
    {
        question: "What is our song?",
        options: ["Perfect", "All of Me", "Thinking Out Loud", "Lover"],
        correct: 0,
    },
];
