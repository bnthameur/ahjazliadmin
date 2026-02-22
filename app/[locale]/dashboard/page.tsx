import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

// Use revalidation instead of force-dynamic for better performance
export const revalidate = 30; // Revalidate every 30 seconds

// Emoji component for server components
function EmojiIcon({ name, className = "" }: { name: string; className?: string }) {
    const emojiMap: Record<string, string> = {
        'hourglass-not-done': '⏳',
        'check-mark': '✅',
        'busts-in-silhouette': '👥',
        'speech-balloon': '💬',
        'classical-building': '🏛️',
        'chart-increasing': '📈',
        'waving-hand': '👋',
    };
    return <span className={className}>{emojiMap[name] || '•'}</span>;
}

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations('Dashboard');
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // Fetch stats in parallel
    const [
        { count: pendingVenues },
        { count: approvedVenues },
        { count: publishedVenues },
        { count: rejectedVenues },
        { count: pendingUsers },
        { count: activeUsers },
        { count: rejectedUsers },
        { count: totalInquiries }
    ] = await Promise.all([
        supabase.from('venues').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('venues').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('venues').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('venues').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending').eq('role', 'venue_owner'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active').eq('role', 'venue_owner'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'rejected').eq('role', 'venue_owner'),
        supabase.from('contact_inquiries').select('*', { count: 'exact', head: true })
    ]);

    const stats = [
        { 
            label: t('stats.pending_venues'), 
            value: pendingVenues || 0, 
            color: 'orange', 
            emoji: 'hourglass-not-done',
            href: `/${locale}/dashboard/venues?status=pending` 
        },
        { 
            label: t('stats.published_venues'), 
            value: publishedVenues || 0, 
            color: 'green', 
            emoji: 'check-mark',
            href: `/${locale}/dashboard/venues?status=published` 
        },
        { 
            label: t('stats.pending_users'), 
            value: pendingUsers || 0, 
            color: 'amber', 
            emoji: 'busts-in-silhouette',
            href: `/${locale}/dashboard/users?status=pending` 
        },
        { 
            label: t('stats.active_users'), 
            value: activeUsers || 0, 
            color: 'blue', 
            emoji: 'busts-in-silhouette',
            href: `/${locale}/dashboard/users?status=active` 
        },
    ];

    const quickActions = [
        { 
            title: t('quick_actions.manage_venues'), 
            description: t('quick_actions.manage_venues_desc'), 
            href: `/${locale}/dashboard/venues`, 
            emoji: 'classical-building',
            color: 'from-primary-500 to-primary-600'
        },
        { 
            title: t('quick_actions.manage_users'), 
            description: t('quick_actions.manage_users_desc'), 
            href: `/${locale}/dashboard/users`, 
            emoji: 'busts-in-silhouette',
            color: 'from-blue-500 to-blue-600'
        },
        { 
            title: t('quick_actions.view_inquiries'), 
            description: t('quick_actions.view_inquiries_desc'), 
            href: `/${locale}/dashboard/inquiries`, 
            emoji: 'speech-balloon',
            color: 'from-green-500 to-green-600'
        },
    ];

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
            orange: { 
                bg: 'bg-orange-50 hover:bg-orange-100', 
                text: 'text-orange-700',
                border: 'border-orange-200',
                dot: 'bg-orange-500'
            },
            green: { 
                bg: 'bg-green-50 hover:bg-green-100', 
                text: 'text-green-700',
                border: 'border-green-200',
                dot: 'bg-green-500'
            },
            amber: { 
                bg: 'bg-amber-50 hover:bg-amber-100', 
                text: 'text-amber-700',
                border: 'border-amber-200',
                dot: 'bg-amber-500'
            },
            blue: { 
                bg: 'bg-blue-50 hover:bg-blue-100', 
                text: 'text-blue-700',
                border: 'border-blue-200',
                dot: 'bg-blue-500'
            },
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
                    {t('welcome')} <EmojiIcon name="waving-hand" />
                </h1>
                <p className="mt-1 text-slate-600">
                    {t('welcome_subtitle')}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => {
                    const colors = getColorClasses(stat.color);
                    return (
                        <Link
                            key={stat.label}
                            href={stat.href}
                            className={`${colors.bg} border ${colors.border} rounded-xl p-5 transition-all duration-200 hover:shadow-md group`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <EmojiIcon name={stat.emoji} className="text-lg" />
                                    <span className={`text-sm font-medium ${colors.text}`}>{stat.label}</span>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                            </div>
                            <div className="text-3xl font-bold text-slate-900 group-hover:scale-105 transition-transform origin-left">
                                {stat.value}
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-lg font-bold text-slate-900 mb-4">{t('quick_actions.title')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickActions.map((action) => (
                        <Link
                            key={action.title}
                            href={action.href}
                            className="group relative overflow-hidden bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-primary-200 transition-all duration-300"
                        >
                            {/* Gradient background on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                            
                            <div className="relative">
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} text-white text-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                    <EmojiIcon name={action.emoji} />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-primary-600 transition-colors">
                                    {action.title}
                                </h3>
                                <p className="text-sm text-slate-600">{action.description}</p>
                            </div>
                            
                            {/* Arrow indicator */}
                            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Activity Section */}
            <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4">{t('recent_activity.title')}</h2>
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                        <EmojiIcon name="chart-increasing" className="text-2xl text-slate-400" />
                    </div>
                    <p className="text-slate-500">{t('recent_activity.empty')}</p>
                </div>
            </div>
        </div>
    );
}
