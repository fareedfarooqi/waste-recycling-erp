import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface RolePermissions {
    view_customers: boolean;
    add_customer: boolean;
    edit_customer: boolean;
    remove_customer: boolean;
    change_role_allowed: string[];
    view_driver_interface: boolean;
    import_csv: boolean;
    export_csv: boolean;
    delete_pickup: boolean;
    add_pickup: boolean;
    edit_pickup: boolean;
    pickup_import_csv: boolean;
}

export interface UserRole {
    role: 'admin' | 'manager' | 'driver' | 'warehouse';
    permissions: RolePermissions;
}

export function useUserRole() {
    const supabase = createClientComponentClient();
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function fetchUserRole() {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();
            if (userError) {
                console.error('Error getting user:', userError);
                setUserRole(null);
                setLoading(false);
                return;
            }
            if (!user) {
                setUserRole(null);
                setLoading(false);
                return;
            }

            const { data: companyUser, error: companyUserError } =
                await supabase
                    .from('company_users')
                    .select('role')
                    .eq('user_id', user.id)
                    .single();

            if (companyUserError || !companyUser) {
                console.error('Error fetching company user:', companyUserError);
                setUserRole(null);
                setLoading(false);
                return;
            }

            const userRoleName = companyUser.role;

            const { data: roleData, error: roleError } = await supabase
                .from('user_roles')
                .select('permissions')
                .eq('role_name', userRoleName)
                .single();

            if (roleError || !roleData) {
                console.error('Error fetching role data:', roleError);
                setUserRole(null);
                setLoading(false);
                return;
            }

            setUserRole({
                role: userRoleName,
                permissions: roleData.permissions,
            });
            setLoading(false);
        }

        fetchUserRole();
    }, []);

    return { userRole, loading };
}
