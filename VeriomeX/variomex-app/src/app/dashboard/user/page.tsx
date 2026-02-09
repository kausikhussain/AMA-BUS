
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
import { Dna, Activity, FileCheck, Clock, Upload, ArrowRight, X } from "lucide-react";

export default function UserDashboard() {
    const { user } = useAuth();

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary">Welcome back, {user?.name}</h2>
                    <p className="text-muted-foreground">Manage your genomic data and access requests.</p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Genome
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Genomes Uploaded</CardTitle>
                        <Dna className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">+1 from last month</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pipeline Status</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">Running</div>
                        <p className="text-xs text-muted-foreground">Job #4029 processing</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1</div>
                        <p className="text-xs text-muted-foreground">Need your review</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Access Granted</CardTitle>
                        <FileCheck className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">7</div>
                        <p className="text-xs text-muted-foreground">Active permissions</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 shadow-md bg-card/60 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Latest actions on your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Event</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[
                                    { event: "Genome Upload (HG38)", status: "Completed", date: "2 mins ago" },
                                    { event: "Access Request from Dr. Smith", status: "Pending", date: "1 hour ago" },
                                    { event: "Pipeline Analysis Job #4028", status: "Failed", date: "Yesterday" },
                                    { event: "Data Export", status: "Completed", date: "2 days ago" },
                                ].map((item, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-medium">{item.event}</TableCell>
                                        <TableCell>
                                            <Badge variant={item.status === "Completed" ? "default" : item.status === "Pending" ? "secondary" : "destructive"}>
                                                {item.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">{item.date}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="col-span-3 shadow-md bg-card/60 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Pending Access Requests</CardTitle>
                        <CardDescription>
                            Researchers requesting access to your data
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { name: "Global Pharma Research", reason: "Drug sensitivity study", type: "Full Genome" },
                                { name: "University of Medical Sciences", reason: "Population genetics", type: "VCF Only" },
                            ].map((req, i) => (
                                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{req.name}</p>
                                        <p className="text-xs text-muted-foreground">{req.reason}</p>
                                        <Badge variant="outline" className="text-[10px] mt-1">{req.type}</Badge>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-green-600 border-green-200 bg-green-50 hover:bg-green-100">
                                            <FileCheck className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 border-red-200 bg-red-50 hover:bg-red-100">
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <Button variant="ghost" className="w-full mt-2 text-xs">
                                View All Requests <ArrowRight className="ml-2 h-3 w-3" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
