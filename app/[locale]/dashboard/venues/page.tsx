import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import AdminVenuesClient from './AdminVenuesClient';

// Dynamic rendering for pages with searchParams
export const dynamic = 'force-dynamic';

export default async function VenuesPage({ 
    searchParams 
}: { 
    searchParams: Promise<{ status?: string }> 
}) {
    const params = await searchParams;
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const statusFilter = params.status || 'pending';

    // Fetch venues with profile information
    const { data: venues, error } = await supabase
        .from('venues')
        .select(`
            id,
            title,
            name,
            description,
            category,
            location,
            wilaya,
            city,
            address,
            price,
            price_min,
            price_max,
            capacity,
            capacity_min,
            capacity_max,
            phone,
            whatsapp,
            contact_email,
            facebook_url,
            instagram_url,
            amenities,
            images,
            status,
            rejection_reason,
            created_at,
            updated_at,
            owner_id,
            profiles:owner_id (
                full_name,
                email,
                business_name,
                phone
            )
        `)
        .eq('status', statusFilter)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading venues:', error);
    }

    return (
        <div className="p-6 lg:p-8">
            <AdminVenuesClient initialVenues={venues || []} statusFilter={statusFilter} />
        </div>
    );
}
