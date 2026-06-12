import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "~/lib/format";
import { haptic } from "~/lib/haptics";
import { Icons } from "~/lib/icons";
import { AppIcon } from "~/components/icons";
import { useTranslation } from "~/lib/i18n";
import { useSegmentIndicator } from "~/lib/useSegmentIndicator";
import { useSettingsStore } from "~/lib/store";
import { useUIStore } from "~/lib/ui-store";

interface NavItem {
  key:      string;
  to:       "/" | "/calendar" | "/add" | "/categories" | "/settings";
  labelKey: "nav.home" | "nav.calendar" | "nav.report" | "nav.settings";
  icon:     keyof typeof Icons.nav;
  isAction?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { key: "home",       to: "/",           labelKey: "nav.home",     icon: "home" },
  { key: "calendar",   to: "/calendar",   labelKey: "nav.calendar", icon: "calendar" },
  { key: "add",        to: "/add",        labelKey: "nav.home",     icon: "add",    isAction: true },
  { key: "categories", to: "/categories", labelKey: "nav.report",   icon: "report" },
  { key: "settings",   to: "/settings",   labelKey: "nav.settings", icon: "settings" },
];

function resolveActiveKey(pathname: string): string {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/calendar")) return "calendar";
  if (pathname.startsWith("/categories")) return "categories";
  if (pathname.startsWith("/settings")) return "settings";
  return "";
}

export function BottomNav() {
  const { t } = useTranslation();
  const { location } = useRouterState();
  const pathname = location.pathname;
  const activeKey = resolveActiveKey(pathname);
  const addFlow = useSettingsStore((s) => s.addFlow);
  const openQuickAdd = useUIStore((s) => s.openQuickAdd);
  const { containerRef, setItemRef, indicator } = useSegmentIndicator(activeKey);

  if (pathname === "/add" || pathname.startsWith("/edit")) return null;

  return (
    <nav className="nav-blur safe-bottom shrink-0" aria-label={t("nav.main")}>
      <div
        ref={containerRef}
        className="nav-pill-track relative flex items-end justify-around px-2 pt-1.5"
        style={{ minHeight: "var(--nav-bar-height)" }}
      >
        <span
          className="nav-active-pill"
          aria-hidden
          style={{
            left: indicator.left,
            top: indicator.top,
            width: indicator.width,
            height: indicator.height,
            opacity: activeKey ? indicator.opacity : 0,
          }}
        />

        {NAV_ITEMS.map(({ key, to, labelKey, icon, isAction }) => {
          const active = key === activeKey;
          const NavIcon = Icons.nav[icon];

          if (isAction) {
            if (addFlow === "quick") {
              return (
                <button
                  key={key}
                  type="button"
                  data-onboarding="add-btn"
                  onClick={() => {
                    haptic("medium");
                    openQuickAdd();
                  }}
                  className="nav-fab-link rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]"
                  aria-label={t("nav.add")}
                >
                  <span className="nav-fab-glow" aria-hidden />
                  <div className="nav-fab-btn">
                    <AppIcon icon={NavIcon} size="lg" className="text-white" strokeWidth={2.75} />
                  </div>
                </button>
              );
            }

            return (
              <Link
                key={key}
                to={to}
                data-onboarding="add-btn"
                onClick={() => haptic("medium")}
                className="nav-fab-link rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]"
                aria-label={t("nav.add")}
              >
                <span className="nav-fab-glow" aria-hidden />
                <div className="nav-fab-btn">
                  <AppIcon icon={NavIcon} size="lg" className="text-white" strokeWidth={2.75} />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={key}
              ref={setItemRef(key)}
              to={to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "nav-pill-item relative z-[1] flex min-h-[44px] min-w-[52px] flex-col items-center justify-end gap-0.5 rounded-2xl px-2.5 pb-1",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]",
                active && "nav-link-active",
              )}
            >
              <span className="nav-icon-wrap">
                <AppIcon
                  icon={NavIcon}
                  size="md"
                  strokeWidth={active ? 2.25 : 1.75}
                />
              </span>
              <span className="nav-label text-micro normal-case tracking-normal leading-none text-fg-muted">
                {t(labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
