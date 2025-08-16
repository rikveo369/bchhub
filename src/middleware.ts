import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Assume all routes under /api/channels and /api/blog (except for public GET) are protected
  if (pathname.startsWith('/api/channels') ||
      (pathname.startsWith('/api/blog') && request.method !== 'GET')) {

    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Authorization token not provided' }, { status: 401 });
    }

    try {
      await jwtVerify(token, secret);
      // You could attach the user payload to the request headers if needed
      // const { payload } = await jwtVerify(token, secret);
      // request.headers.set('x-user-id', payload.userId as string);
      return NextResponse.next();
    } catch (error) {
      console.error('JWT Verification Error:', error);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/api/:path*',
}
