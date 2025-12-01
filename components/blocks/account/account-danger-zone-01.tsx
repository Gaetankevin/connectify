"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Ban, Trash2 } from "lucide-react";
import { useState } from "react";

export const title = "Account Danger Zone";

export default function AccountDangerZone01() {
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");

  const userEmail = "emma@example.com";

  const handleDeactivate = () => {
    console.log("Deactivating account");
    setDeactivateDialogOpen(false);
  };

  const handleDelete = () => {
    if (confirmationText === userEmail) {
      console.log("Deleting account");
      setDeleteDialogOpen(false);
      setConfirmationText("");
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <Card className="bg-card border p-8">
        <div className="border-b pb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Danger Zone</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Irreversible and destructive actions for your account. Please proceed with caution.
          </p>
        </div>

        <div className="space-y-6 mt-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              The actions below are permanent and cannot be undone. Make sure you understand the consequences before proceeding.
            </AlertDescription>
          </Alert>

          {/* Deactivate Account */}
          <div className="rounded-lg border-2 border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/50 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Ban className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                    Deactivate Account
                  </h3>
                  <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                    Temporarily disable your account. You can reactivate it anytime by logging back in.
                  </p>
                  <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1 list-disc list-inside">
                    <li>Your profile will be hidden from others</li>
                    <li>You won't receive any notifications</li>
                    <li>Your data will be preserved</li>
                    <li>Reactivate anytime within 30 days</li>
                  </ul>
                </div>
              </div>
              <Button
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950 w-full sm:w-auto"
                onClick={() => setDeactivateDialogOpen(true)}
              >
                Deactivate Account
              </Button>
            </div>
          </div>

          {/* Delete Account */}
          <div className="rounded-lg border-2 border-destructive bg-destructive/5 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Trash2 className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-destructive mb-1">
                    Delete Account Permanently
                  </h3>
                  <p className="text-sm text-destructive/90 mb-3">
                    Once you delete your account, there is no going back. This action is permanent.
                  </p>
                  <ul className="text-sm text-destructive/80 space-y-1 list-disc list-inside">
                    <li>All your data will be permanently deleted</li>
                    <li>Your username will become available to others</li>
                    <li>All your content and posts will be removed</li>
                    <li>Active subscriptions will be cancelled</li>
                    <li>This action cannot be undone</li>
                  </ul>
                </div>
              </div>
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete My Account
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to deactivate?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Your account will be temporarily disabled. You can reactivate it by logging in again within 30 days.</p>
                <p className="font-medium">While deactivated:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Your profile will be hidden from other users</li>
                  <li>You won't receive any notifications</li>
                  <li>Your data will be safely preserved</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivate} className="bg-orange-600 hover:bg-orange-700">
              Deactivate Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Delete Account Permanently?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p className="font-medium text-foreground">This action cannot be undone. This will permanently delete your account and remove all your data from our servers.</p>
                <div className="space-y-2">
                  <p className="text-sm">Please type <strong className="font-mono text-foreground">{userEmail}</strong> to confirm:</p>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-delete" className="sr-only">
                      Confirm email
                    </Label>
                    <Input
                      id="confirm-delete"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder="Type your email to confirm"
                      className="font-mono"
                    />
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmationText("")}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={confirmationText !== userEmail}
            >
              I understand, delete my account
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
