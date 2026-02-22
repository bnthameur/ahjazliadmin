import { Emoji } from 'react-apple-emojis';

export default function DashboardLoading() {
    return (
        <div className="p-6 lg:p-8">
            {/* Header Skeleton */}
            <div className="mb-8">
                <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse mb-2" />
                <div className="h-4 w-96 bg-slate-200 rounded-lg animate-pulse" />
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                            <div className="w-2 h-2 rounded-full bg-slate-200" />
                        </div>
                        <div className="h-8 w-16 bg-slate-200 rounded-lg animate-pulse" />
                    </div>
                ))}
            </div>

            {/* Quick Actions Skeleton */}
            <div className="mb-8">
                <div className="h-6 w-32 bg-slate-200 rounded-lg animate-pulse mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-xl p-6">
                            <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse mb-4" />
                            <div className="h-5 w-32 bg-slate-200 rounded-lg animate-pulse mb-2" />
                            <div className="h-4 w-48 bg-slate-200 rounded-lg animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
