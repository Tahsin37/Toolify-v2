export default function Loading() {
    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            {/* Header Skeleton */}
            <div className="h-16 bg-white border-b border-slate-200 animate-pulse" />

            <main className="flex-1 container mx-auto px-4 py-12">
                {/* Breadcrumb Skeleton */}
                <div className="h-4 w-64 bg-slate-200 rounded animate-pulse mb-8" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar Skeleton */}
                    <aside className="hidden lg:block lg:col-span-3">
                        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                            <div className="h-8 w-full bg-slate-100 rounded animate-pulse" />
                            <div className="h-8 w-full bg-slate-100 rounded animate-pulse" />
                            <div className="h-8 w-full bg-slate-100 rounded animate-pulse" />
                        </div>
                    </aside>

                    {/* Main Content Skeleton */}
                    <div className="lg:col-span-9 space-y-6">
                        <div className="h-10 w-3/4 bg-slate-200 rounded animate-pulse" />
                        <div className="h-6 w-1/2 bg-slate-100 rounded animate-pulse" />

                        {/* Tool Card Skeleton */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 min-h-[400px]">
                            <div className="space-y-4">
                                <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                                <div className="h-40 bg-slate-50 rounded-xl animate-pulse" />
                                <div className="h-12 bg-indigo-100 rounded-xl animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
