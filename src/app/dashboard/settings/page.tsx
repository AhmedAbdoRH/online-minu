import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingsForm } from '@/components/dashboard/SettingsForm';


export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: catalog } = await supabase.from('catalogs').select('*').eq('user_id', user.id).single();
    if (!catalog) {
        // If no catalog, redirect to dashboard to create one
        redirect('/dashboard');
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
                <SettingsForm catalog={catalog} />
            </CardContent>
        </Card>
    );
}
