import React from "react";
import { Link2, Twitter, Facebook, Linkedin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ShareBar() {
  const { t } = useLanguage();
  const { toast } = useToast();

  const url = window.location.href;
  const encoded = encodeURIComponent(url);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: t("pf.copied") });
    } catch {
      toast({ title: t("pf.copyFail") });
    }
  };

  const links = [
    {
      label: "X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        t("pf.shareText")
      )}&url=${encoded}`,
    },
    {
      label: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
    },
    {
      label: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
    },
  ];

  return (
    <div className="mt-6 flex items-center gap-2 flex-wrap">
      <button
        onClick={copyLink}
        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-black bg-white rounded-full hover:bg-white/90 transition-colors"
      >
        <Link2 className="w-4 h-4" /> {t("pf.copyLink")}
      </button>
      {links.map(({ label, icon: Icon, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white/70 border border-white/10 rounded-full hover:text-white hover:border-white/25 transition-colors"
        >
          <Icon className="w-4 h-4" /> {label}
        </a>
      ))}
    </div>
  );
}