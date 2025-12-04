"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Progress } from "@/components/ui/progress";
import {
  Settings,
  X,
  User,
  Mail,
  Save,
  LogOut,
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  Ban,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    id: number;
    username: string;
    email: string;
    name: string;
    surname: string;
  };
  onLogout?: () => void;
}

export function SettingsSidebar({
  isOpen,
  onClose,
  user,
  onLogout,
}: SettingsSidebarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    surname: user?.surname || "",
    email: user?.email || "",
  });

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Danger zone states
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        surname: user.surname || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 20;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z\d]/.test(password)) strength += 15;
    return Math.min(strength, 100);
  };

  const getStrengthLabel = (strength: number): { text: string; color: string } => {
    if (strength < 40) return { text: "Faible", color: "text-red-600" };
    if (strength < 60) return { text: "Moyen", color: "text-orange-600" };
    if (strength < 80) return { text: "Bon", color: "text-yellow-600" };
    return { text: "Très fort", color: "text-green-600" };
  };

  const passwordRequirements = [
    { label: "Au moins 8 caractères", met: newPassword.length >= 8 },
    { label: "Contient une majuscule", met: /[A-Z]/.test(newPassword) },
    { label: "Contient une minuscule", met: /[a-z]/.test(newPassword) },
    { label: "Contient un chiffre", met: /\d/.test(newPassword) },
    { label: "Contient un caractère spécial", met: /[^a-zA-Z\d]/.test(newPassword) },
  ];

  const allPasswordRequirementsMet = passwordRequirements.every((req) => req.met);
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const canChangePassword = currentPassword && allPasswordRequirementsMet && passwordsMatch;

  const strength = getPasswordStrength(newPassword);
  const strengthInfo = getStrengthLabel(strength);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      toast.success("Profil mis à jour avec succès!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Impossible de mettre à jour le profil");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!canChangePassword) {
      setPasswordError("Veuillez remplir tous les champs correctement");
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to change password");
      }

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Mot de passe changé avec succès!");

      // Reset success message after 3 seconds
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de changer le mot de passe";
      setPasswordError(message);
      toast.error(message);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      const response = await fetch("/api/auth/deactivate", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to deactivate account");
      }

      toast.success("Compte désactivé");
      setDeactivateDialogOpen(false);
      // Redirect to login after deactivation
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    } catch (error) {
      toast.error("Impossible de désactiver le compte");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (confirmationText !== user?.email) {
      toast.error("Email ne correspond pas");
      return;
    }

    try {
      const response = await fetch("/api/auth/delete-account", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      toast.success("Compte supprimé");
      setDeleteDialogOpen(false);
      setConfirmationText("");
      // Redirect to login after deletion
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    } catch (error) {
      toast.error("Impossible de supprimer le compte");
      console.error(error);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-screen w-full max-w-sm bg-slate-900 shadow-xl md:max-w-md"
          >
            {/* Header */}
            <div className="border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-slate-100">Settings</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto h-full pb-20">
              <Tabs defaultValue="profile" className="w-full">
                {/* Tabs List */}
                <TabsList className="m-4 w-full grid grid-cols-3 bg-slate-800 border-slate-700">
                  <TabsTrigger
                    value="profile"
                    className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-xs"
                  >
                    <User className="w-4 h-4 mr-1" />
                    Profil
                  </TabsTrigger>
                  <TabsTrigger
                    value="password"
                    className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-xs"
                  >
                    <Lock className="w-4 h-4 mr-1" />
                    Mot de passe
                  </TabsTrigger>
                  <TabsTrigger
                    value="danger"
                    className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs"
                  >
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Danger
                  </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="p-4 space-y-4">
                  {/* Profile Preview */}
                  {!isEditing && (
                    <Card className="bg-slate-800 border-slate-700 p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 mx-auto">
                          <span className="text-white font-bold text-lg">
                            {user?.name?.charAt(0) || "U"}
                          </span>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-slate-100">
                            {user?.name} {user?.surname}
                          </p>
                          <p className="text-sm text-slate-400">
                            @{user?.username}
                          </p>
                        </div>
                        <div className="text-center text-sm text-slate-400">
                          <p>{user?.email}</p>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Edit Form */}
                  {isEditing && (
                    <Card className="bg-slate-800 border-slate-700 p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label
                            htmlFor="name"
                            className="text-slate-300 text-sm"
                          >
                            Prénom
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-500"
                            placeholder="Prénom"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="surname"
                            className="text-slate-300 text-sm"
                          >
                            Nom
                          </Label>
                          <Input
                            id="surname"
                            name="surname"
                            value={formData.surname}
                            onChange={handleInputChange}
                            className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-500"
                            placeholder="Nom"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-slate-300 text-sm flex items-center gap-2"
                        >
                          <Mail className="w-4 h-4" />
                          Email
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-500"
                          placeholder="Adresse email"
                        />
                      </div>
                    </Card>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-4">
                    {!isEditing ? (
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
                      >
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                          onClick={() => setIsEditing(false)}
                          variant="outline"
                          className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Logout Button */}
                  <div className="pt-4 border-t border-slate-700">
                    <Button
                      onClick={onLogout}
                      variant="outline"
                      className="w-full border-red-600/50 text-red-400 hover:bg-red-600/10 hover:text-red-300"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </TabsContent>

                {/* Password Change Tab */}
                <TabsContent value="password" className="p-4 space-y-4">
                  <Card className="bg-slate-800 border-slate-700 p-4">
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      {/* Current Password */}
                      <div className="space-y-2">
                        <Label htmlFor="current-password" className="text-slate-300">
                          Mot de passe actuel
                        </Label>
                        <div className="relative">
                          <Input
                            id="current-password"
                            type={showCurrent ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Entrez votre mot de passe actuel"
                            className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-500 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-slate-400"
                            onClick={() => setShowCurrent(!showCurrent)}
                          >
                            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div className="space-y-2">
                        <Label htmlFor="new-password" className="text-slate-300">
                          Nouveau mot de passe
                        </Label>
                        <div className="relative">
                          <Input
                            id="new-password"
                            type={showNew ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Entrez votre nouveau mot de passe"
                            className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-500 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-slate-400"
                            onClick={() => setShowNew(!showNew)}
                          >
                            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>

                        {newPassword && (
                          <div className="space-y-2 mt-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-400">Force:</span>
                              <span className={`font-medium ${strengthInfo.color}`}>{strengthInfo.text}</span>
                            </div>
                            <Progress value={strength} className="h-2" />
                          </div>
                        )}

                        {newPassword && (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm font-medium text-slate-300">Exigences:</p>
                            {passwordRequirements.map((req, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                {req.met ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <X className="h-4 w-4 text-slate-500" />
                                )}
                                <span className={req.met ? "text-slate-100" : "text-slate-400"}>
                                  {req.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-slate-300">
                          Confirmez le mot de passe
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirm-password"
                            type={showConfirm ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirmez votre nouveau mot de passe"
                            className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-500 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-slate-400"
                            onClick={() => setShowConfirm(!showConfirm)}
                          >
                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        {confirmPassword && !passwordsMatch && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            Les mots de passe ne correspondent pas
                          </p>
                        )}
                        {confirmPassword && passwordsMatch && (
                          <p className="text-sm text-green-600 flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Les mots de passe correspondent
                          </p>
                        )}
                      </div>

                      {/* Error Alert */}
                      {passwordError && (
                        <Alert className="border-red-600/50 bg-red-900/20">
                          <AlertDescription className="text-red-400 text-sm">
                            {passwordError}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Success Alert */}
                      {passwordSuccess && (
                        <Alert className="border-green-600/50 bg-green-900/20">
                          <Check className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-400 text-sm">
                            Mot de passe changé avec succès!
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={!canChangePassword || changingPassword}
                        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
                      >
                        {changingPassword ? "Changement..." : "Changer le mot de passe"}
                      </Button>
                    </form>
                  </Card>
                </TabsContent>

                {/* Danger Zone Tab */}
                <TabsContent value="danger" className="p-4 space-y-4">
                  <Alert className="border-red-600/50 bg-red-900/20 mb-4">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-400 text-sm">
                      Actions permanentes et irréversibles. Procédez avec prudence.
                    </AlertDescription>
                  </Alert>

                  {/* Deactivate Account */}
                  <Card className="border-orange-600/30 bg-orange-900/20 p-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Ban className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-orange-100 mb-1">
                            Désactiver le compte
                          </h3>
                          <p className="text-sm text-orange-200 mb-3">
                            Désactivez temporairement votre compte. Vous pouvez le réactiver en vous reconnectant.
                          </p>
                          <ul className="text-sm text-orange-200 space-y-1 list-disc list-inside">
                            <li>Votre profil sera caché</li>
                            <li>Vos données seront préservées</li>
                            <li>Réactivez dans les 30 jours</li>
                          </ul>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setDeactivateDialogOpen(true)}
                        className="w-full border-orange-600/50 text-orange-400 hover:bg-orange-900/30"
                      >
                        Désactiver le compte
                      </Button>
                    </div>
                  </Card>

                  {/* Delete Account */}
                  <Card className="border-red-600/30 bg-red-900/20 p-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Trash2 className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-red-100 mb-1">
                            Supprimer le compte définitivement
                          </h3>
                          <p className="text-sm text-red-200 mb-3">
                            Une fois supprimé, il n'y a pas de retour. Cette action est permanente.
                          </p>
                          <ul className="text-sm text-red-200 space-y-1 list-disc list-inside">
                            <li>Toutes vos données seront supprimées</li>
                            <li>Votre nom d'utilisateur sera disponible</li>
                            <li>Cette action est irréversible</li>
                          </ul>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={() => setDeleteDialogOpen(true)}
                        className="w-full"
                      >
                        Supprimer le compte
                      </Button>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-100">
              Êtes-vous sûr de vouloir désactiver votre compte?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-slate-300">
                <p>Votre compte sera temporairement désactivé. Vous pouvez le réactiver en vous reconnectant dans les 30 jours.</p>
                <p className="font-medium">Pendant la désactivation:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Votre profil sera caché des autres utilisateurs</li>
                  <li>Vous ne recevrez pas de notifications</li>
                  <li>Vos données seront préservées</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Désactiver le compte
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">
              Supprimer le compte définitivement?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-slate-300">
                <p className="font-medium text-slate-100">
                  Cette action est irréversible. Toutes vos données seront supprimées de nos serveurs.
                </p>
                <div className="space-y-2">
                  <p className="text-sm">
                    Veuillez taper <strong className="font-mono text-slate-100">{user?.email}</strong> pour confirmer:
                  </p>
                  <Input
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder="Entrez votre email pour confirmer"
                    className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-500 font-mono"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setConfirmationText("")}
              className="bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600"
            >
              Annuler
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={confirmationText !== user?.email}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer mon compte
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default SettingsSidebar;
