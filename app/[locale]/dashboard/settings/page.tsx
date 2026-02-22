import { useTranslations } from 'next-intl';

export default function SettingsPage() {
    const t = useTranslations('Admin');

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">{t('nav.settings')}</h1>
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
                <p>Global platform settings coming soon...</p>
            </div>
        </div>
    );
}
