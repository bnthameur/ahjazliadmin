import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import InquiriesListClient from './InquiriesListClient';

// Dynamic rendering for fresh data
export const dynamic = 'force-dynamic';

export default async function InquiriesPage() {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data: inquiries, error } = await supabase
        .from('contact_inquiries')
        .select(`
            id,
            customer_name,
            customer_email,
            customer_phone,
            message,
            created_at,
            venue_id,
            status,
            venues:venue_id (
                title,
                name
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading inquiries:', error);
    }

    return (
        <div className="p-6 lg:p-8">
            <InquiriesListClient inquiries={inquiries || []} />
        </div>
    );
}
