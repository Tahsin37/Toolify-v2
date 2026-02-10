export default function RootLoading() {
    return (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
            <div className="text-center">
                {/* Animated Logo */}
                <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto animate-pulse">
                        <span className="text-2xl font-black text-white">Z</span>
                    </div>
                    {/* Spinner ring */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                </div>
                <p className="text-slate-400 text-sm font-medium">Loading...</p>
            </div>
        </div>
    );
}
