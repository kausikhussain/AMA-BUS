"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { quizQuestions } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { Heart, XCircle } from "lucide-react";
import confetti from "canvas-confetti";

interface LoveGameProps {
    onNext: () => void;
}

export function LoveGame({ onNext }: LoveGameProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswersLocked, setIsAnswersLocked] = useState(false);

    const handleAnswer = (index: number) => {
        if (isAnswersLocked) return;

        setSelectedOption(index);
        setIsAnswersLocked(true);

        const isCorrect = index === quizQuestions[currentQuestion].correct;

        if (isCorrect) {
            setScore((prev) => prev + 1);
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 },
                colors: ['#ff0a54', '#ff477e']
            });
        }

        setTimeout(() => {
            if (currentQuestion < quizQuestions.length - 1) {
                setCurrentQuestion((prev) => prev + 1);
                setSelectedOption(null);
                setIsAnswersLocked(false);
            } else {
                setShowResult(true);
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-romantic-dark p-4 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-10 left-10 text-rose-500/10 animate-spin-slow">
                <Heart size={300} />
            </div>

            <AnimatePresence mode="wait">
                {!showResult ? (
                    <motion.div
                        key="quiz"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full max-w-2xl z-10"
                    >
                        <div className="mb-8 text-center">
                            <span className="text-rose-400 uppercase tracking-widest text-sm">
                                Question {currentQuestion + 1} / {quizQuestions.length}
                            </span>
                            <h2 className="text-3xl md:text-5xl font-serif text-white mt-4 leading-tight">
                                {quizQuestions[currentQuestion].question}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {quizQuestions[currentQuestion].options.map((option, index) => {
                                const isSelected = selectedOption === index;
                                const isCorrect = index === quizQuestions[currentQuestion].correct;
                                const showCorrectness = isAnswersLocked && isSelected;

                                return (
                                    <motion.button
                                        key={index}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleAnswer(index)}
                                        disabled={isAnswersLocked}
                                        className={`
                      p-6 rounded-xl text-left transition-all duration-300 border
                      ${showCorrectness
                                                ? (isCorrect ? "bg-green-500/20 border-green-500 text-green-100" : "bg-red-500/20 border-red-500 text-red-100")
                                                : "bg-white/5 border-white/10 hover:bg-white/10 text-rose-100"
                                            }
                    `}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg">{option}</span>
                                            {showCorrectness && (
                                                isCorrect ? <Heart className="text-green-400 fill-green-400" /> : <XCircle className="text-red-400" />
                                            )}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center z-10 bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl rounded-2xl p-12 max-w-2xl"
                    >
                        <Heart className="w-20 h-20 text-rose-500 mx-auto mb-6 animate-pulse" fill="currentColor" />
                        <h2 className="text-4xl md:text-6xl font-serif text-white mb-6">
                            {score === quizQuestions.length ? "Perfect Match! 💖" : "You are my forever answer."}
                        </h2>
                        <p className="text-xl text-rose-200 mb-8">
                            No matter the score, I love you more than words can say.
                        </p>
                        <Button onClick={onNext} size="lg" className="animate-bounce">
                            One Last Question...
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
