"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../actions/auth";
import { LoginFormSchema } from "../lib/definitions";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-center text-2xl font-bold mb-4">Se connecter</h1>

        <form action={action} method="post" className="space-y-6">
          {/* progress */}
          <div className="flex items-center gap-2 justify-center">
            {steps.map((s, i) => (
              <div
                key={s.key}
                className={`h-2 w-8 rounded ${
                  i <= stepIndex ? "bg-indigo-600" : "bg-gray-200"
                }`}
              ></div>
            ))}
          </div>

          {/* visible field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {current.label}
            </label>
            <input
              autoFocus
              name={current.key}
              value={values[current.key]}
              onChange={onChange}
              type={current.type ?? "text"}
              placeholder={current.placeholder}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          </div>

          {/* hidden fields so final submit contains everything */}
          {Object.entries(values).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={onBack}
              disabled={stepIndex === 0}
              className="px-4 py-2 rounded-lg border disabled:opacity-50"
            >
              Retour
            </button>
            {stepIndex < steps.length - 1 ? (
              <button
                type="button"
                onClick={onNext}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                Suivant
              </button>
            ) : (
              <button
                type="submit"
                disabled={pending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                {pending ? "Connexion..." : "Se connecter"}
              </button>
            )}
          </div>

          {state?.message && <p className="text-green-600">{state.message}</p>}
          {state?.errors && (
            <div className="text-red-600 text-sm">
              {Object.entries(state.errors).map(([k, v]) => (
                <p key={k}>
                  {k}: {Array.isArray(v) ? v.join(", ") : v}
                </p>
              ))}
            </div>
          )}
        </form>
        <p>Pas encore de compte ? <Link href="/register">Créer un compte</Link></p>
      </div>
    </div>
  );
}
