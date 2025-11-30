"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "../actions/auth";
import { SignupFormSchema } from "../lib/definitions";

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
      const res = await fetch('/api/username/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      })
      const data = await res.json()
      return data?.available === true
    } catch (e) {
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
    if (!values.name && !values.surname) return
    setSuggestLoading(true)
    setSuggestions(null)
    try {
      const res = await fetch('/api/username/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: values.name, surname: values.surname })
      })
      const data = await res.json()
      setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : [])
    } catch (e) {
      setSuggestions([])
    } finally {
      setSuggestLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-center text-2xl font-bold mb-4">Créer un compte</h1>

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
            {current.key === 'username' && (
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchSuggestions}
                    disabled={suggestLoading || (!values.name && !values.surname)}
                    className="px-3 py-1 bg-gray-100 rounded-md text-sm border"
                  >
                    {suggestLoading ? 'Génération...' : 'Suggérer des usernames'}
                  </button>
                  <p className="text-xs text-gray-500">ou entrez le vôtre</p>
                </div>

                {suggestions && suggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setValues((p) => ({ ...p, username: s }))
                          setSuggestions(null)
                          setError(null)
                        }}
                        className="text-sm px-3 py-1 bg-indigo-50 border rounded-full hover:bg-indigo-100"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
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
                {pending ? "Création..." : "Créer le compte"}
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
      </div>
    </div>
  );
}
