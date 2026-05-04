import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfilePageSkeleton({ roleLabel }: { roleLabel: string }) {
  const isEmployer = roleLabel === "Работодатель";
  const menuItems = 3;

  return (
    <main className="min-h-screen bg-[#f4f1e9]">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
          <div className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-[#161616]/10 bg-white/85 p-5 shadow-sm">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="mt-4 h-8 w-44" />
              <Skeleton className="mt-4 h-7 w-28 rounded-lg" />
            </div>

            <div className="grid gap-2 rounded-2xl border border-[#161616]/10 bg-white/85 p-2 shadow-sm">
              {Array.from({ length: menuItems }).map((_, index) => (
                <Skeleton key={index} className="h-11 rounded-xl" />
              ))}
            </div>
          </div>

          <div className="min-w-0">
            <div
              className={
                isEmployer ? "grid gap-6 lg:grid-cols-[1fr_360px]" : "grid gap-6"
              }
            >
              <Card className="rounded-2xl border-[#161616]/10 bg-white/90">
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-16 w-16 rounded-2xl" />
                      <div>
                        <Skeleton className="h-7 w-56" />
                        <Skeleton className="mt-3 h-4 w-72 max-w-full" />
                      </div>
                    </div>
                    <Skeleton className="h-10 w-36 rounded-xl" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton key={index} className="h-20 rounded-2xl" />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton key={index} className="h-8 w-24 rounded-lg" />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {isEmployer ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-20 rounded-2xl" />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
