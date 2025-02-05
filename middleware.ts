import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    const { pathname } = req.nextUrl;

    if (
        pathname.startsWith('/sign-in') ||
        pathname.startsWith('/forgot-password') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/staff') ||
        pathname === '/favicon.ico' ||
        /\.(svg|png|jpg|jpeg|gif|webp)$/.test(pathname)
    ) {
        return res; // allow
    }

    const {
        data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
        // So basically if our user is NOT logged in redirect them to 'sign-in' page.
        const signInUrl = new URL('/sign-in', req.url);
        return NextResponse.redirect(signInUrl);
    }

    if (pathname.startsWith('/customers/add')) {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            const signInUrl = new URL('/sign-in', req.url);
            return NextResponse.redirect(signInUrl);
        }

        const { data: companyUser, error } = await supabase
            .from('company_users')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle();

        if (!companyUser || !['admin', 'manager'].includes(companyUser.role)) {
            const customersUrl = new URL('/customers', req.url);
            return NextResponse.redirect(customersUrl);
        }
    }

    return res;
}

export const config = {
    matcher: ['/(.*)'],
};
