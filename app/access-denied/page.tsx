import Link from "next/link";
import { ShieldX, Lock, ExternalLink } from "lucide-react";

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with logo */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">สภาอุตสาหกรรมแห่งประเทศไทย</h1>
                <p className="text-blue-100 text-sm">Federation of Thai Industries</p>
              </div>
              <ShieldX className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-12 text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                <Lock className="w-10 h-10 text-blue-600" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ไม่สามารถเข้าใช้งานได้
              </h2>
              
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                ท่านไม่สามารถเข้าใช้งานระบบตรวจสอบพนักงานใหม่ได้
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <p className="text-gray-700 mb-4">
                  กรุณาใช้งานผ่าน SharePoint เพื่อความปลอดภัยและความถูกต้อง
                </p>
                
                <Link
                  href="https://ftisharepoint"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  เข้าใช้งานผ่าน ftisharepoint
                </Link>
              </div>
            </div>

            {/* Additional Information */}
            <div className="border-t border-gray-200 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="text-center">
                  <div className="bg-gray-100 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">ความปลอดภัยสูง</h3>
                    <p className="text-gray-600">
                      ระบบได้รับการป้องกันด้วยการตรวจสอบสิทธิ์ผ่าน SharePoint
                    </p>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="bg-gray-100 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">เข้าถึงง่าย</h3>
                    <p className="text-gray-600">
                      เข้าใช้งานได้สะดวกผ่านบัญชีองค์กรของท่าน
                    </p>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="bg-gray-100 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">ติดต่อผู้ดูแล</h3>
                    <p className="text-gray-600">
                      หากพบปัญหา กรุณาติดต่อ IT Support
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-gray-500 text-sm">
              <p>© 2025 สภาอุตสาหกรรมแห่งประเทศไทย | สงวนลิขสิทธิ์</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
