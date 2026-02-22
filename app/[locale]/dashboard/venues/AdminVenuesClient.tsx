'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Emoji } from 'react-apple-emojis';
import { updateVenueStatus, sendNotification } from '../actions';

interface Venue {
    id: string;
    title: string | null;
    name: string | null;
    description?: string | null;
    category?: string | null;
    location?: string | null;
    wilaya?: string | null;
    city?: string | null;
    address?: string | null;
    price?: number | null;
    price_min?: number | null;
    price_max?: number | null;
    capacity?: number | null;
    capacity_min?: number | null;
    capacity_max?: number | null;
    phone?: string | null;
    whatsapp?: string | null;
    contact_email?: string | null;
    facebook_url?: string | null;
    instagram_url?: string | null;
    amenities?: string[] | null;
    images: string[];
    status: string;
    rejection_reason?: string | null;
    created_at: string;
    updated_at?: string | null;
    owner_id: string;
    profiles: {
        full_name?: string | null;
        email?: string | null;
        business_name?: string | null;
        phone?: string | null;
    } | {
        full_name?: string | null;
        email?: string | null;
        business_name?: string | null;
        phone?: string | null;
    }[];
}

interface AdminVenuesClientProps {
    initialVenues: Venue[];
    statusFilter: string;
}

export default function AdminVenuesClient({ initialVenues, statusFilter }: AdminVenuesClientProps) {
    const t = useTranslations('Venues');
    const commonT = useTranslations('Common');
    const [venues, setVenues] = useState<Venue[]>(initialVenues);
    const [query, setQuery] = useState('');
    const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');

    const [activeVenue, setActiveVenue] = useState<Venue | null>(null);
    const [rejectVenue, setRejectVenue] = useState<Venue | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

    const [notifyTarget, setNotifyTarget] = useState<Venue | null>(null);
    const [notifyTitle, setNotifyTitle] = useState('');
    const [notifyMessage, setNotifyMessage] = useState('');
    const [notifyType, setNotifyType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
    const [notifySubmitting, setNotifySubmitting] = useState(false);
    const [notifyResult, setNotifyResult] = useState<{ success: boolean; message: string } | null>(null);

    useEffect(() => {
        setVenues(initialVenues);
    }, [initialVenues]);

    useEffect(() => {
        if (typeof document !== 'undefined') {
            const nextDir = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr';
            setDir(nextDir);
        }
    }, []);

    const ownerFromVenue = (venue: Venue) => {
        if (Array.isArray(venue.profiles)) return venue.profiles[0];
        return venue.profiles;
    };

    const getVenueTitle = (venue: Venue) => venue.title || venue.name || 'Untitled';

    const formatNumber = (value?: number | null) => {
        if (value === null || value === undefined) return null;
        const parsed = typeof value === 'number' ? value : Number(value);
        if (Number.isNaN(parsed)) return null;
        return parsed.toLocaleString();
    };

    const formatPrice = (venue: Venue) => {
        const min = formatNumber(venue.price_min);
        const max = formatNumber(venue.price_max);
        if (min && max) return `${min} - ${max} DZD`;
        const base = formatNumber(venue.price);
        return base ? `${base} DZD` : t('fields.contact_price');
    };

    const formatCapacity = (venue: Venue) => {
        const min = formatNumber(venue.capacity_min);
        const max = formatNumber(venue.capacity_max);
        if (min && max) return `${min} - ${max} ${t('fields.guests')}`;
        const base = formatNumber(venue.capacity);
        return base ? `${base} ${t('fields.guests')}` : '-';
    };

    const formatLocation = (venue: Venue) => {
        const parts = [venue.city, venue.wilaya].filter(Boolean) as string[];
        return parts.length ? parts.join(', ') : venue.location || '-';
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-orange-100 text-orange-700 border-orange-200',
            approved: 'bg-blue-100 text-blue-700 border-blue-200',
            published: 'bg-green-100 text-green-700 border-green-200',
            rejected: 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[status] || 'bg-slate-100 text-slate-700';
    };
    const chipClass = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600';

    const handleOpenReject = (venue: Venue) => {
        setRejectVenue(venue);
        setRejectionReason('');
        setShowRejectModal(true);
    };

    const handleUpdateStatus = async (venueId: string, status: 'pending' | 'approved' | 'published' | 'rejected', reason?: string) => {
        setIsSubmitting(venueId);
        try {
            const result = await updateVenueStatus(venueId, status, reason);
            if (result.success) {
                setVenues(venues.filter(v => v.id !== venueId));
                setShowRejectModal(false);
                setRejectionReason('');
                setRejectVenue(null);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert(commonT('error'));
        } finally {
            setIsSubmitting(null);
        }
    };

    const handleOpenNotification = (venue: Venue) => {
        setNotifyTarget(venue);
        setNotifyTitle(`Message about ${getVenueTitle(venue)}`);
        setNotifyMessage('');
        setNotifyType('info');
        setNotifyResult(null);
    };

    const handleSendNotification = async () => {
        if (!notifyTarget) return;
        setNotifySubmitting(true);
        setNotifyResult(null);

        try {
            const response = await sendNotification(
                notifyTarget.owner_id,
                notifyTitle,
                notifyMessage,
                notifyType
            );
            if (response.success) {
                setNotifyResult({ success: true, message: 'Notification sent to venue owner.' });
                setNotifyTitle('');
                setNotifyMessage('');
            } else {
                setNotifyResult({ success: false, message: 'Failed to send notification.' });
            }
        } catch (error) {
            setNotifyResult({ success: false, message: 'An error occurred while sending the notification.' });
        } finally {
            setNotifySubmitting(false);
        }
    };

    const tabs = [
        { key: 'pending', label: t('tabs.pending'), emoji: 'hourglass-not-done' },
        { key: 'approved', label: t('tabs.approved'), emoji: 'check-mark' },
        { key: 'published', label: t('tabs.published'), emoji: 'check-mark-button' },
        { key: 'rejected', label: t('tabs.rejected'), emoji: 'cross-mark' },
    ];

    const filteredVenues = venues.filter((venue) => {
        const needle = query.trim().toLowerCase();
        if (!needle) return true;
        const owner = ownerFromVenue(venue);
        const haystack = [
            venue.title,
            venue.name,
            venue.location,
            venue.wilaya,
            venue.city,
            owner?.business_name,
            owner?.full_name,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
        return haystack.includes(needle);
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Emoji name="classical-building" width={28} />
                        {t('title')}
                    </h1>
                    <p className="text-slate-600 mt-1">{t('subtitle')}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
                        <Emoji name="magnifying-glass-tilted-left" width={16} />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={commonT('search')}
                            className="bg-transparent outline-none text-sm text-slate-700 w-56"
                        />
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-primary-50 border border-primary-200 text-primary-700 text-sm font-medium">
                        {filteredVenues.length} {t('summary', { status: t(`tabs.${statusFilter}`) })}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-slate-200 overflow-x-auto pb-px">
                {tabs.map((tab) => (
                    <Link
                        key={tab.key}
                        href={`?status=${tab.key}`}
                        className={`px-4 py-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 flex items-center gap-2 ${statusFilter === tab.key
                            ? 'border-primary-500 text-primary-600 bg-primary-50/50'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        <Emoji name={tab.emoji as any} width={16} />
                        {tab.label}
                    </Link>
                ))}
            </div>

            {/* Venues Grid */}
            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredVenues.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl border border-slate-200 p-12 text-center"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                                <Emoji name="classical-building" width={32} className="opacity-50" />
                            </div>
                            <p className="text-slate-500">
                                {t('no_venues', { status: t(`tabs.${statusFilter}`) })}
                            </p>
                        </motion.div>
                    ) : (
                        filteredVenues.map((venue, index) => {
                            const owner = ownerFromVenue(venue);
                            return (
                                <motion.div
                                    key={venue.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all duration-300"
                                >
                                    <div className="flex flex-col md:flex-row">
                                        <div className="w-full md:w-56 h-48 md:h-44 bg-slate-100 overflow-hidden flex-shrink-0">
                                            {venue.images?.[0] ? (
                                                <img
                                                    src={venue.images[0]}
                                                    alt={getVenueTitle(venue)}
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                                                    <Emoji name="classical-building" width={48} className="opacity-30" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 p-5 md:p-6 space-y-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h3 className="text-lg font-semibold text-slate-900 truncate">{getVenueTitle(venue)}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                                        <Emoji name="round-pushpin" width={14} />
                                                        <span className="truncate">{formatLocation(venue)}</span>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize border ${getStatusColor(venue.status)}`}>
                                                    {venue.status}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <span className={chipClass}>
                                                    <span className="text-slate-500">{t('fields.owner')}</span>
                                                    <span className="font-medium text-slate-900 truncate">
                                                        {owner?.business_name || owner?.full_name || '-'}
                                                    </span>
                                                </span>
                                                <span className={chipClass}>
                                                    <span className="text-slate-500">{t('fields.price')}</span>
                                                    <span className="font-medium text-slate-900">{formatPrice(venue)}</span>
                                                </span>
                                                <span className={chipClass}>
                                                    <span className="text-slate-500">{t('fields.capacity')}</span>
                                                    <span className="font-medium text-slate-900">{formatCapacity(venue)}</span>
                                                </span>
                                                <span className={chipClass}>
                                                    <span className="text-slate-500">{t('fields.submitted')}</span>
                                                    <span className="font-medium text-slate-900">{new Date(venue.created_at).toLocaleDateString()}</span>
                                                </span>
                                            </div>

                                            {venue.rejection_reason && (
                                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                                    <div className="flex items-start gap-2">
                                                        <Emoji name="warning" width={16} />
                                                        <div>
                                                            <p className="text-sm font-medium text-red-800">{t('rejection_reason')}</p>
                                                            <p className="text-sm text-red-700 mt-0.5">{venue.rejection_reason}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                onClick={() => setActiveVenue(venue)}
                                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-all"
                                            >
                                                <Emoji name="id-button" width={14} />
                                                {t('actions.view')}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>

            {/* Detail Drawer */}
            <AnimatePresence>
                {activeVenue && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 z-40"
                            onClick={() => setActiveVenue(null)}
                        />
                        <motion.aside
                            initial={{ x: dir === 'rtl' ? '-100%' : '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: dir === 'rtl' ? '-100%' : '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 260 }}
                            className={`fixed top-0 ${dir === 'rtl' ? 'left-0' : 'right-0'} z-50 h-full w-full lg:w-[560px] bg-white shadow-2xl border-l border-slate-200 overflow-y-auto`}
                        >
                            <div className="p-6 border-b border-slate-100">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm text-slate-500">{t('drawer.title')}</p>
                                        <h2 className="text-xl font-bold text-slate-900">
                                            {getVenueTitle(activeVenue)}
                                        </h2>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${getStatusColor(activeVenue.status)}`}>
                                                {activeVenue.status}
                                            </span>
                                            {activeVenue.category && (
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border border-slate-200 text-slate-600">
                                                    {activeVenue.category}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setActiveVenue(null)}
                                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                                    >
                                        <span className="sr-only">{commonT('close')}</span>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-3">
                                    {(activeVenue.images || []).slice(0, 4).map((image, idx) => (
                                        <div key={`${activeVenue.id}-image-${idx}`} className="aspect-video bg-slate-100 rounded-xl overflow-hidden">
                                            <img src={image} alt={getVenueTitle(activeVenue)} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>

                                {activeVenue.description && (
                                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                        <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">{t('drawer.sections.description')}</p>
                                        <p className="text-sm text-slate-700 leading-relaxed">{activeVenue.description}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-xs text-slate-500 mb-1">{t('fields.price')}</p>
                                        <p className="font-medium text-slate-900">{formatPrice(activeVenue)}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-xs text-slate-500 mb-1">{t('fields.capacity')}</p>
                                        <p className="font-medium text-slate-900">{formatCapacity(activeVenue)}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-xs text-slate-500 mb-1">{t('fields.location')}</p>
                                        <p className="font-medium text-slate-900">{formatLocation(activeVenue)}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-xs text-slate-500 mb-1">{t('fields.address')}</p>
                                        <p className="font-medium text-slate-900">{activeVenue.address || '-'}</p>
                                    </div>
                                </div>

                                {activeVenue.amenities && activeVenue.amenities.length > 0 && (
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">{t('drawer.sections.amenities')}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {activeVenue.amenities.map((amenity, idx) => (
                                                <span key={`${activeVenue.id}-amenity-${idx}`} className="px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200">
                                                    {amenity}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-500 mb-3">{t('drawer.sections.owner')}</p>
                                    <div className="space-y-2 text-sm text-slate-700">
                                        <div className="flex justify-between gap-4">
                                            <span className="text-slate-500">{t('fields.owner')}</span>
                                            <span className="font-medium text-slate-900">{ownerFromVenue(activeVenue)?.business_name || ownerFromVenue(activeVenue)?.full_name || '-'}</span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-slate-500">{t('fields.email')}</span>
                                            <span className="font-medium text-slate-900">{ownerFromVenue(activeVenue)?.email || '-'}</span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-slate-500">{t('fields.phone')}</span>
                                            <span className="font-medium text-slate-900">{ownerFromVenue(activeVenue)?.phone || '-'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-500 mb-3">{t('drawer.sections.contact')}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {activeVenue.phone && (
                                            <a className="w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 text-center" href={`tel:${activeVenue.phone}`}>
                                                {t('actions.call_venue')}
                                            </a>
                                        )}
                                        {activeVenue.whatsapp && (
                                            <a className="w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 text-center" href={`https://wa.me/${activeVenue.whatsapp}`} target="_blank" rel="noreferrer">
                                                WhatsApp
                                            </a>
                                        )}
                                        {activeVenue.contact_email && (
                                            <a className="w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 text-center" href={`mailto:${activeVenue.contact_email}`}>
                                                Email
                                            </a>
                                        )}
                                        {activeVenue.facebook_url && (
                                            <a className="w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 text-center" href={activeVenue.facebook_url} target="_blank" rel="noreferrer">
                                                Facebook
                                            </a>
                                        )}
                                        {activeVenue.instagram_url && (
                                            <a className="w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 text-center" href={activeVenue.instagram_url} target="_blank" rel="noreferrer">
                                                Instagram
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    {ownerFromVenue(activeVenue)?.phone ? (
                                        <a
                                            href={`tel:${ownerFromVenue(activeVenue)?.phone}`}
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-all"
                                        >
                                            <Emoji name="telephone" width={14} />
                                            {t('actions.call_owner')}
                                        </a>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-400 text-sm font-medium rounded-lg"
                                        >
                                            <Emoji name="telephone" width={14} />
                                            {t('actions.call_owner')}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleOpenNotification(activeVenue)}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-primary-200 hover:bg-primary-50 text-primary-600 text-sm font-medium rounded-lg transition-all"
                                    >
                                        <Emoji name="bell" width={14} />
                                        {t('actions.notify_owner')}
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(activeVenue.id, 'published')}
                                        disabled={isSubmitting === activeVenue.id}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm shadow-green-200"
                                    >
                                        <Emoji name="check-mark" width={14} />
                                        {t('actions.approve')}
                                    </button>
                                    <button
                                        onClick={() => handleOpenReject(activeVenue)}
                                        disabled={isSubmitting === activeVenue.id}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-sm font-medium rounded-lg transition-all"
                                    >
                                        <Emoji name="cross-mark" width={14} />
                                        {t('actions.reject')}
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(activeVenue.id, 'pending')}
                                        disabled={isSubmitting === activeVenue.id}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-amber-200 hover:bg-amber-50 text-amber-700 text-sm font-medium rounded-lg transition-all"
                                    >
                                        <Emoji name="hourglass-not-done" width={14} />
                                        {t('actions.pending')}
                                    </button>
                                </div>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Rejection Modal */}
            <AnimatePresence>
                {showRejectModal && rejectVenue && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <Emoji name="cross-mark" width={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{t('reject_modal.title')}</h3>
                                    <p className="text-sm text-slate-500">{getVenueTitle(rejectVenue)}</p>
                                </div>
                            </div>

                            <p className="text-slate-600 mb-4">
                                {t('reject_modal.description', { venue: getVenueTitle(rejectVenue) })}
                            </p>

                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder={t('reject_modal.placeholder')}
                                className="w-full h-32 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4 resize-none text-sm"
                            />

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowRejectModal(false)}
                                    disabled={isSubmitting === rejectVenue.id}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                                >
                                    {t('reject_modal.cancel')}
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(rejectVenue.id, 'rejected', rejectionReason)}
                                    disabled={!rejectionReason.trim() || isSubmitting === rejectVenue.id}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSubmitting === rejectVenue.id ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            {t('reject_modal.submitting')}
                                        </>
                                    ) : (
                                        <>
                                            <Emoji name="cross-mark" width={14} />
                                            {t('reject_modal.confirm')}
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Notification Modal */}
            <AnimatePresence>
                {notifyTarget && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Emoji name="bell" width={20} />
                                    <h3 className="text-lg font-bold text-slate-900">{t('notify.title')}</h3>
                                </div>
                                <button
                                    onClick={() => setNotifyTarget(null)}
                                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                                >
                                    <span className="sr-only">{commonT('close')}</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {notifyResult && (
                                <div className={`mb-4 p-3 rounded-lg text-sm ${notifyResult.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    {notifyResult.message}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">{t('notify.fields.title')}</label>
                                    <input
                                        value={notifyTitle}
                                        onChange={(e) => setNotifyTitle(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder={t('notify.placeholders.title')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">{t('notify.fields.message')}</label>
                                    <textarea
                                        value={notifyMessage}
                                        onChange={(e) => setNotifyMessage(e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                        placeholder={t('notify.placeholders.message')}
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(['info', 'success', 'warning', 'error'] as const).map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setNotifyType(type)}
                                            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${notifyType === type ? 'bg-primary-50 border-primary-200 text-primary-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            {t(`notify.types.${type}`)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setNotifyTarget(null)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    {commonT('cancel')}
                                </button>
                                <button
                                    onClick={handleSendNotification}
                                    disabled={notifySubmitting || !notifyTitle.trim() || !notifyMessage.trim()}
                                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium disabled:opacity-50"
                                >
                                    {notifySubmitting ? commonT('loading') : t('notify.send')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
