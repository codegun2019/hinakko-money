import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { RecurringSheet } from "~/components/recurring/RecurringSheet";
import { BudgetSheet } from "~/components/budget/BudgetSheet";
import { PageLayout } from "~/components/app/PageLayout";
import { MobileHeader } from "~/components/app/MobileHeader";
import { Card } from "~/components/ui/Card";
import { ConfirmDialog } from "~/components/ui/ConfirmDialog";
import { BottomSheet, SheetOption } from "~/components/ui/BottomSheet";
import { AppIcon } from "~/components/icons";
import { clearAllTransactions, importTransactions, listAllTransactions } from "~/db/queries/transactions";
import {
  downloadFile,
  exportFilename,
  transactionsToCSV,
  transactionsToJSON,
} from "~/lib/export";
import {
  getAccentLabel,
  getAddFlowLabel,
  getCurrencyLabel,
  getLanguageLabel,
  getTemplateLabel,
  getThemeLabel,
  useTranslation,
} from "~/lib/i18n";
import {
  ADD_FLOW_OPTIONS,
  CURRENCY_OPTIONS,
  LANGUAGE_OPTIONS,
  THEME_OPTIONS,
  type AddFlowMode,
  type CurrencyCode,
  type LanguageCode,
} from "~/lib/settings";
import { parseImportJSON } from "~/lib/import";
import { ACCENT_PRESETS, THEME_TEMPLATES } from "~/lib/themes";
import { Icons } from "~/lib/icons";
import { showToast, showErrorToast } from "~/lib/toast";
import { useSettingsStore } from "~/lib/store";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

type Sheet = "theme" | "template" | "accent" | "currency" | "language" | "export" | "import" | "budget" | "recurring" | "addFlow" | null;

function SettingsPage() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const router   = useRouter();

  const theme    = useSettingsStore((s) => s.theme);
  const template = useSettingsStore((s) => s.template);
  const accentColor = useSettingsStore((s) => s.accentColor);
  const currency = useSettingsStore((s) => s.currency);
  const setTheme     = useSettingsStore((s) => s.setTheme);
  const setTemplate  = useSettingsStore((s) => s.setTemplate);
  const setAccentColor = useSettingsStore((s) => s.setAccentColor);
  const setCurrency  = useSettingsStore((s) => s.setCurrency);
  const setLanguage  = useSettingsStore((s) => s.setLanguage);
  const setOnboardingDone = useSettingsStore((s) => s.setOnboardingDone);
  const addFlow = useSettingsStore((s) => s.addFlow);
  const setAddFlow = useSettingsStore((s) => s.setAddFlow);

  const [sheet, setSheet]           = useState<Sheet>(null);
  const [exporting, setExporting]   = useState(false);
  const [importing, setImporting]   = useState(false);
  const [clearOpen, setClearOpen]   = useState(false);
  const [clearing, setClearing]     = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const closeSheet = () => setSheet(null);

  const handleExport = async (format: "json" | "csv") => {
    setExporting(true);
    try {
      const txs = await listAllTransactions();
      if (format === "json") {
        await downloadFile(transactionsToJSON(txs), exportFilename("json"), "application/json");
      } else {
        await downloadFile(transactionsToCSV(txs, language), exportFilename("csv"), "text/csv;charset=utf-8");
      }
      closeSheet();
    } finally {
      setExporting(false);
    }
  };

  const handleImportFile = async (file: File) => {
    setImporting(true);
    try {
      const text = await file.text();
      const { items, skipped } = parseImportJSON(text);
      const result = await importTransactions({ data: { items } });
      await router.invalidate();
      closeSheet();
      showToast(t("settings.importSuccess", { imported: result.imported, skipped }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg === "INVALID_FORMAT") showErrorToast(t("settings.importInvalidFormat"));
      else if (msg === "NO_VALID_ROWS") showErrorToast(t("settings.importNoValidRows"));
      else showErrorToast(t("settings.importFailed"));
    } finally {
      setImporting(false);
      if (importInputRef.current) importInputRef.current.value = "";
    }
  };

  const handleClearData = async () => {
    setClearing(true);
    try {
      await clearAllTransactions();
      await router.invalidate();
      setClearOpen(false);
      void navigate({ to: "/" });
    } finally {
      setClearing(false);
    }
  };

  const handleReplayTutorial = () => {
    setOnboardingDone(false);
    showToast(t("toast.tutorialReplay"), "info");
    void navigate({ to: "/" });
  };

  return (
    <PageLayout header={<MobileHeader title={t("settings.title")} />}>
      <div className="px-4 py-4 space-y-5">
        <div className="banking-profile-card glass-card liquid-glass flex items-center gap-4 px-5 py-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-mint-500/15 ring-1 ring-mint-500/20">
            <AppIcon icon={Icons.brand.cat} size="lg" className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-title text-fg">{t("settings.appName")}</p>
            <p className="text-caption text-fg-muted">{t("settings.appTagline")}</p>
          </div>
        </div>

        <section>
          <p className="text-label text-fg-muted mb-2 px-1 leading-snug">{t("settings.preferences")}</p>
          <Card padding="none" className="overflow-hidden divide-y divide-fg">
            <SettingsRow icon={Icons.settings.theme}     label={t("settings.theme")}    hint={getThemeLabel(theme, language)}             onClick={() => setSheet("theme")} />
            <SettingsRow icon={Icons.settings.template}  label={t("settings.template")} hint={getTemplateLabel(template, language)}       onClick={() => setSheet("template")} />
            <SettingsRow icon={Icons.settings.accent}    label={t("settings.accentColor")} hint={getAccentLabel(accentColor, language)} onClick={() => setSheet("accent")} />
            <SettingsRow icon={Icons.settings.currency}  label={t("settings.currency")} hint={getCurrencyLabel(currency, language)}       onClick={() => setSheet("currency")} />
            <SettingsRow icon={Icons.settings.language}  label={t("settings.language")} hint={getLanguageLabel(language)}                  onClick={() => setSheet("language")} />
            <SettingsRow icon={Icons.action.plus}        label={t("settings.addFlow")}  hint={getAddFlowLabel(addFlow, language)}         onClick={() => setSheet("addFlow")} />
          </Card>
        </section>

        <section>
          <p className="text-label text-fg-muted mb-2 px-1">{t("settings.data")}</p>
          <Card padding="none" className="overflow-hidden divide-y divide-fg">
            <SettingsRow icon={Icons.settings.budget} label={t("budget.settingsLabel")} hint={t("budget.settingsHint")} onClick={() => setSheet("budget")} />
            <SettingsRow icon={Icons.settings.recurring} label={t("recurring.settingsLabel")} hint={t("recurring.settingsHint")} onClick={() => setSheet("recurring")} />
            <SettingsRow icon={Icons.settings.export} label={t("settings.export")}    hint={t("settings.exportHint")} onClick={() => setSheet("export")} />
            <SettingsRow icon={Icons.settings.json}   label={t("settings.import")}    hint={t("settings.importHint")} onClick={() => setSheet("import")} />
            <SettingsRow icon={Icons.settings.clear}  label={t("settings.clear")} hint=""           onClick={() => setClearOpen(true)} danger />
          </Card>
        </section>

        <section>
          <p className="text-label text-fg-muted mb-2 px-1">{t("settings.about")}</p>
          <Card padding="none" className="overflow-hidden divide-y divide-fg">
            <SettingsRow icon={Icons.settings.tutorial} label={t("settings.replayTutorial")} hint={t("settings.replayTutorialHint")} onClick={handleReplayTutorial} />
            <SettingsRow icon={Icons.settings.version}   label={t("settings.version")} hint="0.4.0" />
            <SettingsRow icon={Icons.settings.feedback}  label={t("settings.feedback")}    hint="" />
          </Card>
        </section>
      </div>

      <BudgetSheet
        open={sheet === "budget"}
        onClose={closeSheet}
        onChanged={() => { void router.invalidate(); }}
      />

      <RecurringSheet
        open={sheet === "recurring"}
        onClose={closeSheet}
        onChanged={() => { void router.invalidate(); }}
      />

      <BottomSheet open={sheet === "theme"} onClose={closeSheet} title={t("settings.themeSheetTitle")} description={t("settings.themeSheetDesc")}>
        <div className="flex flex-col gap-2 pb-2">
          {THEME_OPTIONS.map(({ value, labelKey }) => (
            <SheetOption
              key={value}
              selected={theme === value}
              label={t(labelKey as "settings.themeLight")}
              onClick={() => { setTheme(value); closeSheet(); }}
            />
          ))}
        </div>
      </BottomSheet>

      <BottomSheet open={sheet === "template"} onClose={closeSheet} title={t("settings.templateSheetTitle")} description={t("settings.templateSheetDesc")}>
        <div className="flex flex-col gap-2 pb-2">
          {THEME_TEMPLATES.map((tpl) => (
            <TemplateOption
              key={tpl.id}
              selected={template === tpl.id}
              label={t(tpl.labelKey as "settings.templateDefault")}
              description={t(tpl.descKey as "settings.templateDefaultDesc")}
              preview={tpl.preview}
              onClick={() => { setTemplate(tpl.id); closeSheet(); }}
            />
          ))}
        </div>
      </BottomSheet>

      <BottomSheet open={sheet === "accent"} onClose={closeSheet} title={t("settings.accentSheetTitle")} description={t("settings.accentSheetDesc")}>
        <div className="grid grid-cols-4 gap-2.5 pb-2 sm:grid-cols-6">
          {ACCENT_PRESETS.map((preset) => {
            const selected = accentColor === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setAccentColor(preset.id);
                  showToast(t("toast.accentChanged", { name: getAccentLabel(preset.id, language) }));
                  closeSheet();
                }}
                className={`flex flex-col items-center gap-2 rounded-xl border px-2 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500/40 ${
                  selected
                    ? "border-mint-500/30 bg-mint-500/10"
                    : "border-app bg-card active:bg-surface-muted"
                }`}
              >
                <span
                  className={`h-10 w-10 rounded-full border-2 border-surface shadow-md ${
                    selected ? "outline outline-2 outline-offset-2 outline-fg" : ""
                  }`}
                  style={{ backgroundColor: preset.swatch }}
                  aria-hidden
                />
                <span className="text-caption font-medium text-fg text-center leading-tight">
                  {t(preset.labelKey as "settings.accentBlue")}
                </span>
              </button>
            );
          })}
        </div>
      </BottomSheet>

      <BottomSheet open={sheet === "currency"} onClose={closeSheet} title={t("settings.currencySheetTitle")} description={t("settings.currencySheetDesc")}>
        <div className="flex flex-col gap-2 pb-2">
          {CURRENCY_OPTIONS.map(({ code, labelKey }) => (
            <SheetOption
              key={code}
              selected={currency === code}
              label={t(labelKey as "settings.currencyTHB")}
              onClick={() => { setCurrency(code as CurrencyCode); closeSheet(); }}
            />
          ))}
        </div>
      </BottomSheet>

      <BottomSheet open={sheet === "language"} onClose={closeSheet} title={t("settings.languageSheetTitle")} description={t("settings.languageSheetDesc")}>
        <div className="flex flex-col gap-2 pb-2">
          {LANGUAGE_OPTIONS.map(({ value, labelKey }) => (
            <SheetOption
              key={value}
              selected={language === value}
              label={t(labelKey as "settings.langTh")}
              onClick={() => { setLanguage(value as LanguageCode); closeSheet(); }}
            />
          ))}
        </div>
      </BottomSheet>

      <BottomSheet open={sheet === "addFlow"} onClose={closeSheet} title={t("settings.addFlowSheetTitle")} description={t("settings.addFlowSheetDesc")}>
        <div className="flex flex-col gap-2 pb-2">
          {ADD_FLOW_OPTIONS.map(({ value, labelKey }) => (
            <SheetOption
              key={value}
              selected={addFlow === value}
              label={t(labelKey as "settings.addFlowQuick")}
              onClick={() => { setAddFlow(value as AddFlowMode); closeSheet(); }}
            />
          ))}
        </div>
      </BottomSheet>

      <BottomSheet open={sheet === "import"} onClose={closeSheet} title={t("settings.importJsonTitle")} description={t("settings.importJsonDesc")}>
        <div className="flex flex-col gap-2 pb-2">
          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleImportFile(file);
            }}
          />
          <button
            type="button"
            disabled={importing}
            onClick={() => importInputRef.current?.click()}
            className="flex min-h-[48px] items-center gap-3 rounded-xl border border-app bg-card px-4 active:bg-surface-muted transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500/40"
          >
            <AppIcon icon={Icons.settings.json} size="md" className="text-fg-muted" />
            <div className="text-left min-w-0">
              <p className="text-body font-semibold text-fg">{t("settings.importJsonTitle")}</p>
              <p className="text-caption text-fg-muted">{importing ? t("common.loading") : t("settings.importJsonDesc")}</p>
            </div>
          </button>
        </div>
      </BottomSheet>

      <BottomSheet open={sheet === "export"} onClose={closeSheet} title={t("settings.exportSheetTitle")} description={t("settings.exportSheetDesc")}>
        <div className="flex flex-col gap-2 pb-2">
          <button
            type="button"
            disabled={exporting}
            onClick={() => { void handleExport("json"); }}
            className="flex min-h-[48px] items-center gap-3 rounded-xl border border-app bg-card px-4 active:bg-surface-muted transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500/40"
          >
            <AppIcon icon={Icons.settings.json} size="md" className="text-fg-muted" />
            <div className="text-left min-w-0">
              <p className="text-body font-semibold text-fg">{t("settings.exportJsonTitle")}</p>
              <p className="text-caption text-fg-muted">{t("settings.exportJsonDesc")}</p>
            </div>
          </button>
          <button
            type="button"
            disabled={exporting}
            onClick={() => { void handleExport("csv"); }}
            className="flex min-h-[48px] items-center gap-3 rounded-xl border border-app bg-card px-4 active:bg-surface-muted transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500/40"
          >
            <AppIcon icon={Icons.settings.csv} size="md" className="text-fg-muted" />
            <div className="text-left min-w-0">
              <p className="text-body font-semibold text-fg">{t("settings.exportCsvTitle")}</p>
              <p className="text-caption text-fg-muted">{t("settings.exportCsvDesc")}</p>
            </div>
          </button>
        </div>
      </BottomSheet>

      <ConfirmDialog
        open={clearOpen}
        title={t("settings.clearTitle")}
        description={t("settings.clearDesc")}
        confirmLabel={t("settings.clearConfirm")}
        cancelLabel={t("common.cancel")}
        loading={clearing}
        onCancel={() => !clearing && setClearOpen(false)}
        onConfirm={() => { void handleClearData(); }}
      />
    </PageLayout>
  );
}

function TemplateOption({
  selected,
  label,
  description,
  preview,
  onClick,
}: {
  selected: boolean;
  label: string;
  description: string;
  preview: { bg: string; surface: string; primary: string };
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full min-h-[56px] items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500/40 ${
        selected
          ? "border border-mint-500/30 bg-mint-500/10"
          : "border border-app bg-card active:bg-surface-muted"
      }`}
    >
      <div
        className="flex h-11 w-11 shrink-0 flex-col overflow-hidden rounded-xl border border-black/10"
        aria-hidden
      >
        <div className="h-3.5" style={{ backgroundColor: preview.bg }} />
        <div className="flex flex-1 items-center justify-center gap-1 px-1" style={{ backgroundColor: preview.surface }}>
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: preview.primary }} />
          <div className="h-1.5 flex-1 rounded-full bg-white/20" />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-body font-semibold text-fg truncate">{label}</p>
        <p className="text-caption text-fg-muted line-clamp-2">{description}</p>
      </div>
      {selected && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}

function SettingsRow({
  icon,
  label,
  hint,
  onClick,
  danger = false,
}: {
  icon: LucideIcon;
  label: string;
  hint?: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`flex w-full min-h-[52px] items-center gap-3 px-4 py-3.5 transition-colors duration-150 ${
        onClick ? "active:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mint-500/40" : ""
      }`}
    >
      <AppIcon icon={icon} size="md" className={danger ? "text-coral-400" : "text-fg-muted"} />
      <span className={`flex-1 text-body font-medium text-left min-w-0 truncate ${danger ? "text-coral-400" : "text-fg"}`}>
        {label}
      </span>
      {hint && <span className="text-caption text-fg-muted shrink-0">{hint}</span>}
      {onClick && (
        <AppIcon icon={Icons.action.chevronRight} size="sm" className="text-fg-subtle shrink-0" />
      )}
    </Tag>
  );
}
