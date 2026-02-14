"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { StarField } from "../3d/StarField";
import { Button } from "../ui/Button";

interface UniverseOpeningProps {
    onStart: () => void;
}

export function UniverseOpening({ onStart }: UniverseOpeningProps) {
    const [step, setStep] = useState(0);

    // Auto-advance text for cinematic effect
    // In a real app, use useEffect with timers or scroll
    // For now, let's use a sequence of animations or simpler state

    return (
        <div className="relative h-screen w-full overflow-hidden bg-black text-rose-100 font-serif">
            {/* 3D Background */}
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 1] }}>
                    <StarField />
                </Canvas>
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 flex h-full flex-col items-center justify-center p-4 text-center">
                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 1.5 }}
                            onAnimationComplete={() => setTimeout(() => setStep(1), 3000)}
                        >
                            <h1 className="text-4xl md:text-6xl font-light tracking-wide text-rose-200/80">
                                In a universe of billions...
                            </h1>
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div
                            key="message"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.5 }}
                            onAnimationComplete={() => setTimeout(() => setStep(2), 3500)}
                        >
                            <h2 className="text-3xl md:text-5xl font-light text-rose-100">
                                I found the one who <span className="text-rose-500 font-bold glow text-shadow-glow">changed everything.</span>
                            </h2>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="final"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1 }}
                            className="flex flex-col items-center gap-8"
                        >
                            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-rose-400 via-rose-100 to-rose-400 bg-clip-text text-transparent animate-pulse-slow">
                                Hi, [Her Name]
                            </h1>
                            <Button onClick={onStart} size="lg" className="animate-float mt-8">
                                ✨ Enter Our Story
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Skip button for impatient lovers */}
            {step < 2 && (
                <button
                    onClick={() => setStep(2)}
                    className="absolute bottom-8 right-8 text-rose-500/50 hover:text-rose-500 text-sm transition-colors"
                >
                    Skip Intro
                </button>
            )}
        </div>
    );
}
