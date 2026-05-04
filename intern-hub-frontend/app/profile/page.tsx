import { Suspense } from "react";
import { ProfilePageContent } from "@/components/profile/ProfilePageContent";
import { ProfilePageSkeleton } from "@/components/profile/ProfilePageSkeleton";

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfilePageSkeleton roleLabel="Соискатель" />}>
      <ProfilePageContent />
    </Suspense>
  );
}
