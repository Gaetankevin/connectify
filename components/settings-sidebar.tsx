"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  X,
  User,
  Mail,
  Save,
  LogOut,
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
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
                <TabsList className="m-4 w-auto bg-slate-800 border-slate-700">
                  <TabsTrigger
                    value="profile"
                    className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
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
              </Tabs>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default SettingsSidebar;
