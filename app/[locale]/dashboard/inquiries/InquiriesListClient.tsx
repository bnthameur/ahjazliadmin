'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Emoji } from 'react-apple-emojis';

interface Inquiry {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    message: string;
    created_at: string;
    venue_id: string;
    status?: string;
    venues?: {
        title: string;
        name: string;
    } | {
        title: string;
        name: string;
    }[];
}

export default function InquiriesListClient({ inquiries }: { inquiries: Inquiry[] }) {
    const t = useTranslations('Inquiries');

    const getStatusColor = (status?: string) => {
        const colors: Record<string, string> = {
            'new': 'bg-blue-100 text-blue-700 border-blue-200',
            'read': 'bg-amber-100 text-amber-700 border-amber-200',
            'replied': 'bg-green-100 text-green-700 border-green-200',
            'closed': 'bg-slate-100 text-slate-700 border-slate-200',
        };
        return colors[status || 'new'] || colors.new;
    };

    return (
        <>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Emoji name="speech-balloon" width={28} />
                    {t('title')}
                </h1>
                <p className="text-slate-600 mt-1">{t('subtitle')}</p>
            </div>

            {/* Inquiries Grid */}
            <div className="grid grid-cols-1 gap-4">
                {inquiries.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl border border-slate-200 p-12 text-center"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                            <Emoji name="speech-balloon" width={32} className="opacity-50" />
                        </div>
                        <p className="text-slate-500">{t('no_inquiries')}</p>
                    </motion.div>
                ) : (
                    inquiries.map((inquiry, index) => (
                        <motion.div
                            key={inquiry.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-primary-200 transition-all duration-300"
                        >
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    {/* Header Row */}
                                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center text-primary-700 font-bold">
                                                {inquiry.customer_name?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-900">
                                                    {inquiry.customer_name}
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    {new Date(inquiry.created_at).toLocaleDateString()} at {new Date(inquiry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${getStatusColor(inquiry.status)}`}>
                                            {inquiry.status || 'new'}
                                        </span>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="flex flex-wrap gap-3 text-sm mb-4">
                                        <a 
                                            href={`mailto:${inquiry.customer_email}`} 
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors"
                                        >
                                            <Emoji name="e-mail" width={14} />
                                            {inquiry.customer_email}
                                        </a>
                                        {inquiry.customer_phone && (
                                            <a 
                                                href={`tel:${inquiry.customer_phone}`} 
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors"
                                            >
                                                <Emoji name="telephone" width={14} />
                                                {inquiry.customer_phone}
                                            </a>
                                        )}
                                    </div>

                                    {/* Message */}
                                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl mb-4">
                                        <div className="flex items-start gap-2">
                                            <Emoji name="speech-balloon" width={16} className="mt-0.5 opacity-50" />
                                            <p className="text-slate-700 text-sm leading-relaxed">{inquiry.message}</p>
                                        </div>
                                    </div>

                                    {/* Venue Info */}
                                    {inquiry.venues && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-slate-500">{t('fields.venue')}:</span>
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-lg font-medium">
                                                <Emoji name="classical-building" width={14} />
                                                {Array.isArray(inquiry.venues) 
                                                    ? (inquiry.venues[0]?.title || inquiry.venues[0]?.name)
                                                    : (inquiry.venues.title || inquiry.venues.name)
                                                }
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </>
    );
}
