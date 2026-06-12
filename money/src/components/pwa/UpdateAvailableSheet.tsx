import { RefreshCw } from "lucide-react";
import { BottomSheet } from "~/components/ui/BottomSheet";
import { Button } from "~/components/ui/Button";
import { AppIcon } from "~/components/icons";
import { useTranslation } from "~/lib/i18n";

interface Props {
  open: boolean;
  onRefresh: () => void;
  onDismiss: () => void;
  loading?: boolean;
}

export function UpdateAvailableSheet({ open, onRefresh, onDismiss, loading = false }: Props) {
  const { t } = useTranslation();

  return (
    <BottomSheet
      open={open}
      onClose={onDismiss}
      title="มีเวอร์ชันใหม่"
      description="อัปเดตพร้อมใช้งานแล้ว กด Refresh เพื่อใช้เวอร์ชันล่าสุด"
    >
      <div className="flex flex-col gap-2">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          disabled={loading}
          onClick={onRefresh}
        >
          <AppIcon icon={RefreshCw} size="sm" className="text-white" />
          {t("pwa.updateRefresh")}
        </Button>
        <Button variant="ghost" size="lg" fullWidth disabled={loading} onClick={onDismiss}>
          ไว้ทีหลัง
        </Button>
      </div>
    </BottomSheet>
  );
}
