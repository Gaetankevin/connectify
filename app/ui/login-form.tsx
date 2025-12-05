"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/app/actions/auth";
import { LoginFormSchema } from "@/app/lib/definitions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

type StepKey = "username_email" | "password";

const steps: {
  key: StepKey;
  label: string;
  type?: string;
  placeholder?: string;
}[] = [
  {
    key: "username_email",
    label: "Nom d'utilisateur ou email",
    placeholder: "Nom d'utilisateur ou email",
  },
  {
    key: "password",
    label: "Mot de passe",
    type: "password",
    placeholder: "Votre mot de passe",
  },
];

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const router = useRouter();

  useEffect(() => {
    if (state && (state as any).redirectTo) {
      const target = (state as any).redirectTo as string;
      if (target) router.push(target);
    }
  }, [state, router]);

  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<Record<StepKey, string>>({
    username_email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);

  const current = steps[stepIndex];

  const getFieldSchema = (key: StepKey) => {
    // access the zod shape for per-field validation
    // @ts-ignore
    return (LoginFormSchema as any).shape[key];
  };

  async function validateField(key: StepKey, value: string) {
    setError(null);
    try {
      const schema = getFieldSchema(key);
      if (!schema) return true;
      schema.parse(value);
      return true;
    } catch (e: any) {
      if (e?.issues && Array.isArray(e.issues)) {
        setError(e.issues.map((i: any) => i.message).join(" "));
      } else {
        setError(e.message || "Valeur invalide");
      }
      return false;
    }
  }

  async function onNext() {
    const val = values[current.key];
    const ok = await validateField(current.key, val);
    if (!ok) return;
    setStepIndex((s) => Math.min(s + 1, steps.length - 1));
  }

  function onBack() {
    setError(null);
    setStepIndex((s) => Math.max(0, s - 1));
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setValues((prev) => ({ ...prev, [current.key]: v }));
    setError(null);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <Card className="w-full max-w-md shadow-2xl border-slate-700 bg-slate-800">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
            Connectify
          </CardTitle>
          <CardDescription className="text-slate-300">
            Connectez-vous à votre compte
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
                  {pending ? "Connexion..." : "Se connecter"}
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
            Pas encore de compte ?{" "}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Créer un compte
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
