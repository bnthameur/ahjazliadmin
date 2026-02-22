'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Emoji } from 'react-apple-emojis';
import { sendBulkNotifications, sendNotification } from '../actions';

export default function NotificationsPage() {
    const t = useTranslations('Notifications');
    const commonT = useTranslations('Common');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
    const [recipientType, setRecipientType] = useState<'all' | 'active' | 'pending' | 'specific'>('all');
    const [specificUserId, setSpecificUserId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setResult(null);

        try {
            let response;
            
            if (recipientType === 'specific') {
                if (!specificUserId.trim()) {
                    setResult({ success: false, message: 'Please enter a user ID' });
                    setIsSubmitting(false);
                    return;
                }
                response = await sendNotification(specificUserId, title, message, type);
            } else {
                response = await sendBulkNotifications(recipientType, title, message, type);
            }

            if (response.success) {
                setResult({ success: true, message: `Notification sent successfully to ${response.count} user(s)` });
                setTitle('');
                setMessage('');
                setSpecificUserId('');
            } else {
                setResult({ success: false, message: 'Failed to send notification' });
            }
        } catch (error) {
            setResult({ success: false, message: 'An error occurred' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const notificationTypes = [
        { key: 'info', label: 'Info', emoji: 'information', color: 'blue' },
        { key: 'success', label: 'Success', emoji: 'check-mark-button', color: 'green' },
        { key: 'warning', label: 'Warning', emoji: 'warning', color: 'orange' },
        { key: 'error', label: 'Error', emoji: 'cross-mark', color: 'red' },
    ];

    const recipientTypes = [
        { key: 'all', label: 'All Users', emoji: 'busts-in-silhouette' },
        { key: 'active', label: 'Active Users Only', emoji: 'check-mark-button' },
        { key: 'pending', label: 'Pending Users Only', emoji: 'hourglass-not-done' },
        { key: 'specific', label: 'Specific User', emoji: 'bust-in-silhouette' },
    ];

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Emoji name="bell" width={28} />
                    {t('title')}
                </h1>
                <p className="text-slate-600 mt-1">{t('subtitle')}</p>
            </div>

            {/* Result Message */}
            {result && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-6 p-4 rounded-xl ${result.success ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}
                >
                    <div className="flex items-center gap-2">
                        <Emoji name={result.success ? 'check-mark-button' : 'cross-mark'} width={20} />
                        {result.message}
                    </div>
                </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t('fields.title')}
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={t('placeholders.title')}
                        required
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>

                {/* Message */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t('fields.message')}
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t('placeholders.message')}
                        required
                        rows={4}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    />
                </div>

                {/* Notification Type */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t('fields.type')}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {notificationTypes.map((tType) => (
                            <button
                                key={tType.key}
                                type="button"
                                onClick={() => setType(tType.key as any)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                                    type === tType.key
                                        ? `bg-${tType.color}-50 border-${tType.color}-200 text-${tType.color}-700`
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <Emoji name={tType.emoji as any} width={16} />
                                <span className="text-sm font-medium">{tType.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recipients */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t('fields.recipients')}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {recipientTypes.map((rType) => (
                            <button
                                key={rType.key}
                                type="button"
                                onClick={() => setRecipientType(rType.key as any)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                                    recipientType === rType.key
                                        ? 'bg-primary-50 border-primary-200 text-primary-700'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <Emoji name={rType.emoji as any} width={16} />
                                <span className="text-sm font-medium">{rType.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Specific User ID (if selected) */}
                {recipientType === 'specific' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="overflow-hidden"
                    >
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            {t('fields.user_id')}
                        </label>
                        <input
                            type="text"
                            value={specificUserId}
                            onChange={(e) => setSpecificUserId(e.target.value)}
                            placeholder={t('placeholders.user_id')}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </motion.div>
                )}

                {/* Submit Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting || !title.trim() || !message.trim()}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-200"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                {t('sending')}
                            </>
                        ) : (
                            <>
                                <Emoji name="paper-plane" width={20} />
                                {t('send')}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
