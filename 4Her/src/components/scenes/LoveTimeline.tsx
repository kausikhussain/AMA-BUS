"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { timelineData, type TimelineItem } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { StarField } from "@/components/3d/StarField";
import { Canvas } from "@react-three/fiber";
import { Heart, Calendar, ArrowRight } from "lucide-react";

interface LoveTimelineProps {
    onNext: () => void;
}

export function LoveTimeline({ onNext }: LoveTimelineProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollXProgress } = useScroll({ container: containerRef });

    return (
        <div className="relative h-screen w-full bg-romantic-dark overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 opacity-50">
                <Canvas>
                    <StarField />
                </Canvas>
            </div>

            <div className="absolute top-8 left-8 z-10">
                <h2 className="text-3xl font-serif text-rose-200">Our Journey</h2>
                <p className="text-rose-400 text-sm">Scroll to explore &rarr;</p>
            </div>

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-20">
                <motion.div
                    className="h-full bg-rose-500 box-shadow-glow"
                    style={{ width: useTransform(scrollXProgress, [0, 1], ["0%", "100%"]) }}
                />
            </div>

            {/* Horizontal Scroll Container */}
            <div
                ref={containerRef}
                className="flex h-full items-center overflow-x-scroll snap-x snap-mandatory px-4 md:px-20 gap-8 scroll-smooth pb-8"
            >
                {timelineData.map((item: TimelineItem, index: number) => (
                    <div key={index} className="snap-center shrink-0 w-[90vw] md:w-[600px] flex flex-col items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, y: 50, rotateX: -10 }}
                            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                            viewport={{ margin: "-20%" }}
                            transition={{ duration: 0.8 }}
                            className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl rounded-2xl w-full p-8 flex flex-col items-center text-center relative overflow-hidden group hover:border-rose-500/50 transition-colors"
                        >
                            {/* 3D-ish decoration */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl group-hover:bg-rose-500/30 transition-all" />

                            <div className="text-rose-500 mb-4 animate-float">
                                <Heart fill="currentColor" size={48} />
                            </div>

                            <div className="flex items-center gap-2 text-rose-300 mb-2">
                                <Calendar size={16} />
                                <span className="text-sm tracking-widest uppercase">{item.date}</span>
                            </div>

                            <h3 className="text-3xl md:text-5xl font-serif text-white mb-4">
                                {item.title}
                            </h3>

                            <p className="text-rose-100/80 text-lg leading-relaxed">
                                {item.description}
                            </p>

                            {/* Placeholder for image - in real app, use next/image */}
                            <div className="mt-6 w-full h-48 bg-black/40 rounded-lg flex items-center justify-center text-rose-500/30 border border-white/5">
                                [ Photo: {item.title} ]
                            </div>
                        </motion.div>
                    </div>
                ))}

                {/* End of Timeline - Transition to Next Scene */}
                <div className="snap-center shrink-0 w-[90vw] md:w-[600px] flex flex-col items-center justify-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        className="text-center"
                    >
                        <h2 className="text-4xl font-serif text-white mb-8">
                            And the story continues...
                        </h2>
                        <Button onClick={onNext} size="lg" className="group">
                            Play Love Quiz <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
