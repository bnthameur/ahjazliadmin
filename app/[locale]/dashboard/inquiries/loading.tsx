export default function InquiriesLoading() {
    return (
        <div className="p-6 lg:p-8">
            {/* Header Skeleton */}
            <div className="mb-6">
                <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse mb-2" />
                <div className="h-4 w-64 bg-slate-200 rounded-lg animate-pulse" />
            </div>

            {/* Inquiries List Skeleton */}
            <div className="grid grid-cols-1 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-5">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse" />
                                <div>
                                    <div className="h-5 w-32 bg-slate-200 rounded-lg animate-pulse mb-1" />
                                    <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
                                </div>
                            </div>
                            <div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse" />
                        </div>
                        <div className="flex flex-wrap gap-3 mb-4">
                            <div className="h-8 w-40 bg-slate-200 rounded-lg animate-pulse" />
                            <div className="h-8 w-32 bg-slate-200 rounded-lg animate-pulse" />
                        </div>
                        <div className="h-20 bg-slate-100 rounded-xl animate-pulse mb-4" />
                        <div className="h-6 w-48 bg-slate-200 rounded-lg animate-pulse" />
                    </div>
                ))}
            </div>
        </div>
    );
}
