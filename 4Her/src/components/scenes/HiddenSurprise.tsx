"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export function HiddenSurprise() {
    const letterContent = `
My Dearest Love,

If you are reading this, it means you said yes. (I knew you would... or I hoped!)

This little universe I built is just a fraction of the world I want to build with you. 
Every star here represents a reason why I love you, and even then, I ran out of space.

You are my favorite thought, my favorite place, and my favorite person.

Here's to us. To our past, our present, and our beautiful future.

Happy Valentine's Day. 

Forever yours,
[Your Name]
  `;

    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setDisplayedText(letterContent.slice(0, i));
            i++;
            if (i > letterContent.length) clearInterval(interval);
        }, 50);
        return () => clearInterval(interval);
    }, [letterContent]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-black/90 p-4 md:p-12 relative overflow-hidden backdrop-blur-md">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse-slow pointer-events-none" />

            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                className="max-w-3xl w-full bg-[#fffcf5] text-gray-800 p-8 md:p-16 rounded-sm shadow-2xl relative rotate-1"
                style={{
                    boxShadow: "0 0 50px rgba(255, 255, 255, 0.2), inset 0 0 60px rgba(0,0,0,0.05)",
                }}
            >
                {/* Paper texture feel */}
                <div className="absolute inset-0 border-2 border-gray-800/10 m-2 pointer-events-none" />

                <div className="text-center mb-10">
                    <Heart className="w-12 h-12 text-red-800 mx-auto opacity-80" fill="currentColor" />
                </div>

                <div className="font-serif text-lg md:text-xl leading-loose whitespace-pre-wrap font-medium">
                    {displayedText}
                    <span className="animate-pulse">|</span>
                </div>

                <div className="mt-12 text-center text-sm text-gray-400 uppercase tracking-widest">
                    End of Chapter 1
                </div>
            </motion.div>
        </div>
    );
}
