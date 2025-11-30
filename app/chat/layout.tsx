import '../globals.css'

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This is a nested layout inside /chat. Do NOT render <html> or <body>
  // here — only the root `app/layout.tsx` should render them. Rendering
  // them here caused the hydration error "<html> cannot be a child of <body>".
  return (
    <>
      {/* Inline script to remove attributes some browser extensions inject
          (e.g. cz-shortcut-listen) before React hydrates to avoid
          hydration mismatch warnings in dev. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(() => {
            try {
              const attrs = ['cz-shortcut-listen'];
              if (typeof document !== 'undefined' && document.body) {
                attrs.forEach(a => document.body.hasAttribute(a) && document.body.removeAttribute(a));
              }
            } catch (e) { /* ignore */ }
          })();`,
        }}
      />
      {children}
    </>
  )
}