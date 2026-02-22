'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Emoji } from 'react-apple-emojis';
import { updateUserStatus, sendNotification } from '../actions';

interface UserProfile {
    id: string;
    full_name: string | null;
    email: string | null;
    role: string;
    status: string;
    business_name?: string | null;
    phone?: string | null;
    created_at: string;
}

interface AdminUsersClientProps {
    initialUsers: UserProfile[];
    statusFilter: string;
}

export default function AdminUsersClient({ initialUsers, statusFilter }: AdminUsersClientProps) {
    const t = useTranslations('Users');
    const commonT = useTranslations('Common');
    const [users, setUsers] = useState<UserProfile[]>(initialUsers);
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
    const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');

    const [notifyTarget, setNotifyTarget] = useState<UserProfile | null>(null);
    const [notifyTitle, setNotifyTitle] = useState('');
    const [notifyMessage, setNotifyMessage] = useState('');
    const [notifyType, setNotifyType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
    const [notifySubmitting, setNotifySubmitting] = useState(false);
    const [notifyResult, setNotifyResult] = useState<{ success: boolean; message: string } | null>(null);

    useEffect(() => {
        setUsers(initialUsers);
    }, [initialUsers]);

    useEffect(() => {
        if (typeof document !== 'undefined') {
            const nextDir = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr';
            setDir(nextDir);
        }
    }, []);

    const handleUpdateStatus = async (userId: string, status: 'pending' | 'active' | 'rejected') => {
        setIsSubmitting(userId);
        try {
            const result = await updateUserStatus(userId, status);
            if (result.success) {
                setUsers(users.filter(u => u.id !== userId));
            }
        } catch (error) {
            console.error('Error updating user status:', error);
            alert(commonT('error'));
        } finally {
            setIsSubmitting(null);
        }
    };

    const handleOpenNotification = (user: UserProfile) => {
        setNotifyTarget(user);
        setNotifyTitle(`Message for ${user.full_name || user.email || 'user'}`);
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
                notifyTarget.id,
                notifyTitle,
                notifyMessage,
                notifyType
            );
            if (response.success) {
                setNotifyResult({ success: true, message: `Notification sent to ${notifyTarget.full_name || notifyTarget.email || 'user'}.` });
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
        { key: 'active', label: t('tabs.active'), emoji: 'check-mark-button' },
        { key: 'rejected', label: t('tabs.rejected'), emoji: 'cross-mark' },
    ];

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-orange-100 text-orange-700 border-orange-200',
            active: 'bg-green-100 text-green-700 border-green-200',
            rejected: 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[status] || 'bg-slate-100 text-slate-700';
    };

    const getRoleColor = (role: string) => {
        const colors: Record<string, string> = {
            admin: 'bg-purple-100 text-purple-700 border-purple-200',
            venue_owner: 'bg-blue-100 text-blue-700 border-blue-200',
            user: 'bg-slate-100 text-slate-700 border-slate-200',
        };
        return colors[role] || 'bg-slate-100 text-slate-700';
    };
    const chipClass = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600';

    const filteredUsers = users.filter((user) => {
        const needle = query.trim().toLowerCase();
        if (!needle) return true;
        const haystack = [
            user.full_name,
            user.email,
            user.business_name,
            user.phone,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
        return haystack.includes(needle);
    });

    const renderActionButtons = (user: UserProfile) => (
        <div className="flex flex-wrap gap-2">
            {statusFilter !== 'active' && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleUpdateStatus(user.id, 'active')}
                    disabled={isSubmitting === user.id}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm shadow-green-200"
                >
                    <Emoji name="check-mark" width={14} />
                    {t('actions.approve')}
                </motion.button>
            )}
            {statusFilter !== 'rejected' && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleUpdateStatus(user.id, 'rejected')}
                    disabled={isSubmitting === user.id}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-sm font-medium rounded-lg transition-all"
                >
                    <Emoji name="cross-mark" width={14} />
                    {t('actions.reject')}
                </motion.button>
            )}
            {statusFilter !== 'pending' && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleUpdateStatus(user.id, 'pending')}
                    disabled={isSubmitting === user.id}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-amber-200 hover:bg-amber-50 text-amber-700 text-sm font-medium rounded-lg transition-all"
                >
                    <Emoji name="hourglass-not-done" width={14} />
                    {t('actions.pending')}
                </motion.button>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Emoji name="busts-in-silhouette" width={28} />
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
                            className="bg-transparent outline-none text-sm text-slate-700 w-48"
                        />
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-primary-50 border border-primary-200 text-primary-700 text-sm font-medium">
                        {filteredUsers.length} {t('summary', { status: t(`tabs.${statusFilter}`) })}
                    </div>
                </div>
            </div>

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

            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredUsers.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl border border-slate-200 p-12 text-center"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                                <Emoji name="busts-in-silhouette" width={32} className="opacity-50" />
                            </div>
                            <p className="text-slate-500">
                                {t('no_users', { status: t(`tabs.${statusFilter}`) })}
                            </p>
                        </motion.div>
                    ) : (
                        filteredUsers.map((user, index) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6 hover:shadow-lg hover:border-primary-200 transition-all duration-300"
                            >
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center text-primary-700 font-bold text-xl">
                                            {(user.full_name || user.email || '?')[0]?.toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-lg font-semibold text-slate-900 truncate">
                                                    {user.full_name || user.email || 'Unknown'}
                                                </h3>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${getStatusColor(user.status)}`}>
                                                    {user.status}
                                                </span>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${getRoleColor(user.role)}`}>
                                                    {t(`roles.${user.role}`)}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {user.email && (
                                                    <span className={chipClass}>
                                                        <span className="text-slate-500">{t('fields.email')}</span>
                                                        <span className="font-medium text-slate-900 truncate">{user.email}</span>
                                                    </span>
                                                )}
                                                {user.phone && (
                                                    <span className={chipClass}>
                                                        <span className="text-slate-500">{t('fields.phone')}</span>
                                                        <span className="font-medium text-slate-900">{user.phone}</span>
                                                    </span>
                                                )}
                                                {user.business_name && (
                                                    <span className={chipClass}>
                                                        <span className="text-slate-500">{t('fields.business')}</span>
                                                        <span className="font-medium text-slate-900">{user.business_name}</span>
                                                    </span>
                                                )}
                                                <span className={chipClass}>
                                                    <span className="text-slate-500">{t('fields.joined')}</span>
                                                    <span className="font-medium text-slate-900">{new Date(user.created_at).toLocaleDateString()}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <button
                                            onClick={() => setActiveUser(user)}
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-all"
                                        >
                                            <Emoji name="id-button" width={14} />
                                            {t('actions.view')}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {activeUser && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 z-40"
                            onClick={() => setActiveUser(null)}
                        />
                        <motion.aside
                            initial={{ x: dir === 'rtl' ? '-100%' : '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: dir === 'rtl' ? '-100%' : '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 260 }}
                            className={`fixed top-0 ${dir === 'rtl' ? 'left-0' : 'right-0'} z-50 h-full w-full sm:w-[480px] bg-white shadow-2xl border-l border-slate-200 overflow-y-auto`}
                        >
                            <div className="p-6 border-b border-slate-100">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm text-slate-500">{t('drawer.title')}</p>
                                        <h2 className="text-xl font-bold text-slate-900">
                                            {activeUser.full_name || activeUser.email || 'Unknown'}
                                        </h2>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${getStatusColor(activeUser.status)}`}>
                                                {activeUser.status}
                                            </span>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${getRoleColor(activeUser.role)}`}>
                                                {t(`roles.${activeUser.role}`)}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setActiveUser(null)}
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
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-500 mb-3">{t('drawer.sections.profile')}</p>
                                    <div className="space-y-2 text-sm text-slate-700">
                                        <div className="flex justify-between gap-4">
                                            <span className="text-slate-500">{t('fields.name')}</span>
                                            <span className="font-medium text-slate-900">{activeUser.full_name || '-'}</span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-slate-500">{t('fields.email')}</span>
                                            <span className="font-medium text-slate-900">{activeUser.email || '-'}</span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-slate-500">{t('fields.phone')}</span>
                                            <span className="font-medium text-slate-900">{activeUser.phone || '-'}</span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-slate-500">{t('fields.business')}</span>
                                            <span className="font-medium text-slate-900">{activeUser.business_name || '-'}</span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-slate-500">{t('fields.joined')}</span>
                                            <span className="font-medium text-slate-900">{new Date(activeUser.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-slate-500">{t('fields.id')}</span>
                                            <span className="font-mono text-xs text-slate-500">{activeUser.id}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-500 mb-3">{t('drawer.sections.actions')}</p>
                                    <div className="flex flex-wrap gap-3">
                                        {activeUser.phone ? (
                                            <a
                                                href={`tel:${activeUser.phone}`}
                                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-all"
                                            >
                                                <Emoji name="telephone" width={14} />
                                                {t('actions.call')}
                                            </a>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled
                                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-400 text-sm font-medium rounded-lg"
                                            >
                                                <Emoji name="telephone" width={14} />
                                                {t('actions.call')}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleOpenNotification(activeUser)}
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-primary-200 hover:bg-primary-50 text-primary-600 text-sm font-medium rounded-lg transition-all"
                                        >
                                            <Emoji name="bell" width={14} />
                                            {t('actions.notify')}
                                        </button>
                                        {renderActionButtons(activeUser)}
                                    </div>
                                </div>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

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
