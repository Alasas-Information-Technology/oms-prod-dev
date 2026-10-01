"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UserDetailDto } from "@/lib/types/authorization.types";
import { useForceChangePassword } from "@/hooks/useAuthorization";
import { toast } from "sonner";
import { KeyRound, ShieldAlert } from "lucide-react";

interface ForceChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserDetailDto;
}

export function ForceChangePasswordDialog({
  open,
  onOpenChange,
  user,
}: ForceChangePasswordDialogProps) {
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const forceChangePasswordMutation = useForceChangePassword({
    onSuccess: () => {
      toast.success("Password updated successfully");
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to update password");
    }
  });

  React.useEffect(() => {
    if (!open) {
      setNewPassword("");
      setConfirmPassword("");
      setError("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    forceChangePasswordMutation.mutate({
      id: user.userId,
      dto: { newPassword },
    });
  };

  const isPending = forceChangePasswordMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-md border-border/70 shadow-xl max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="font-display font-semibold tracking-tight text-xl flex items-center gap-2 text-rose-600">
            <KeyRound className="size-5" />
            Force Password Change
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed text-muted-foreground/80 pt-1">
            You are overriding the password for <span className="font-semibold text-foreground/80">{user.username}</span>. 
            They will be required to use this new password immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-[13px] p-3 rounded-md flex items-center gap-2">
                <ShieldAlert className="size-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="h-9"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="h-9"
                required
              />
            </div>
          </div>
          <DialogFooter className="sm:space-x-3 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-md h-9 text-xs border-border/50 shadow-none font-medium"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-md h-9 text-xs font-semibold shadow-xs bg-rose-600 hover:bg-rose-700 text-white"
              disabled={isPending || !newPassword || !confirmPassword}
            >
              {isPending ? "Updating..." : "Change Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
