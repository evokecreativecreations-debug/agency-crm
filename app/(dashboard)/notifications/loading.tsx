export default function NotificationsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-muted" />
      </div>

      <div className="rounded-lg border bg-background">
        <div className="border-b px-6 py-4">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        </div>

        <div className="space-y-5 p-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex gap-3">
              <div className="h-3 w-3 animate-pulse rounded-full bg-muted" />

              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}