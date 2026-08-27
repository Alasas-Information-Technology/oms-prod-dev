"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Store,
  ArrowLeft,
  UserPlus,
  Building2,
  Shield,
  Trash2,
  UserX,
  Mail,
  Search,
  MoreHorizontal,
  ExternalLink,
  Power,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  useVendorUsers,
  useCreateVendorUser,
  useDeactivateVendorUser,
  useDeactivateVendorAll,
} from "@/hooks/useAuthorization";
import { usePermission } from "@/hooks/usePermission";
import { UserStatusBadge } from "@/components/users/UserStatusBadge";
import { VendorUserDto } from "@/lib/types/authorization.types";
import { toast } from "sonner";
import { format } from "date-fns";

export default function VendorUsersPage() {
  const router = useRouter();
  const { can } = usePermission();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [vendorToDeactivate, setVendorToDeactivate] = React.useState<{ vendorId: string; vendorName: string } | null>(null);

  // Form State
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [vendorId, setVendorId] = React.useState("");
  const [jobTitle, setJobTitle] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");

  // Queries & Mutations
  const { data: vendorUsers = [], isLoading, refetch, isFetching } = useVendorUsers();
  const createMutation = useCreateVendorUser();
  const deactivateUserMutation = useDeactivateVendorUser();
  const deactivateVendorAllMutation = useDeactivateVendorAll();

  if (!can("VENDORUSER.MANAGE")) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted-foreground">
          Vendor user administration is governed under Procurement authority [VENDORUSER.MANAGE].
        </p>
        <Button onClick={() => router.push("/app/administration/users")}>
          Back to Internal Users
        </Button>
      </div>
    );
  }

  const handleCreateVendorUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !firstName.trim() || !lastName.trim() || !vendorId.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        vendorId: vendorId.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        jobTitle: jobTitle.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
      });

      toast.success("Vendor user created successfully. Onboarding invitation issued.");
      setIsCreateOpen(false);
      setUsername("");
      setEmail("");
      setFirstName("");
      setLastName("");
      setVendorId("");
      setJobTitle("");
      setPhoneNumber("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to create vendor user");
    }
  };

  const handleDeactivateSingle = async (user: VendorUserDto) => {
    try {
      await deactivateUserMutation.mutateAsync(user.userId);
      toast.success(`Vendor user [${user.username}] deactivated.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to deactivate");
    }
  };

  const handleDeactivateVendorAll = async () => {
    if (!vendorToDeactivate) return;
    try {
      await deactivateVendorAllMutation.mutateAsync(vendorToDeactivate.vendorId);
      toast.success(
        `All vendor users for [${vendorToDeactivate.vendorName}] deactivated successfully (Rule V10).`
      );
      setVendorToDeactivate(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to deactivate vendor");
    }
  };

  const filteredUsers = React.useMemo<VendorUserDto[]>(() => {
    const list: VendorUserDto[] = Array.isArray(vendorUsers)
      ? vendorUsers
      : Array.isArray((vendorUsers as any)?.data)
        ? (vendorUsers as any).data
        : Array.isArray((vendorUsers as any)?.items)
          ? (vendorUsers as any).items
          : [];
    return list.filter((u) => {
      const match =
        !searchTerm ||
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.profile?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.vendorId?.toLowerCase().includes(searchTerm.toLowerCase());
      return match;
    });
  }, [vendorUsers, searchTerm]);

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Back button */}
      <button
        onClick={() => router.push("/app/administration/users")}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        <span>Back to Internal Users</span>
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Store className="size-7 text-primary" />
            Vendor User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Governed by Procurement. Vendor accounts are isolated from internal organization structures (Rule V1–V10).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-1.5 shadow-xs"
          >
            <UserPlus className="size-4" />
            New Vendor User
          </Button>
        </div>
      </div>

      {/* Search & Actions Card */}
      <Card className="border-border/60 shadow-xs">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search vendor user, email, vendor ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs bg-background"
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8 text-xs gap-1 self-end sm:self-auto"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardContent>
      </Card>

      {/* Vendor Users Table */}
      <Card className="border-border/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground border-b text-xs font-medium uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Vendor User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Vendor ID Reference</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-card">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground text-sm">
                    Loading vendor users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <Store className="size-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="font-medium text-foreground">No vendor users found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click &quot;New Vendor User&quot; to register an external supplier representative.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.userId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <div>
                        <span className="font-semibold text-foreground">
                          {user.profile?.displayName || user.username}
                        </span>
                        <div className="text-xs text-muted-foreground font-mono">
                          @{user.username}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-xs font-mono text-muted-foreground">
                      {user.email}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <code className="text-xs px-2 py-0.5 bg-muted rounded font-mono text-foreground">
                          {user.vendorId}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setVendorToDeactivate({
                              vendorId: user.vendorId,
                              vendorName: `Vendor (${user.vendorId.substring(0, 8)}...)`,
                            })
                          }
                          className="h-6 px-1.5 text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          title="Deactivate all accounts for this vendor"
                        >
                          Deactivate All
                        </Button>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <UserStatusBadge user={user} />
                    </td>

                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {user.createdAt ? format(new Date(user.createdAt), "dd MMM yyyy") : "—"}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      {user.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivateSingle(user)}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 size-8 p-0"
                          title="Deactivate User"
                        >
                          <UserX className="size-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Vendor User Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="size-5 text-primary" />
              Register Vendor User
            </DialogTitle>
            <DialogDescription>
              Create an external vendor representative account. Passwordless invitation token is dispatched.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateVendorUser} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="v-vendor-id">Vendor UUID / Reference *</Label>
              <Input
                id="v-vendor-id"
                placeholder="e.g. 3053433E-F36B-1410-85ED-009A959FB301"
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="v-first-name">First Name *</Label>
                <Input
                  id="v-first-name"
                  placeholder="e.g. Tariq"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="v-last-name">Last Name *</Label>
                <Input
                  id="v-last-name"
                  placeholder="e.g. Mansoor"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="v-username">Username *</Label>
                <Input
                  id="v-username"
                  placeholder="e.g. tariq.mansoor"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="v-email">Email Address *</Label>
                <Input
                  id="v-email"
                  type="email"
                  placeholder="e.g. tariq@acme-vendor.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="v-job-title">Job Title</Label>
                <Input
                  id="v-job-title"
                  placeholder="e.g. Account Manager"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="v-phone">Phone Number</Label>
                <Input
                  id="v-phone"
                  placeholder="+971 50 ..."
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Vendor User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cascading Deactivation Confirmation (Rule V10) */}
      <AlertDialog
        open={Boolean(vendorToDeactivate)}
        onOpenChange={(o) => !o && setVendorToDeactivate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="size-5 text-rose-600" />
              Cascade Deactivate All Vendor Users?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Per Governance Rule V10, this will immediately suspend and deactivate <strong>all user accounts</strong> associated with vendor <code>{vendorToDeactivate?.vendorId}</code>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivateVendorAll}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Cascade Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
