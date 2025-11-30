import './globals.css'
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
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
      </body>
    </html>
  )
}