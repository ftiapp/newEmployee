import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // อย่าบล็อกอะไรเลยในโหมด development
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // ข้าม static asset requests (ไฟล์ที่มีนามสกุล เช่น .png, .webp, .svg, .css, .js)
  if (pathname.includes('.')) {
    return NextResponse.next();
  }

  const referer = request.headers.get('referer');
  const sharepointDomain = 'ftiorth.sharepoint.com';

  // ตรวจสอบว่า request มาจาก SharePoint หรือไม่ (ใช้เฉพาะ production)
  if (!referer || !referer.includes(sharepointDomain)) {
    const url = request.nextUrl.clone();
    url.pathname = '/access-denied';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - access-denied (access denied page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|access-denied).*)',
  ],
};