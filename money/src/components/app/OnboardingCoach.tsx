import { useLayoutEffect, useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Button } from "~/components/ui/Button";
import { OverlayPortal } from "~/components/ui/OverlayPortal";
import { haptic } from "~/lib/haptics";
import { useTranslation } from "~/lib/i18n";
import type { TranslationKey } from "~/lib/i18n";
import { useSettingsStore } from "~/lib/store";

const STEPS: { target: string; titleKey: TranslationKey; descKey: TranslationKey }[] = [
  { target: '[data-onboarding="balance"]', titleKey: "onboarding.step1Title", descKey: "onboarding.step1Desc" },
  { target: '[data-onboarding="add-btn"]',  titleKey: "onboarding.step2Title", descKey: "onboarding.step2Desc" },
  { target: '[data-onboarding="accent-btn"]', titleKey: "onboarding.step3Title", descKey: "onboarding.step3Desc" },
];

const SPOT_PAD = 8;

function SpotlightPanels({ spot, onDismiss }: { spot: DOMRect; onDismiss: () => void }) {
  const top = spot.top - SPOT_PAD;
  const left = spot.left - SPOT_PAD;
  const width = spot.width + SPOT_PAD * 2;
  const height = spot.height + SPOT_PAD * 2;
  const right = left + width;
  const bottom = top + height;
  const panel = "onboarding-dim-panel";

  return (
    <>
      <button type="button" className={`${panel} onboarding-dim-top`} style={{ height: Math.max(0, top) }} onClick={onDismiss} aria-label="Skip" />
      <button type="button" className={`${panel} onboarding-dim-bottom`} style={{ top: bottom }} onClick={onDismiss} aria-label="Skip" />
      <button type="button" className={`${panel} onboarding-dim-left`} style={{ top, left: 0, width: Math.max(0, left), height }} onClick={onDismiss} aria-label="Skip" />
      <button type="button" className={`${panel} onboarding-dim-right`} style={{ top, left: right, right: 0, height }} onClick={onDismiss} aria-label="Skip" />
      <div
        className="onboarding-spotlight-ring pointer-events-none"
        style={{ top, left, width, height }}
      />
    </>
  );
}

export function OnboardingCoach() {
  const { t } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const done = useSettingsStore((s) => s.onboardingDone);
  const setDone = useSettingsStore((s) => s.setOnboardingDone);
  const [step, setStep] = useState(0);
  const [spot, setSpot] = useState<DOMRect | null>(null);

  const active = pathname === "/" && !done;
  const current = STEPS[step];

  useEffect(() => {
    if (!done) setStep(0);
  }, [done]);

  useLayoutEffect(() => {
    if (!active || !current) return;

    const update = () => {
      const el = document.querySelector(current.target);
      setSpot(el ? el.getBoundingClientRect() : null);
    };

    update();
    const timer = window.setTimeout(update, 120);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [active, step, current]);

  if (!active || !current || !spot) return null;

  const finish = () => {
    haptic("success");
    setDone(true);
  };

  const next = () => {
    haptic("light");
    if (step >= STEPS.length - 1) finish();
    else setStep((s) => s + 1);
  };

  const cardTop = spot.bottom + 14 + 120 > window.innerHeight
    ? Math.max(16, spot.top - 168)
    : spot.bottom + 14;

  const cardLeft = Math.max(16, Math.min(spot.left, window.innerWidth - 296));

  return (
    <OverlayPortal zIndex={200} align="center">
      <div className="pointer-events-none absolute inset-0" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
        <SpotlightPanels spot={spot} onDismiss={finish} />

        <div
          className="onboarding-card glass-card pointer-events-auto animate-scale-in"
          style={{ top: cardTop, left: cardLeft }}
        >
          <p className="onboarding-step-label">{t("onboarding.progress", { current: step + 1, total: STEPS.length })}</p>
          <h3 id="onboarding-title" className="text-title text-fg mb-1">{t(current.titleKey)}</h3>
          <p className="text-caption text-fg-muted mb-4 leading-relaxed">{t(current.descKey)}</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex-1" onClick={finish}>
              {t("onboarding.skip")}
            </Button>
            <Button size="sm" className="flex-1" onClick={next}>
              {step >= STEPS.length - 1 ? t("onboarding.done") : t("onboarding.next")}
            </Button>
          </div>
        </div>
      </div>
    </OverlayPortal>
  );
}
