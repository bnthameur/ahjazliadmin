'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function AccessDeniedPage() {
    const params = useParams();
    const locale = (params?.locale as string) || 'en';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
            <div className="w-full max-w-md">
                {/* Error Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full mb-6">
                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-slate-900 mb-3">
                        Access Denied
                    </h1>

                    {/* Description */}
                    <p className="text-slate-600 mb-6">
                        You don&apos;t have permission to access the admin panel. 
                        This area is restricted to authorized administrators only.
                    </p>

                    {/* Info Box */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-amber-800">
                                    Why am I seeing this?
                                </p>
                                <p className="text-sm text-amber-700 mt-1">
                                    Your Google account was authenticated successfully, but your account 
                                    doesn&apos;t have admin privileges in our system.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Link
                            href={`/${locale}/login`}
                            className="block w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
                        >
                            Try Different Account
                        </Link>
                        
                        <a
                            href="mailto:support@ahjazliqaati.dz"
                            className="block w-full px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                        >
                            Contact Support
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-sm text-slate-500">
                    &copy; {new Date().getFullYear()} Ahjazli Qaati. All rights reserved.
                </p>
            </div>
        </div>
    );
}
