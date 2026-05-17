import { ArrowUpRight } from "lucide-react";

import type { VacancyContact } from "@/app/types/api";

import {
  buildContactHref,
  contactIcons,
  contactLabels,
  externalContactValue,
} from "./vacancyDetailsHelpers";

export function ExternalApplyLink({ contact }: { contact: VacancyContact }) {
  const href = buildContactHref(contact);
  const Icon = contactIcons[contact.chosenContactMethod] ?? ArrowUpRight;

  if (!href) {
    return null;
  }

  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className="block w-full rounded-xl border border-[#161616]/10 bg-[#f8f7f2] p-4 text-left transition hover:border-[#3f5f4a]/35 hover:bg-[#edf3ea]"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-white p-2 text-[#3f5f4a]">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#777]">
            {contactLabels[contact.chosenContactMethod]}
          </p>
          <p className="mt-1 break-words text-sm font-extrabold text-[#171717]">
            {externalContactValue(contact)}
          </p>
          {contact.hint ? (
            <p className="mt-1 text-xs leading-5 text-[#666]">{contact.hint}</p>
          ) : null}
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-[#777]" />
      </div>
    </a>
  );
}
