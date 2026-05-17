"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type UIEvent,
} from "react";
import { Building2, Check, Search, X } from "lucide-react";
import { toast } from "sonner";

import { EmployerVacancyForm } from "@/components/shared/profile/EmployerVacancyForm";
import { mediaUrl } from "@/components/shared/profile/utils";
import { Input } from "@/components/ui/input";
import {
  getVacancyFormDictionaries,
  type VacancyFormDictionaries,
} from "@/lib/api/dictionaries";
import {
  searchAdminEmployers,
  type AdminEmployerOption,
  type AdminVacancyPayload,
  type VacancySource,
} from "@/lib/api/admin";
import type { VacancyContact, VacancyPayload } from "@/lib/api/profile";

import { AdminHeader } from "./AdminHeader";
import { AdminMutedText } from "./AdminMutedText";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

const emptyDictionaries: VacancyFormDictionaries = {
  currencies: [],
  employments: [],
  experiences: [],
  workFormats: [],
  directions: [],
  skills: [],
  languages: [],
};

const EMPLOYER_PAGE_SIZE = 40;

function createEmptyContact(): VacancyContact {
  return {
    chosenContactMethod: "INTERNAL_CHAT",
    contactValue: "",
    hint: "",
  };
}

function textValue(value: FormDataEntryValue | null) {
  return value === null ? "" : String(value);
}

function optionalNumber(value: FormDataEntryValue | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function employerName(employer: AdminEmployerOption) {
  return (
    employer.companyName || employer.email || `Работодатель #${employer.id}`
  );
}

function EmployerAvatar({
  employer,
  className = "h-9 w-9",
}: {
  employer: AdminEmployerOption;
  className?: string;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#eef1ff] text-[#1f4fff] ${className}`}
    >
      {employer.avatarUrl ? (
        <img
          src={mediaUrl(employer.avatarUrl)}
          alt={employerName(employer)}
          className="h-full w-full object-cover"
        />
      ) : (
        <Building2 className="h-4 w-4" />
      )}
    </span>
  );
}

function buildVacancyPayload(
  formData: FormData,
  contacts: VacancyContact[],
  selectedSkillIds: number[],
): VacancyPayload {
  return {
    title: textValue(formData.get("title")),
    direction: textValue(formData.get("direction")),
    description: textValue(formData.get("description")),
    city: textValue(formData.get("city")),
    link: textValue(formData.get("link")),
    employment: textValue(formData.get("employment")),
    experience: textValue(formData.get("experience")),
    workFormat: textValue(formData.get("workFormat")),
    skills: selectedSkillIds,
    salary: {
      from: optionalNumber(formData.get("salaryFrom")),
      to: optionalNumber(formData.get("salaryTo")),
      currency: textValue(formData.get("currency")) || "RUR",
    },
    contactsList: contacts
      .filter((contact) => contact.chosenContactMethod)
      .map((contact) => ({
        chosenContactMethod: contact.chosenContactMethod,
        contactValue: contact.contactValue.trim(),
        hint: contact.hint?.trim() || "",
      })),
  };
}

export function AdminVacancyCreateSection({
  sources,
  isSaving,
  onCreate,
}: {
  sources: VacancySource[];
  isSaving: boolean;
  onCreate: (payload: AdminVacancyPayload) => Promise<boolean>;
}) {
  const [dictionaries, setDictionaries] =
    useState<VacancyFormDictionaries | null>(null);
  const [isDictionaryLoading, setIsDictionaryLoading] = useState(true);
  const [employerQuery, setEmployerQuery] = useState("");
  const [employerResults, setEmployerResults] = useState<AdminEmployerOption[]>(
    [],
  );
  const [isEmployerSearchOpen, setIsEmployerSearchOpen] = useState(false);
  const [selectedEmployer, setSelectedEmployer] =
    useState<AdminEmployerOption | null>(null);
  const [isEmployerSearching, setIsEmployerSearching] = useState(false);
  const [isEmployerLoadingMore, setIsEmployerLoadingMore] = useState(false);
  const employerSearchRef = useRef<HTMLDivElement>(null);
  const isEmployerLoadingMoreRef = useRef(false);
  const [employerPage, setEmployerPage] = useState(0);
  const [employerTotalPages, setEmployerTotalPages] = useState(0);
  const [sourceCode, setSourceCode] = useState("");
  const [externalId, setExternalId] = useState("");
  const [aggregated, setAggregated] = useState(false);
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);
  const [contacts, setContacts] = useState<VacancyContact[]>([
    createEmptyContact(),
  ]);
  const [formVersion, setFormVersion] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadDictionaries() {
      try {
        setIsDictionaryLoading(true);
        const loaded = await getVacancyFormDictionaries();
        if (active) {
          setDictionaries(loaded);
        }
      } catch (error) {
        console.error("Failed to load vacancy dictionaries:", error);
        if (active) {
          toast.error("Не удалось загрузить справочники для вакансии.");
        }
      } finally {
        if (active) {
          setIsDictionaryLoading(false);
        }
      }
    }

    void loadDictionaries();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!sourceCode && sources.length) {
      const firstSource = sources[0].code;
      setSourceCode(firstSource);
      setAggregated(firstSource !== "IH");
    }
  }, [sourceCode, sources]);

  useEffect(() => {
    function closeEmployerSearch(event: PointerEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        employerSearchRef.current?.contains(target)
      ) {
        return;
      }

      setIsEmployerSearchOpen(false);
    }

    document.addEventListener("pointerdown", closeEmployerSearch);

    return () => {
      document.removeEventListener("pointerdown", closeEmployerSearch);
    };
  }, []);

  useEffect(() => {
    const query = employerQuery.trim();

    if (!isEmployerSearchOpen) {
      return;
    }

    if (selectedEmployer && query === employerName(selectedEmployer)) {
      return;
    }

    let active = true;
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsEmployerSearching(true);
        const response = await searchAdminEmployers(
          query,
          0,
          EMPLOYER_PAGE_SIZE,
        );
        if (!active) {
          return;
        }
        setEmployerResults(response.content);
        setEmployerPage(response.pageNumber);
        setEmployerTotalPages(response.totalPages);
      } catch (error) {
        console.error("Failed to search employers:", error);
        toast.error("Не удалось найти работодателей.");
      } finally {
        if (active) {
          setIsEmployerSearching(false);
        }
      }
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [employerQuery, isEmployerSearchOpen, selectedEmployer]);

  function selectEmployer(employer: AdminEmployerOption) {
    setSelectedEmployer(employer);
    setEmployerQuery(employerName(employer));
    setEmployerResults([]);
    setIsEmployerSearchOpen(false);
    setEmployerPage(0);
    setEmployerTotalPages(0);
  }

  function clearEmployer() {
    setSelectedEmployer(null);
    setEmployerQuery("");
    setEmployerResults([]);
    setIsEmployerSearchOpen(false);
    setEmployerPage(0);
    setEmployerTotalPages(0);
  }

  async function loadMoreEmployers() {
    if (
      selectedEmployer ||
      isEmployerSearching ||
      isEmployerLoadingMoreRef.current ||
      (employerTotalPages > 0 && employerPage + 1 >= employerTotalPages)
    ) {
      return;
    }

    const nextPage = employerPage + 1;

    try {
      isEmployerLoadingMoreRef.current = true;
      setIsEmployerLoadingMore(true);
      const response = await searchAdminEmployers(
        employerQuery.trim(),
        nextPage,
        EMPLOYER_PAGE_SIZE,
      );
      setEmployerResults((items) => {
        const existingIds = new Set(items.map((item) => item.id));
        const nextItems = response.content.filter(
          (item) => !existingIds.has(item.id),
        );
        return [...items, ...nextItems];
      });
      setEmployerPage(response.pageNumber);
      setEmployerTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to load more employers:", error);
      toast.error("Не удалось загрузить работодателей.");
    } finally {
      isEmployerLoadingMoreRef.current = false;
      setIsEmployerLoadingMore(false);
    }
  }

  function handleEmployerResultsScroll(event: UIEvent<HTMLDivElement>) {
    const target = event.currentTarget;

    if (target.scrollHeight - target.scrollTop - target.clientHeight < 64) {
      void loadMoreEmployers();
    }
  }

  function resetForm() {
    setExternalId("");
    setSelectedSkillIds([]);
    setContacts([createEmptyContact()]);
    setFormVersion((version) => version + 1);
  }

  function addContact() {
    setContacts((items) => [
      ...items,
      { chosenContactMethod: "EMAIL", contactValue: "", hint: "" },
    ]);
  }

  function removeContact(index: number) {
    setContacts((items) => {
      const nextItems = items.filter((_item, itemIndex) => itemIndex !== index);
      return nextItems.length ? nextItems : [createEmptyContact()];
    });
  }

  function updateContact(
    index: number,
    field: keyof VacancyContact,
    value: string,
  ) {
    setContacts((items) =>
      items.map((contact, contactIndex) =>
        contactIndex === index
          ? {
              ...contact,
              [field]: value,
              ...(field === "chosenContactMethod" && value === "INTERNAL_CHAT"
                ? { contactValue: "" }
                : {}),
            }
          : contact,
      ),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedEmployer) {
      toast.error("Выберите работодателя из результатов поиска.");
      return;
    }

    if (!sourceCode) {
      toast.error("Выберите источник вакансии.");
      return;
    }

    const vacancyPayload = buildVacancyPayload(
      new FormData(event.currentTarget),
      contacts,
      selectedSkillIds,
    );

    if (!vacancyPayload.title.trim()) {
      toast.error("Название вакансии обязательно.");
      return;
    }

    const created = await onCreate({
      ...vacancyPayload,
      employerId: selectedEmployer.id,
      sourceCode,
      externalId: externalId.trim() || undefined,
      aggregated,
    });

    if (created) {
      resetForm();
    }
  }

  return (
    <section className="space-y-6">
      <AdminHeader
        eyebrow="Ручное добавление"
        title="Создать вакансию"
        description="Администратор может найти работодателя, выбрать источник и опубликовать вакансию сразу без модерации."
      />

      <div className="rounded-2xl border border-[#161616]/10 bg-white p-5 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1.4fr)_1fr_1fr_auto] lg:items-end">
          <div
            ref={employerSearchRef}
            className="relative grid gap-2 text-sm font-semibold text-[#171717]"
          >
            Работодатель
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777]" />
              <Input
                autoComplete="nope"
                value={employerQuery}
                placeholder="Название компании"
                className="pl-9 pr-10"
                onChange={(event) => {
                  setEmployerQuery(event.target.value);
                  setSelectedEmployer(null);
                  setIsEmployerSearchOpen(true);
                }}
                onFocus={() => setIsEmployerSearchOpen(true)}
              />
              {selectedEmployer ? (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777] hover:text-[#171717]"
                  onClick={clearEmployer}
                  aria-label="Очистить работодателя"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            {isEmployerSearchOpen &&
            employerResults.length > 0 &&
            !selectedEmployer ? (
              <div
                className="absolute left-0 right-0 top-full z-100 mt-2 max-h-96 overflow-auto rounded-2xl border border-[#161616]/10 bg-white p-2 shadow-xl"
                onScroll={handleEmployerResultsScroll}
              >
                {employerResults.map((employer) => (
                  <button
                    key={employer.id}
                    type="button"
                    className="flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left hover:bg-[#f8f7f2]"
                    onClick={() => selectEmployer(employer)}
                  >
                    {/* <EmployerAvatar employer={employer} /> */}
                    <Avatar>
                      <AvatarImage src={employer.avatarUrl}></AvatarImage>
                    </Avatar>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-extrabold text-[#171717]">
                        {employerName(employer)}
                      </span>
                      <span className="block truncate text-xs font-medium text-[#626262]">
                        #{employer.id}
                        {employer.city ? ` · ${employer.city}` : ""}
                        {employer.email ? ` · ${employer.email}` : ""}
                      </span>
                    </span>
                  </button>
                ))}
                {isEmployerLoadingMore ? (
                  <div className="px-3 py-2 text-xs font-semibold text-[#626262]">
                    {"Загружаем еще..."}
                  </div>
                ) : null}
              </div>
            ) : null}
            {/* {!employerResults.length &&
            isEmployerSearchOpen &&
            !selectedEmployer &&
            employerQuery.trim() &&
            !isEmployerSearching ? (
              <span className="text-xs font-medium text-[#777]">
                Работодатели не найдены.
              </span>
            ) : null} */}
          </div>

          <label className="grid gap-2 text-sm font-semibold text-[#171717]">
            Источник
            <select
              value={sourceCode}
              className="h-10 rounded-md border bg-white px-3 text-sm"
              onChange={(event) => {
                const nextSource = event.target.value;
                setSourceCode(nextSource);
                setAggregated(nextSource !== "IH");
              }}
            >
              {sources.map((source) => (
                <option key={source.id} value={source.code}>
                  {source.name} ({source.code})
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-[#171717]">
            Внешний ID
            <Input
              value={externalId}
              placeholder="Необязательно"
              onChange={(event) => setExternalId(event.target.value)}
            />
          </label>

          <label className="flex h-10 items-center gap-2 rounded-xl border border-[#161616]/10 bg-[#f8f7f2] px-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={aggregated}
              onChange={(event) => setAggregated(event.target.checked)}
            />
            Агрегированная
          </label>
        </div>

        {selectedEmployer ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <Avatar>
              <AvatarImage src={selectedEmployer.avatarUrl}></AvatarImage>
            </Avatar>
            <Check className="h-4 w-4" />
            <span className="font-extrabold">
              {employerName(selectedEmployer)}
            </span>
            <span className="text-emerald-800">#{selectedEmployer.id}</span>
            {selectedEmployer.city ? (
              <span>{selectedEmployer.city}</span>
            ) : null}
            {selectedEmployer.status ? (
              <span className="rounded-full bg-white px-2 py-1 text-xs font-bold">
                {selectedEmployer.status}
              </span>
            ) : null}
          </div>
        ) : null}

        {!sources.length ? (
          <div className="mt-4">
            <AdminMutedText>
              Сначала добавьте хотя бы один источник вакансий.
            </AdminMutedText>
          </div>
        ) : null}
      </div>

      <EmployerVacancyForm
        key={formVersion}
        contacts={contacts}
        dictionaries={dictionaries ?? emptyDictionaries}
        isArchived={false}
        isDictionaryLoading={isDictionaryLoading || !sources.length}
        isEditMode={false}
        isSaving={isSaving}
        selectedSkillIds={selectedSkillIds}
        vacancy={null}
        onAddContact={addContact}
        onArchive={() => undefined}
        onCancel={resetForm}
        onDelete={() => undefined}
        onRestore={() => undefined}
        onRemoveContact={removeContact}
        onSelectedSkillsChange={setSelectedSkillIds}
        onSubmit={handleSubmit}
        onUpdateContact={updateContact}
      />
    </section>
  );
}
