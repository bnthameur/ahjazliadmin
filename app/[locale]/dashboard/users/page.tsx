import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import AdminUsersClient from './AdminUsersClient';

// Dynamic rendering for pages with searchParams
export const dynamic = 'force-dynamic';

export default async function UsersPage({ 
    searchParams 
}: { 
    searchParams: Promise<{ status?: string }> 
}) {
    const params = await searchParams;
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const statusFilter = params.status || 'pending';

    // Fetch users (profiles)
    const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', statusFilter)
        .eq('role', 'venue_owner') // Only show venue owners for approval
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading users:', error);
    }

    return (
        <div className="p-6 lg:p-8">
            <AdminUsersClient initialUsers={users || []} statusFilter={statusFilter} />
        </div>
    );
}
