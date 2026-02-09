
"use client";

import { useAuth } from "@/context/auth-context";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, History, Database, ArrowUpRight, FlaskConical } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ResearcherDashboard() {
    const { user } = useAuth();
    const [query, setQuery] = useState("");
    const [isQuerying, setIsQuerying] = useState(false);

    const handleQuery = () => {
        if (!query) return;
        setIsQuerying(true);
        // Mock query
        setTimeout(() => {
            setIsQuerying(false);
            toast.success("Query submitted successfully. Processing...");
        }, 1500);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary">Research Portal</h2>
                    <p className="text-muted-foreground">Query variant databases and manage datasets.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-primary/20 shadow-lg bg-gradient-to-br from-card to-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5 text-primary" />
                            Submit Mutation Query
                        </CardTitle>
                        <CardDescription>
                            Search for specific variants across the VariomeX network
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Gene or Variant ID (e.g. BRCA1, rs123456)</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter query..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="bg-background/80"
                                />
                                <Button onClick={handleQuery} disabled={isQuerying}>
                                    {isQuerying ? "Searching..." : "Search"}
                                </Button>
                            </div>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50 border border-dashed border-primary/20">
                            <p className="text-xs text-muted-foreground text-center">
                                Supported formats: VCF, HGVS, dbSMP IDs.
                                <br />
                                Proofs are generated using zk-SNARKs.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-primary/10 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5 text-blue-500" />
                            Available Datasets
                        </CardTitle>
                        <CardDescription>
                            Cohorts available for analysis
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { name: "Rare Disease Cohort A", samples: 1240, access: "Granted" },
                                { name: "Oncology Dataset B", samples: 850, access: "Request Needed" },
                                { name: "Population Control Group", samples: 5000, access: "Public" },
                            ].map((set, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-md bg-muted/20 hover:bg-muted/40 transition-colors">
                                    <div>
                                        <p className="font-medium text-sm">{set.name}</p>
                                        <p className="text-xs text-muted-foreground">{set.samples} samples</p>
                                    </div>
                                    <Badge variant={set.access === "Granted" ? "default" : set.access === "Public" ? "secondary" : "outline"}>
                                        {set.access}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="ghost" size="sm" className="w-full text-xs">
                            Browse All Datasets <ArrowUpRight className="ml-2 h-3 w-3" />
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-muted-foreground" />
                        Query History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Query ID</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead>Parameters</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Result</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[
                                { id: "Q-9982", target: "TP53", params: "Exon 5-8", status: "Completed", result: "12 Matches" },
                                { id: "Q-9981", target: "BRCA2", params: "Pathogenic only", status: "Processing", result: "-" },
                                { id: "Q-9975", target: "CFTR", params: "F508del", status: "Completed", result: "0 Matches" },
                            ].map((q, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium font-mono text-xs">{q.id}</TableCell>
                                    <TableCell>{q.target}</TableCell>
                                    <TableCell className="text-muted-foreground text-xs">{q.params}</TableCell>
                                    <TableCell>
                                        <Badge variant={q.status === "Completed" ? "outline" : "secondary"} className={q.status === "Processing" ? "animate-pulse" : ""}>
                                            {q.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">{q.result}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
