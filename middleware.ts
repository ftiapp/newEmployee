import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const referer = request.headers.get('referer');
  const sharepointDomain = 'ftiorth.sharepoint.com';
  
  // ตรวจสอบว่ามาจาก SharePoint หรือไม่
  if (!referer || !referer.includes(sharepointDomain)) {
    // ถ้าไม่ได้มาจาก SharePoint ให้ redirect ไปหน้า error หรือ block
    return new NextResponse('Access denied: This application can only be accessed through SharePoint.', {
      status: 403,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
