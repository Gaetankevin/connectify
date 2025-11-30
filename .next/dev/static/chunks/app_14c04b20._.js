(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/lib/definitions.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SignupFormSchema",
    ()=>SignupFormSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/schemas.js [app-client] (ecmascript)");
;
const SignupFormSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["object"]({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["string"]().min(2, {
        message: "Name must be at least 2 characters long"
    }).max(50, {
        message: "Name must be at most 50 characters long"
    }).trim(),
    surname: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["string"]().min(2, {
        message: "Surname must be at least 2 characters long"
    }).max(50, {
        message: "Surname must be at most 50 characters long"
    }).trim(),
    username: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["string"]().min(3, {
        message: "Username must be at least 3 characters long"
    }).max(30, {
        message: "Username must be at most 30 characters long"
    }).regex(/^[a-zA-Z0-9_]+$/, {
        message: "Username can only contain letters, numbers, and underscores."
    }).trim(),
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["email"]({
        message: "Invalid email address"
    }),
    password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["string"]().min(8, {
        message: "Password must be at least 8 characters long"
    }).regex(/[a-zA-Z]/, {
        message: "Contain at least one letter."
    }).regex(/[0-9]/, {
        message: "Contain at least one number."
    }).regex(/[^a-zA-Z0-9]/, {
        message: "Contain at least one special character."
    }).trim(),
    confirmPassword: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["string"]()
}).refine(_c = (data)=>data.password === data.confirmPassword, {
    path: [
        "confirmPassword"
    ],
    message: "Passwords do not match"
});
_c1 = SignupFormSchema;
const LoginFormSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["object"]({
    username_email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["string"]().min(1, {
        message: "Username or email is required"
    }).trim(),
    password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$schemas$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["string"]().min(1, {
        message: "Password is required"
    }).trim()
});
var _c, _c1;
__turbopack_context__.k.register(_c, 'SignupFormSchema$z\n  .object({\n    name: z\n      .string()\n      .min(2, { message: "Name must be at least 2 characters long" })\n      .max(50, { message: "Name must be at most 50 characters long" })\n      .trim(),\n    surname: z\n      .string()\n      .min(2, { message: "Surname must be at least 2 characters long" })\n      .max(50, { message: "Surname must be at most 50 characters long" })\n      .trim(),\n    username: z\n      .string()\n      .min(3, { message: "Username must be at least 3 characters long" })\n      .max(30, { message: "Username must be at most 30 characters long" })\n      .regex(/^[a-zA-Z0-9_]+$/, {\n        message: "Username can only contain letters, numbers, and underscores.",\n      })\n      .trim(),\n    email: z.email({ message: "Invalid email address" }),\n    password: z\n      .string()\n      .min(8, { message: "Password must be at least 8 characters long" })\n      .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })\n      .regex(/[0-9]/, { message: "Contain at least one number." })\n      .regex(/[^a-zA-Z0-9]/, {\n        message: "Contain at least one special character.",\n      })\n      .trim(),\n    confirmPassword: z.string(),\n  })\n  .refine');
__turbopack_context__.k.register(_c1, "SignupFormSchema");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/ui/login-form.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LoginForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$definitions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/definitions.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const steps = [
    {
        key: "username_email",
        label: "Nom d'utilisateur",
        placeholder: "Choisissez un nom d'utilisateur"
    },
    {
        key: "password",
        label: "Mot de passe",
        type: "password",
        placeholder: "Choisissez un mot de passe"
    }
];
function LoginForm() {
    _s();
    const [state, action, pending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useActionState"])(signup, undefined);
    const [stepIndex, setStepIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [values, setValues] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        username_email: "",
        password: ""
    });
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [suggestions, setSuggestions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [suggestLoading, setSuggestLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const current = steps[stepIndex];
    const getFieldSchema = (key)=>{
        // @ts-ignore - using internal .shape of zod object
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$definitions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SignupFormSchema"].shape[key];
    };
    async function checkUsernameAvailable(username) {
        try {
            const res = await fetch('/api/username/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username
                })
            });
            const data = await res.json();
            return data?.available === true;
        } catch (e) {
            return false;
        }
    }
    async function checkEmailAvailable(email) {
        try {
            const res = await fetch('/api/email/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email
                })
            });
            const data = await res.json();
            return data?.available === true;
        } catch (e) {
            return false;
        }
    }
    async function validateField(key, value) {
        setError(null);
        try {
            const schema = getFieldSchema(key);
            if (!schema) return true;
            schema.parse(value);
            if (key === 'username_email') {
                // server-side uniqueness check
                const ok = await checkUsernameAvailable(value);
                if (!ok) {
                    setError("Ce nom d'utilisateur est déjà pris");
                    return false;
                }
            }
            return true;
        } catch (e) {
            if (e?.issues && Array.isArray(e.issues)) {
                setError(e.issues.map((i)=>i.message).join(' '));
            } else {
                setError(e.message || 'Valeur invalide');
            }
            return false;
        }
    }
    async function onNext() {
        const val = values[current.key];
        const ok = await validateField(current.key, val);
        if (!ok) return;
        setStepIndex((s)=>Math.min(s + 1, steps.length - 1));
    }
    function onBack() {
        setError(null);
        setStepIndex((s)=>Math.max(0, s - 1));
    }
    function onChange(e) {
        const v = e.target.value;
        setValues((prev)=>({
                ...prev,
                [current.key]: v
            }));
        // clear suggestions when user types a custom username
        if (current.key === 'username_email') {
            setSuggestions(null);
            setError(null);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen flex items-center justify-center bg-gray-50 p-6",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full max-w-md bg-white rounded-2xl shadow-lg p-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-center text-2xl font-bold mb-4",
                    children: "Créer un compte"
                }, void 0, false, {
                    fileName: "[project]/app/ui/login-form.tsx",
                    lineNumber: 135,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    action: action,
                    method: "post",
                    className: "space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2 justify-center",
                            children: steps.map((s, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `h-2 w-8 rounded ${i <= stepIndex ? "bg-indigo-600" : "bg-gray-200"}`
                                }, s.key, false, {
                                    fileName: "[project]/app/ui/login-form.tsx",
                                    lineNumber: 141,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/app/ui/login-form.tsx",
                            lineNumber: 139,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium text-gray-700 mb-2",
                                    children: current.label
                                }, void 0, false, {
                                    fileName: "[project]/app/ui/login-form.tsx",
                                    lineNumber: 152,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    autoFocus: true,
                                    name: current.key,
                                    value: values[current.key],
                                    onChange: onChange,
                                    type: current.type ?? "text",
                                    placeholder: current.placeholder,
                                    className: "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                }, void 0, false, {
                                    fileName: "[project]/app/ui/login-form.tsx",
                                    lineNumber: 155,
                                    columnNumber: 13
                                }, this),
                                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-red-600 text-sm mt-2",
                                    children: error
                                }, void 0, false, {
                                    fileName: "[project]/app/ui/login-form.tsx",
                                    lineNumber: 164,
                                    columnNumber: 23
                                }, this),
                                current.key === 'username_email' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-gray-500",
                                                children: "ou entrez le vôtre"
                                            }, void 0, false, {
                                                fileName: "[project]/app/ui/login-form.tsx",
                                                lineNumber: 169,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/ui/login-form.tsx",
                                            lineNumber: 167,
                                            columnNumber: 17
                                        }, this),
                                        suggestions && suggestions.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-2 flex flex-wrap gap-2",
                                            children: suggestions.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>{
                                                        setValues((p)=>({
                                                                ...p,
                                                                username: s
                                                            }));
                                                        setSuggestions(null);
                                                        setError(null);
                                                    },
                                                    className: "text-sm px-3 py-1 bg-indigo-50 border rounded-full hover:bg-indigo-100",
                                                    children: s
                                                }, s, false, {
                                                    fileName: "[project]/app/ui/login-form.tsx",
                                                    lineNumber: 175,
                                                    columnNumber: 23
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/ui/login-form.tsx",
                                            lineNumber: 173,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/ui/login-form.tsx",
                                    lineNumber: 166,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/ui/login-form.tsx",
                            lineNumber: 151,
                            columnNumber: 11
                        }, this),
                        Object.entries(values).map(([k, v])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "hidden",
                                name: k,
                                value: v
                            }, k, false, {
                                fileName: "[project]/app/ui/login-form.tsx",
                                lineNumber: 196,
                                columnNumber: 13
                            }, this)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: onBack,
                                    disabled: stepIndex === 0,
                                    className: "px-4 py-2 rounded-lg border disabled:opacity-50",
                                    children: "Retour"
                                }, void 0, false, {
                                    fileName: "[project]/app/ui/login-form.tsx",
                                    lineNumber: 200,
                                    columnNumber: 13
                                }, this),
                                stepIndex < steps.length - 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: onNext,
                                    className: "px-4 py-2 bg-indigo-600 text-white rounded-lg",
                                    children: "Suivant"
                                }, void 0, false, {
                                    fileName: "[project]/app/ui/login-form.tsx",
                                    lineNumber: 209,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    disabled: pending,
                                    className: "px-4 py-2 bg-indigo-600 text-white rounded-lg",
                                    children: pending ? "Création..." : "Créer le compte"
                                }, void 0, false, {
                                    fileName: "[project]/app/ui/login-form.tsx",
                                    lineNumber: 217,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/ui/login-form.tsx",
                            lineNumber: 199,
                            columnNumber: 11
                        }, this),
                        state?.message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-green-600",
                            children: state.message
                        }, void 0, false, {
                            fileName: "[project]/app/ui/login-form.tsx",
                            lineNumber: 227,
                            columnNumber: 30
                        }, this),
                        state?.errors && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-red-600 text-sm",
                            children: Object.entries(state.errors).map(([k, v])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: [
                                        k,
                                        ": ",
                                        Array.isArray(v) ? v.join(", ") : v
                                    ]
                                }, k, true, {
                                    fileName: "[project]/app/ui/login-form.tsx",
                                    lineNumber: 231,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/app/ui/login-form.tsx",
                            lineNumber: 229,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/ui/login-form.tsx",
                    lineNumber: 137,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/ui/login-form.tsx",
            lineNumber: 134,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/ui/login-form.tsx",
        lineNumber: 133,
        columnNumber: 5
    }, this);
}
_s(LoginForm, "W9wh9WabFtbUKheuJddtkWSeDDY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useActionState"]
    ];
});
_c = LoginForm;
var _c;
__turbopack_context__.k.register(_c, "LoginForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_14c04b20._.js.map