import { Suspense } from "react";
import { ProfilePageContent } from "@/components/shared/profile/ProfilePageContent";
import { ProfilePageSkeleton } from "@/components/shared/profile/ProfilePageSkeleton";

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfilePageSkeleton roleLabel="Соискатель" />}>
      <ProfilePageContent />
    </Suspense>
  );
}
