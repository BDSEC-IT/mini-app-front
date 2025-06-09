"use client";

import { useTranslations } from "next-intl";

export default function Error() {
  const t = useTranslations("Error");

  return (
    <div>
      <h1>{t("title")}</h1>
      <button>{t("retry")}</button>
    </div>
  );
}
