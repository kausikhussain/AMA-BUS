"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Heart } from "lucide-react";
import confetti from "canvas-confetti";

interface ProposalMomentProps {
    onYes: () => void;
}

export function ProposalMoment({ onYes }: ProposalMomentProps) {
    const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
    const [yesPressed, setYesPressed] = useState(false);
    const [noCount, setNoCount] = useState(0);

    const noPhrases = [
        "No 😢",
        "Are you sure? 🥺",
        "Think again 😌",
        "Don't break my heart 💔",
        "Last chance! 🌹",
        "I'm gonna cry 😭",
        "Okay, I'll ask again...",
    ];

    const handleNoHover = () => {
        // Calculate new position within a safe range to avoid going off-screen too easily
        // This is relative to the button's initial position
        const range = 200;
        const x = Math.random() * range - (range / 2);
        const y = Math.random() * range - (range / 2);
        setNoPosition({ x, y });
        setNoCount((prev) => (prev + 1) % noPhrases.length);
    };

    const handleYes = () => {
        setYesPressed(true);
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-900/20 via-black to-black" />

            {!yesPressed ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="z-10 text-center flex flex-col items-center gap-12"
                >
                    <div className="text-rose-500 animate-pulse-slow">
                        <Heart size={100} fill="currentColor" />
                    </div>

                    <h1 className="text-5xl md:text-7xl font-serif text-white text-shadow-glow">
                        Will you be my Valentine?
                    </h1>

                    <div className="flex items-center gap-8 mt-8">
                        <Button
                            onClick={handleYes}
                            size="lg"
                            className="text-2xl px-12 py-6 bg-rose-600 hover:bg-rose-500 hover:scale-110 transition-all shadow-[0_0_30px_rgba(255,10,84,0.6)]"
                        >
                            YES 💖
                        </Button>

                        <div
                            onMouseEnter={handleNoHover}
                            onClick={handleNoHover}
                            style={{ display: 'inline-block' }}
                        >
                            <motion.button
                                animate={{ x: noPosition.x, y: noPosition.y }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="px-8 py-4 bg-white/10 rounded-full text-rose-200 border border-white/20 hover:bg-white/20 backdrop-blur-md whitespace-nowrap"
                            >
                                {noPhrases[noCount]}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="z-10 text-center"
                >
                    <h1 className="text-6xl md:text-8xl font-serif text-white mb-6 animate-bounce">
                        She said YES! 💍💖
                    </h1>
                    <p className="text-2xl text-rose-200 mb-12">
                        Best decision ever.
                    </p>

                    <Button onClick={onYes} size="lg" className="animate-pulse">
                        Open Your Gift 🎁
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
