import { useState } from "react";
import { ACCENT_PRESETS, type AccentColorId } from "~/lib/themes/accents";
import { useSettingsStore } from "~/lib/store";
import { getAccentLabel, useTranslation } from "~/lib/i18n";
import { haptic } from "~/lib/haptics";
import { showToast } from "~/lib/toast";
import { cn } from "~/lib/format";

export function AccentColorFab() {
  const { t, language } = useTranslation();
  const accent = useSettingsStore((s) => s.accentColor);
  const setAccent = useSettingsStore((s) => s.setAccentColor);
  const [open, setOpen] = useState(false);
  const current = ACCENT_PRESETS.find((p) => p.id === accent) ?? ACCENT_PRESETS[0]!;

  const pick = (id: AccentColorId) => {
    setAccent(id);
    setOpen(false);
    haptic("selection");
    showToast(t("toast.accentChanged", { name: getAccentLabel(id, language) }));
  };

  return (
    <div className="accent-fab-root pointer-events-none">
      {open && (
        <button
          type="button"
          className="accent-fab-backdrop pointer-events-auto"
          aria-label={t("settings.accentClose")}
          onClick={() => setOpen(false)}
        />
      )}

      <div className={cn("accent-fab-stack pointer-events-auto", open && "is-open")}>
        {open && (
          <div className="accent-picker-panel animate-accent-panel" role="listbox" aria-label={t("settings.accentPicker")}>
            <p className="accent-picker-title">{t("settings.accentPicker")}</p>
            <div className="accent-picker-grid">
              {ACCENT_PRESETS.map((preset, index) => (
                <button
                  key={preset.id}
                  type="button"
                  role="option"
                  aria-selected={accent === preset.id}
                  title={t(preset.labelKey as "settings.accentBlue")}
                  aria-label={t(preset.labelKey as "settings.accentBlue")}
                  className={cn(
                    "accent-swatch-btn animate-accent-pop",
                    accent === preset.id && "is-selected",
                  )}
                  style={{
                    backgroundColor: preset.swatch,
                    animationDelay: `${index * 22}ms`,
                  }}
                  onClick={() => pick(preset.id)}
                />
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          data-onboarding="accent-btn"
          aria-expanded={open}
          aria-label={t("settings.accentPicker")}
          className={cn("accent-fab-main bubble-fab", open && "is-open")}
          style={{ background: `var(--gradient-fab, ${current.swatch})` }}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={cn("accent-fab-icon", open && "rotate-45")} aria-hidden>
            {open ? "×" : "◐"}
          </span>
        </button>
      </div>
    </div>
  );
}
