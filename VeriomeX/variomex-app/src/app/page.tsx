
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Dna } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-8">
        <div className="relative mb-8 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full h-32 w-32" />
          <Dna className="h-24 w-24 text-primary relative z-10" />
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
          VariomeX
        </h1>

        <p className="max-w-[600px] text-muted-foreground text-lg md:text-xl">
          Secure. Scalable. Sovereign.<br />
          Next-generation genomic data management and analysis platform.
        </p>

        <div className="flex gap-4">
          <Link href="/login">
            <Button size="lg" className="rounded-full px-8">
              Enter Platform <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="https://github.com/kausik1314/shop_cre_deb" target="_blank">
            <Button variant="outline" size="lg" className="rounded-full">
              Documentation
            </Button>
          </Link>
        </div>
      </div>

      <footer className="absolute bottom-4 text-xs text-muted-foreground">
        © 2024 VariomeX Inc. All rights reserved.
      </footer>
    </div>
  );
}
