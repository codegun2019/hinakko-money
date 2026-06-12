import { useEffect, useState } from "react";
import { getScrollContainer, subscribeScrollContainer } from "~/lib/scroll-container";
import { haptic } from "~/lib/haptics";
import { useTranslation } from "~/lib/i18n";
import { cn } from "~/lib/format";

export function ScrollToTopButton() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let attached: HTMLElement | null = null;

    const update = () => {
      const el = attached;
      if (!el) {
        setVisible(false);
        return;
      }
      const max = el.scrollHeight - el.clientHeight;
      if (max <= 80) {
        setVisible(false);
        return;
      }
      setVisible(el.scrollTop >= max * 0.45);
    };

    const bind = (el: HTMLElement | null) => {
      attached?.removeEventListener("scroll", update);
      attached = el;
      attached?.addEventListener("scroll", update, { passive: true });
      update();
    };

    bind(getScrollContainer());
    return subscribeScrollContainer(() => bind(getScrollContainer()));
  }, []);

  const scrollTop = () => {
    haptic("light");
    getScrollContainer()?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      aria-label={t("app.scrollToTop")}
      onClick={scrollTop}
      className={cn("scroll-top-btn", visible && "is-visible")}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
