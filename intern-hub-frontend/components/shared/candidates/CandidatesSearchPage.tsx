"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { CandidateResumeSearchDialog } from "@/components/shared/candidates/CandidateResumeSearchDialog";
import { EmployerCandidatesSection } from "@/components/shared/profile/EmployerCandidatesSection";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { SkillOption } from "@/lib/api/dictionaries";
import { getSkills } from "@/lib/api/dictionaries";
import { useAuth } from "@/lib/auth/context";
import {
  recordCandidateResumeView,
  type CandidateResumeSearchResult,
} from "@/lib/api/profile";

export function CandidatesSearchPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [skillOptions, setSkillOptions] = useState<SkillOption[]>([]);
  const [isSkillsLoading, setIsSkillsLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateResumeSearchResult | null>(null);
  const [isCandidateDialogOpen, setIsCandidateDialogOpen] = useState(false);

  const canViewPage = isAuthenticated && user?.role === "ROLE_EMPLOYER";

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth");
      return;
    }

    if (user && user.role !== "ROLE_EMPLOYER") {
      router.replace("/profile");
    }
  }, [isAuthenticated, router, user]);

  useEffect(() => {
    if (!canViewPage) {
      return;
    }

    let isMounted = true;

    async function loadSkills() {
      try {
        setIsSkillsLoading(true);
        const skills = await getSkills();

        if (isMounted) {
          setSkillOptions(skills);
        }
      } catch (error) {
        console.error("Failed to load candidate skills:", error);
        if (isMounted) {
          toast.error("Не удалось загрузить навыки для фильтра.");
        }
      } finally {
        if (isMounted) {
          setIsSkillsLoading(false);
        }
      }
    }

    loadSkills();

    return () => {
      isMounted = false;
    };
  }, [canViewPage]);

  if (!canViewPage) {
    return (
      <main className="mx-auto min-h-[60vh] max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Card className="rounded-2xl border-[#161616]/10 bg-white/90">
          <CardHeader>
            <div className="h-7 w-56 animate-pulse rounded-lg bg-[#ecebe4]" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-24 animate-pulse rounded-2xl bg-[#f3f2ec]" />
            <div className="h-32 animate-pulse rounded-2xl bg-[#f3f2ec]" />
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <EmployerCandidatesSection
        skillOptions={isSkillsLoading ? [] : skillOptions}
        onOpenCandidate={(candidate) => {
          if (candidate.resume.id) {
            void recordCandidateResumeView(candidate.resume.id).catch((error) => {
              console.error("Failed to record resume view:", error);
            });
          }
          setSelectedCandidate(candidate);
          setIsCandidateDialogOpen(true);
        }}
      />

      <CandidateResumeSearchDialog
        candidate={selectedCandidate}
        open={isCandidateDialogOpen}
        onOpenChange={setIsCandidateDialogOpen}
      />
    </main>
  );
}
