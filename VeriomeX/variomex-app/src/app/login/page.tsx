
"use client";

import { useState } from "react";
import { useAuth, Role } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Dna, ShieldCheck, User, FlaskConical, Wallet } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [selectedRole, setSelectedRole] = useState<Role>("user");
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please enter email and password");
            return;
        }

        setIsLoggingIn(true);
        try {
            await login(selectedRole, email);
            toast.success(`Welcome back, ${selectedRole}!`);
        } catch (error) {
            toast.error("Login failed. Please try again.");
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleWalletConnect = () => {
        toast.info("Wallet connection is mocked for this demo.");
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-40 pointer-events-none" />

            <div className="relative z-10 w-full max-w-md px-4">
                <div className="flex flex-col items-center mb-8">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Dna className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">VariomeX</h1>
                    <p className="text-muted-foreground mt-2">Secure Genome Analysis Platform</p>
                </div>

                <Tabs
                    defaultValue="user"
                    value={selectedRole}
                    onValueChange={(val) => setSelectedRole(val as Role)}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="user" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            User
                        </TabsTrigger>
                        <TabsTrigger value="researcher" className="flex items-center gap-2">
                            <FlaskConical className="h-4 w-4" />
                            Research
                        </TabsTrigger>
                        <TabsTrigger value="admin" className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" />
                            Admin
                        </TabsTrigger>
                    </TabsList>

                    <Card className="border-primary/20 shadow-xl backdrop-blur-sm bg-card/50">
                        <CardHeader>
                            <CardTitle>
                                {selectedRole === "user" && "Patient Login"}
                                {selectedRole === "researcher" && "Researcher Portal"}
                                {selectedRole === "admin" && "System Administration"}
                            </CardTitle>
                            <CardDescription>
                                Enter your credentials to access the {selectedRole} dashboard
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        placeholder={selectedRole === "admin" ? "admin@variomex.com" : "name@example.com"}
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-background/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        <Link href="#" className="text-xs text-primary hover:underline">
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-background/50"
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox id="remember" />
                                    <Label htmlFor="remember" className="text-sm font-normal">
                                        Remember me for 30 days
                                    </Label>
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoggingIn || isLoading}>
                                    {isLoggingIn ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Authenticating...
                                        </>
                                    ) : (
                                        "Sign In"
                                    )}
                                </Button>
                            </form>

                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <Button variant="outline" className="w-full" onClick={handleWalletConnect}>
                                <Wallet className="mr-2 h-4 w-4" />
                                Connect Wallet
                            </Button>
                        </CardContent>
                        <CardFooter className="flex justify-center border-t p-4">
                            <p className="text-xs text-muted-foreground text-center">
                                By logging in, you agree to our <Link href="#" className="underline">Terms of Service</Link> and <Link href="#" className="underline">Privacy Policy</Link>.
                            </p>
                        </CardFooter>
                    </Card>
                </Tabs>
            </div>
        </div>
    );
}
