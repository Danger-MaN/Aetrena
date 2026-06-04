import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function AppHeader() {
  const { t } = useI18n();
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-6 py-5">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link to="/" className="group flex items-center gap-3">
          <div className="leading-none">
            <div className="font-display text-lg tracking-[0.4em] text-gold">{t.brand}</div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              {t.tagline}
            </div>
          </div>
        </Link>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
