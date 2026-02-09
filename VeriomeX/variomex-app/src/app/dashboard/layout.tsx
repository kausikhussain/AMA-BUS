
"use client";

import { useAuth, Role } from "@/context/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    FileText,
    Settings,
    Activity,
    LogOut,
    Menu,
    X,
    Database,
    Search,
    History,
    ShieldAlert,
    Users,
    Server
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle"; // I'll need to create this

// Define sidebar items for each role
const sidebarItems: Record<Role, { label: string; href: string; icon: any }[]> = {
    user: [
        { label: "Dashboard", href: "/dashboard/user", icon: LayoutDashboard },
        { label: "My Data", href: "/dashboard/user/data", icon: Database },
        { label: "Access Requests", href: "/dashboard/user/requests", icon: FileText },
        { label: "Settings", href: "/dashboard/user/settings", icon: Settings },
    ],
    researcher: [
        { label: "Dashboard", href: "/dashboard/researcher", icon: LayoutDashboard },
        { label: "Query Genome", href: "/dashboard/researcher/query", icon: Search },
        { label: "My Requests", href: "/dashboard/user/requests", icon: FileText }, // Reusing user flow for simplicity or separate
        { label: "Audit Logs", href: "/dashboard/researcher/audit", icon: ShieldAlert },
    ],
    admin: [
        { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
        { label: "Users", href: "/dashboard/admin/users", icon: Users },
        { label: "Genome Jobs", href: "/dashboard/admin/jobs", icon: Server },
        { label: "System Health", href: "/dashboard/admin/health", icon: Activity },
    ],
    guest: [],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, role, logout, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push("/login");
            } else if (pathname.startsWith("/dashboard") && !pathname.includes(role)) {
                // Simple role check: if path contains role name (e.g. /dashboard/admin) and user is not admin
                // This is a basic check.
                if (role === 'user' && (pathname.includes('/admin') || pathname.includes('/researcher'))) {
                    router.push('/dashboard/user');
                } else if (role === 'researcher' && pathname.includes('/admin')) {
                    router.push('/dashboard/researcher');
                }
                // Admin can access everything technically, or restrict.
            }
        }
    }, [user, isLoading, router, role, pathname]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) return null; // Will redirect

    const currentItems = sidebarItems[role] || sidebarItems.user;

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r border-sidebar-border bg-sidebar md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center border-b border-sidebar-border px-4 lg:h-[60px] lg:px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <Activity className="h-6 w-6 text-primary" />
                            <span className="text-sidebar-foreground">VariomeX</span>
                        </Link>
                    </div>
                    <div className="flex-1">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                            {currentItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-sidebar-primary-foreground hover:bg-sidebar-primary/10", // glass effect hover
                                            isActive
                                                ? "bg-sidebar-primary/15 text-sidebar-primary hover:text-sidebar-primary"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                    <div className="mt-auto p-4">
                        {/* Bottom section if needed */}
                    </div>
                </div>
            </div>
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-10 backdrop-blur-md bg-background/80">
                    <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0 md:hidden"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col bg-sidebar text-sidebar-foreground border-r-sidebar-border">
                            <nav className="grid gap-2 text-lg font-medium">
                                <Link
                                    href="#"
                                    className="flex items-center gap-2 text-lg font-semibold mb-4"
                                >
                                    <Activity className="h-6 w-6 text-primary" />
                                    <span>VariomeX</span>
                                </Link>
                                {currentItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={cn(
                                            "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground",
                                            pathname === item.href ? "bg-muted text-foreground" : "text-muted-foreground"
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1">
                        <h1 className="text-lg font-semibold md:text-xl capitalize">
                            {role} Dashboard
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <ModeToggle />
                        <Button variant="ghost" size="icon" onClick={logout} title="Logout">
                            <LogOut className="h-5 w-5" />
                        </Button>
                        <Avatar>
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </div>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/20">
                    {children}
                </main>
            </div>
        </div>
    );
}
