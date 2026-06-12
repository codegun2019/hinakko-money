import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ThemeProvider } from "~/components/app/ThemeProvider";
import { AppShell } from "~/components/app/AppShell";
import { PwaProvider } from "~/components/pwa/PwaProvider";
import { OfflineFallback } from "~/components/pwa/OfflineFallback";
import { AppIcon } from "~/components/icons";
import { Icons } from "~/lib/icons";
import { isNetworkError } from "~/lib/network";
import { useTranslation } from "~/lib/i18n";
import globalsCss from "~/styles/globals.css?url";
import { THEME_BOOTSTRAP_INLINE } from "~/lib/themes/bootstrap-inline";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#EBEEF2" },
      { name: "description", content: "Cute mobile-first expense tracker" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "Hinakko" },
      { title: "Hinakko Expense" },
    ],
    links: [
      { rel: "stylesheet", href: globalsCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/icons/icon-32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/icons/icon-16.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&display=swap",
      },
    ],
  }),

  notFoundComponent: NotFoundPage,

  errorComponent: RouteErrorPage,

  shellComponent: RootDocument,
});

function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="flex h-full items-center justify-center pb-nav">
      <div className="text-center animate-fade-in px-4">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-muted">
          <AppIcon icon={Icons.action.search} size="xl" className="text-fg-muted" />
        </div>
        <p className="text-title text-fg">{t("error.notFoundTitle")}</p>
        <p className="text-caption text-fg-muted mt-1">{t("error.notFoundDesc")}</p>
      </div>
    </div>
  );
}

function RouteErrorPage({ error, reset }: { error: unknown; reset: () => void }) {
  const { t } = useTranslation();

  if (isNetworkError(error)) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-app">
        <OfflineFallback onRetry={reset} />
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center bg-app p-6 pb-nav">
      <div className="card-surface-elevated p-6 text-center max-w-sm animate-scale-in">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-coral-400/10">
          <span className="text-title text-coral-400" aria-hidden>!</span>
        </div>
        <p className="text-title text-fg mb-1">{t("error.genericTitle")}</p>
        <p className="text-caption text-fg-muted">{error instanceof Error ? error.message : t("error.unknown")}</p>
      </div>
    </div>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_INLINE }}
        />
      </head>
      <body>
        <div id="static-boot-splash" className="boot-splash boot-splash-static" aria-hidden="true">
          <div className="boot-splash-frame">
            <div className="boot-splash-logo boot-splash-logo-static" />
            <p className="boot-splash-title boot-splash-title-static">Hinakko</p>
          </div>
        </div>
        <ThemeProvider>
          <PwaProvider>
            <AppShell>
              <Outlet />
            </AppShell>
          </PwaProvider>
        </ThemeProvider>
        <Scripts />
        <div id="overlay-root" />
      </body>
    </html>
  );
}
