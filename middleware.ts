import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');
  const sharepointDomain = 'ftiorth.sharepoint.com';
  const { pathname } = request.nextUrl;
  
  // Skip all static asset requests (files with an extension such as .png, .webp, .svg, .css, .js)
  if (pathname.includes('.')) {
    return NextResponse.next();
  }
  
  // ยกเว้น localhost:3000 สำหรับการพัฒนา
  if (host === 'localhost:3000') {
    return NextResponse.next();
  }
  
  // ตรวจสอบว่ามาจาก SharePoint หรือไม่
  if (!referer || !referer.includes(sharepointDomain)) {
    // ถ้าไม่ได้มาจาก SharePoint ให้ redirect ไปหน้า access-denied
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
