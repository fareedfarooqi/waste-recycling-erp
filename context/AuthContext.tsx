'use client';

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface AuthContextType {
    authUserId: string | null;
    setAuthUserId: React.Dispatch<React.SetStateAction<string | null>>;
    loading: boolean;
    profilePicUrl: string;
    profileLoading: boolean;
    refreshProfilePicture: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const supabase = createClientComponentClient();

    const [authUserId, setAuthUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [profilePicUrl, setProfilePicUrl] = useState('');
    const [profileLoading, setProfileLoading] = useState(true);

    const fetchProfilePicture = useCallback(async () => {
        try {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError) {
                console.error(
                    'Error getting user in fetchProfilePicture:',
                    userError.message
                );
                return;
            }
            if (!user) {
                return;
            }

            const { data: profileData, error: profileError } = await supabase
                .from('company_users')
                .select('profile_picture')
                .eq('user_id', user.id)
                .single();

            if (profileError) {
                console.error(
                    'Error fetching profile row:',
                    profileError.message
                );
                return;
            }

            if (profileData?.profile_picture) {
                const { data: signedUrlData, error: signedUrlError } =
                    await supabase.storage
                        .from('profile-pictures')
                        .createSignedUrl(profileData.profile_picture, 86400); // Lasts 24 hours.

                if (!signedUrlError && signedUrlData?.signedUrl) {
                    setProfilePicUrl(signedUrlData.signedUrl);
                } else {
                    setProfilePicUrl('');
                }
            } else {
                setProfilePicUrl('');
            }
        } catch (err) {
            console.error('Unexpected error in fetchProfilePicture:', err);
        }
    }, [supabase]);

    const refreshProfilePicture = useCallback(async () => {
        setProfileLoading(true);
        await fetchProfilePicture();
        setProfileLoading(false);
    }, [fetchProfilePicture]);

    const initAuthAndProfile = useCallback(async () => {
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (user && !error) {
            setAuthUserId(user.id);
        }
        setLoading(false);

        await fetchProfilePicture();
        setProfileLoading(false);
    }, [supabase, fetchProfilePicture]);

    useEffect(() => {
        initAuthAndProfile();
    }, [initAuthAndProfile]);

    return (
        <AuthContext.Provider
            value={{
                authUserId,
                setAuthUserId,
                loading,
                profilePicUrl,
                profileLoading,
                refreshProfilePicture,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
