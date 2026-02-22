export default function UsersLoading() {
    return (
        <div className="p-6 lg:p-8">
            {/* Header Skeleton */}
            <div className="mb-6">
                <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse mb-2" />
                <div className="h-4 w-64 bg-slate-200 rounded-lg animate-pulse" />
            </div>

            {/* Tabs Skeleton */}
            <div className="flex gap-1 mb-6 border-b border-slate-200 pb-px">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="px-4 py-3 w-24">
                        <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
                    </div>
                ))}
            </div>

            {/* Users List Skeleton */}
            <div className="grid grid-cols-1 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-5">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="w-14 h-14 bg-slate-200 rounded-full animate-pulse" />
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <div className="h-5 w-32 bg-slate-200 rounded-lg animate-pulse" />
                                    <div className="h-5 w-20 bg-slate-200 rounded-full animate-pulse" />
                                    <div className="h-5 w-24 bg-slate-200 rounded-full animate-pulse" />
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
                                    <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="h-9 w-24 bg-slate-200 rounded-lg animate-pulse" />
                                <div className="h-9 w-24 bg-slate-200 rounded-lg animate-pulse" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
