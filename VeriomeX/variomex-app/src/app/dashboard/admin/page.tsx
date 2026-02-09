
"use client";

import { useAuth } from "@/context/auth-context";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Server, Shield, Activity, MoreHorizontal, UserCog } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function AdminDashboard() {
    const { user } = useAuth();

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary">System Administration</h2>
                    <p className="text-muted-foreground">Monitor system health and manage platform users.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12,384</div>
                        <p className="text-xs text-muted-foreground">+180 this month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                        <Server className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">48</div>
                        <p className="text-xs text-muted-foreground">Compute load: 64%</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Secure Queries</CardTitle>
                        <Shield className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,892</div>
                        <p className="text-xs text-muted-foreground">99.9% verified</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Health</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">Healthy</div>
                        <p className="text-xs text-muted-foreground">Uptime: 99.99%</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>
                            Recent user registrations and status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Join Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[
                                    { name: "Dr. Alice Chen", email: "alice@research.com", role: "Researcher", date: "Jan 12, 2024", status: "Active" },
                                    { name: "John Doe", email: "john@email.com", role: "User", date: "Jan 10, 2024", status: "Active" },
                                    { name: "BioGen Corp", email: "admin@biogen.com", role: "Researcher", date: "Dec 15, 2023", status: "Suspended" },
                                    { name: "Sarah Smith", email: "sarah@tech.com", role: "User", date: "Dec 10, 2023", status: "Pending" },
                                ].map((u, i) => (
                                    <TableRow key={i}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{u.name}</span>
                                                <span className="text-xs text-muted-foreground">{u.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{u.role}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{u.date}</TableCell>
                                        <TableCell>
                                            <Badge variant={u.status === "Active" ? "outline" : u.status === "Pending" ? "secondary" : "destructive"}>
                                                {u.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                                                    <DropdownMenuItem>Reset Password</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600">Suspend User</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>System Resources</CardTitle>
                        <CardDescription>
                            Live metrics from nodes
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">CPU Usage</span>
                                <span className="text-muted-foreground">42%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-secondary">
                                <div className="h-full w-[42%] rounded-full bg-primary" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">Memory</span>
                                <span className="text-muted-foreground">68%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-secondary">
                                <div className="h-full w-[68%] rounded-full bg-blue-500" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">Storage</span>
                                <span className="text-muted-foreground">21%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-secondary">
                                <div className="h-full w-[21%] rounded-full bg-green-500" />
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <h4 className="text-sm font-semibold mb-2">Alerts</h4>
                            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md text-sm text-yellow-600">
                                ⚠️ High latency on Node EU-West-2
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
