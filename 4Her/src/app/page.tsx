"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UniverseOpening } from "@/components/scenes/UniverseOpening";
import { LoveTimeline } from "@/components/scenes/LoveTimeline";
import { LoveGame } from "@/components/scenes/LoveGame";
import { ProposalMoment } from "@/components/scenes/ProposalMoment";
import { HiddenSurprise } from "@/components/scenes/HiddenSurprise";
import { MusicPlayer } from "@/components/layout/MusicPlayer";

export default function Home() {
    const [sceneIndex, setSceneIndex] = useState(0);

    const nextScene = () => setSceneIndex((prev) => prev + 1);

    return (
        <main className="min-h-screen bg-black overflow-hidden relative font-sans text-rose-100">
            <MusicPlayer />

            <AnimatePresence mode="wait">
                {sceneIndex === 0 && (
                    <motion.div
                        key="scene-0"
                        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 z-10"
                    >
                        <UniverseOpening onStart={nextScene} />
                    </motion.div>
                )}

                {sceneIndex === 1 && (
                    <motion.div
                        key="scene-1"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 z-10"
                    >
                        <LoveTimeline onNext={nextScene} />
                    </motion.div>
                )}

                {sceneIndex === 2 && (
                    <motion.div
                        key="scene-2"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 z-10"
                    >
                        <LoveGame onNext={nextScene} />
                    </motion.div>
                )}

                {sceneIndex === 3 && (
                    <motion.div
                        key="scene-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, filter: "blur(20px)" }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 z-10"
                    >
                        <ProposalMoment onYes={nextScene} />
                    </motion.div>
                )}

                {sceneIndex === 4 && (
                    <motion.div
                        key="scene-4"
                        initial={{ opacity: 0, rotateY: 90 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        transition={{ duration: 1.5, type: "spring" }}
                        className="absolute inset-0 z-10 perspective-1000"
                    >
                        <HiddenSurprise />
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
