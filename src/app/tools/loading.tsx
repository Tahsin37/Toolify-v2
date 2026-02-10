export default function ToolsLoading() {
    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            {/* Header Skeleton */}
            <div className="h-16 bg-white border-b border-slate-200 animate-pulse" />

            {/* Hero Skeleton */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 py-16">
                <div className="container mx-auto px-4 text-center">
                    <div className="h-16 w-16 bg-white/20 rounded-full mx-auto mb-6 animate-pulse" />
                    <div className="h-12 w-48 bg-white/20 rounded mx-auto mb-4 animate-pulse" />
                    <div className="h-6 w-96 bg-white/10 rounded mx-auto animate-pulse" />
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {/* Search Skeleton */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-10 max-w-4xl mx-auto">
                    <div className="h-12 bg-slate-100 rounded-xl animate-pulse mb-4" />
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-8 w-24 bg-slate-100 rounded-full animate-pulse" />
                        ))}
                    </div>
                </div>

                {/* Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                            <div className="h-12 w-12 bg-slate-100 rounded-xl animate-pulse" />
                            <div className="h-6 w-3/4 bg-slate-200 rounded animate-pulse" />
                            <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
                            <div className="h-4 w-2/3 bg-slate-100 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
