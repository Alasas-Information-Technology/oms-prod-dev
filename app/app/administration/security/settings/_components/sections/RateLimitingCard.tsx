import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";

const RATE_LIMITS = [
    { endpoint: "Login API", limit: "10 requests", window: "5 minutes" },
    { endpoint: "Refresh API", limit: "30 requests", window: "5 minutes" },
    { endpoint: "Logout API", limit: "60 requests", window: "5 minutes" },
    { endpoint: "Security APIs", limit: "100 requests", window: "5 minutes" },
    { endpoint: "Admin APIs", limit: "50 requests", window: "5 minutes" },
    { endpoint: "Settings APIs", limit: "20 requests", window: "5 minutes" },
];

export function RateLimitingCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>API Rate Limiting</CardTitle>
                <CardDescription>
                    Configure rate limiting thresholds to prevent abuse.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Endpoint</TableHead>
                                <TableHead>Limit</TableHead>
                                <TableHead>Window</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {RATE_LIMITS.map((item) => (
                                <TableRow key={item.endpoint}>
                                    <TableCell className="font-medium">{item.endpoint}</TableCell>
                                    <TableCell>{item.limit}</TableCell>
                                    <TableCell>{item.window}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <Drawer>
                    <DrawerTrigger asChild>
                        <Button variant="outline">Edit Thresholds</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle>Edit Rate Limits</DrawerTitle>
                            <DrawerDescription>
                                Modify the rate limiting thresholds. (This feature is currently read-only in this demo).
                            </DrawerDescription>
                        </DrawerHeader>
                        <div className="p-4 flex items-center justify-center h-40 border-y">
                            <p className="text-muted-foreground text-sm">
                                Rate Limit Editor UI Placeholder
                            </p>
                        </div>
                        <DrawerFooter>
                            <Button disabled>Save Changes</Button>
                            <DrawerClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </CardContent>
        </Card>
    );
}
