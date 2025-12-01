"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "../actions/auth";
import { SignupFormSchema } from "../lib/definitions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

type StepKey =
  | "name"
  | "surname"
  | "username"
  | "email"
  | "password"
  | "confirmPassword";

const steps: {
  key: StepKey;
  label: string;
  type?: string;
  placeholder?: string;
}[] = [
  { key: "name", label: "Nom", placeholder: "Quel est votre nom ?" },
  { key: "surname", label: "Prénom", placeholder: "Quel est votre prénom ?" },
  {
    key: "username",
    label: "Nom d'utilisateur",
    placeholder: "Choisissez un nom d'utilisateur",
  },
  {
    key: "email",
    label: "Email",
    type: "email",
    placeholder: "Votre adresse e-mail",
  },
  {
    key: "password",
    label: "Mot de passe",
    type: "password",
    placeholder: "Choisissez un mot de passe",
  },
  {
    key: "confirmPassword",
    label: "Confirmer le mot de passe",
    type: "password",
    placeholder: "Confirmez votre mot de passe",
  },
];

export default function SignUpForm() {
  const [state, action, pending] = useActionState(signup, undefined);
  const router = useRouter();

  // when server action returns a redirect hint, navigate client-side
  useEffect(() => {
    if (state && (state as any).redirectTo) {
      try {
        const target = (state as any).redirectTo as string;
        if (target) router.push(target);
      } catch (e) {
        // ignore navigation errors — user can still control redirect manually
      }
    }
  }, [state, router]);

  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<Record<StepKey, string>>({
    name: "",
    surname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [suggestLoading, setSuggestLoading] = useState(false);

  const current = steps[stepIndex];

  const getFieldSchema = (key: StepKey) => {
    // @ts-ignore - using internal .shape of zod object
    return (SignupFormSchema as any).shape[key];
  };

  async function checkUsernameAvailable(username: string) {
    try {
      console.log('[checkUsernameAvailable] Checking:', username)
      const res = await fetch('/api/username/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      })
      const data = await res.json()
      console.log('[checkUsernameAvailable] Response:', data)
      return data?.available === true
    } catch (e) {
      console.error('[checkUsernameAvailable] Error:', e)
      return false
    }
  }

  async function checkEmailAvailable(email: string) {
    try {
      const res = await fetch('/api/email/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      return data?.available === true
    } catch (e) {
      return false
    }
  }

  async function validateField(key: StepKey, value: string) {
    setError(null)
    try {
      if (key === 'confirmPassword') {
        if (value !== values.password) throw new Error('Les mots de passe ne correspondent pas')
        return true
      }

      const schema = getFieldSchema(key)
      if (!schema) return true
      schema.parse(value)

      if (key === 'username') {
        // server-side uniqueness check
        const ok = await checkUsernameAvailable(value)
        if (!ok) {
          setError("Ce nom d'utilisateur est déjà pris")
          return false
        }
      }

      if (key === 'email') {
        // server-side uniqueness check for email
        const ok = await checkEmailAvailable(value)
        if (!ok) {
          setError('Cette adresse e-mail est déjà utilisée')
          return false
        }
      }

      return true
    } catch (e: any) {
      if (e?.issues && Array.isArray(e.issues)) {
        setError(e.issues.map((i: any) => i.message).join(' '))
      } else {
        setError(e.message || 'Valeur invalide')
      }
      return false
    }
  }

  async function onNext() {
    const val = values[current.key]
    const ok = await validateField(current.key, val)
    if (!ok) return
    setStepIndex((s) => Math.min(s + 1, steps.length - 1))
  }

  function onBack() {
    setError(null);
    setStepIndex((s) => Math.max(0, s - 1));
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setValues((prev) => ({ ...prev, [current.key]: v }))
    // clear suggestions when user types a custom username
    if (current.key === 'username') {
      setSuggestions(null)
      setError(null)
    }
  }

  async function fetchSuggestions() {
    if (!values.name && !values.surname) {
      console.log('[fetchSuggestions] Skipped: no name or surname')
      return
    }
    setSuggestLoading(true)
    setSuggestions(null)
    try {
      console.log('[fetchSuggestions] Fetching with:', { name: values.name, surname: values.surname })
      const res = await fetch('/api/username/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: values.name, surname: values.surname })
      })
      const data = await res.json()
      console.log('[fetchSuggestions] Response:', data)
      setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : [])
      console.log('[fetchSuggestions] Set suggestions to:', Array.isArray(data.suggestions) ? data.suggestions : [])
    } catch (e) {
      console.error('[fetchSuggestions] Error:', e)
      setSuggestions([])
    } finally {
      setSuggestLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <Card className="w-full max-w-md shadow-2xl border-slate-700 bg-slate-800">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
            Connectify
          </CardTitle>
          <CardDescription className="text-slate-300">
            Créez votre compte gratuitement
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form action={action} className="space-y-6">
            {/* progress bar */}
            <div className="flex items-center gap-1 justify-center">
              {steps.map((s, i) => (
                <div
                  key={s.key}
                  className={`h-1 flex-1 rounded transition-colors ${
                    i <= stepIndex ? "bg-indigo-500" : "bg-slate-600"
                  }`}
                ></div>
              ))}
            </div>

            {/* visible field */}
            <div className="space-y-2">
              <Label htmlFor={current.key} className="text-slate-200">
                {current.label}
              </Label>
              <Input
                autoFocus
                id={current.key}
                name={current.key}
                value={values[current.key]}
                onChange={onChange}
                type={current.type ?? "text"}
                placeholder={current.placeholder}
                className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500"
              />
              {error && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-300">{error}</AlertDescription>
                </Alert>
              )}

              {/* username suggestions - always available */}
              {current.key === "username" && (
                <div className="space-y-3 pt-2">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={fetchSuggestions}
                      disabled={suggestLoading || (!values.name && !values.surname)}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-indigo-500/50 text-indigo-300 hover:bg-indigo-600/20 hover:border-indigo-500"
                    >
                      {suggestLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {suggestLoading ? "Génération..." : "Suggérer"}
                    </Button>
                  </div>

                  {suggestions && suggestions.length > 0 && (
                    <div className="space-y-2 rounded-lg bg-indigo-900/20 border border-indigo-500/30 p-3">
                      <p className="text-xs text-indigo-300 font-medium">Suggestions disponibles :</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.map((s) => (
                          <Badge
                            key={s}
                            variant="secondary"
                            className="cursor-pointer hover:bg-indigo-600 hover:text-white transition bg-indigo-500/30 text-indigo-200 border-indigo-500/50"
                            onClick={() => {
                              setValues((p) => ({ ...p, username: s }));
                              setSuggestions(null);
                              setError(null);
                            }}
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-slate-400">Cliquez sur une suggestion pour la sélectionner</p>
                    </div>
                  )}

                  {suggestions?.length === 0 && !suggestLoading && (
                    <div className="rounded-lg bg-yellow-900/20 border border-yellow-600/30 p-3">
                      <p className="text-xs text-yellow-300">Aucune suggestion générée. Entrez manuellement un username.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* hidden fields */}
            {Object.entries(values).map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={v} />
            ))}

            <div className="flex justify-between gap-3">
              <Button
                type="button"
                onClick={onBack}
                disabled={stepIndex === 0}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Retour
              </Button>
              {stepIndex < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={onNext}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={pending}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
                >
                  {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {pending ? "Création..." : "Créer le compte"}
                </Button>
              )}
            </div>

            {state?.message && (
              <Alert className="bg-green-900/20 border-green-700">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-300">{state.message}</AlertDescription>
              </Alert>
            )}
            {state?.errors && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-700">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="text-red-300 text-sm space-y-1">
                    {Object.entries(state.errors).map(([k, v]) => (
                      <li key={k}>
                        <span className="font-medium">{k}:</span> {Array.isArray(v) ? v.join(", ") : v}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            Déjà inscrit ?{" "}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Se connecter
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
