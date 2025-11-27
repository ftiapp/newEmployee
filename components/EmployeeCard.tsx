import Image from 'next/image';
import { Employee } from '@/lib/db';
import { ExternalLink, Building2, Calendar, User, Mail, Phone, Badge } from 'lucide-react';

interface EmployeeCardProps {
  employee: Employee;
}

export default function EmployeeCard({ employee }: EmployeeCardProps) {
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const ftiConnectUrl = `https://ftiworkforcedatabasefronten-fxqtu.kinsta.app/app/employees/${employee.id}`;

  return (
    <div className="bg-white rounded-xl border-2 border-blue-200 overflow-hidden">

      <div className="flex flex-col">

        {/* Image / Avatar */}
        <div className="w-full bg-slate-100 border-b border-slate-200">
          <div className="relative w-full h-56 md:h-64 lg:h-72 overflow-hidden flex items-center justify-center">

            {employee.imageUrl && employee.imageUrl.trim() !== '' ? (
              <Image
                src={employee.imageUrl.startsWith('http') ? employee.imageUrl : employee.imageUrl.startsWith('/') ? employee.imageUrl : `https://res.cloudinary.com/dqsjatyw0/image/upload/v1750144132/FTI-Contact/user-images-prod/${employee.imageUrl}`}
                alt={employee.fullName}
                fill
                sizes="(min-width: 1024px) 360px, (min-width: 768px) 320px, 100vw"
                className="object-contain"

              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-16 h-16 text-slate-400" />
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 space-y-3">

          {/* Name */}
          <div>
            <h3 className="text-base font-semibold text-slate-900 mb-0.5 line-clamp-2">
              {employee.fullName}
            </h3>
          </div>

          {/* Details */}
          <div className="space-y-1.5 text-sm">

            {employee.nickname && (
              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500">ชื่อเล่น</p>
                  <p className="text-sm text-slate-700">{employee.nickname}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500">ฝ่าย/สถาบัน</p>
                <p className="text-sm text-slate-700 line-clamp-2">{employee.department}</p>
              </div>
            </div>
            {(employee.bandLevel || employee.position) && (
              <div className="flex items-start gap-2.5">
                <Badge className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500">ตำแหน่ง</p>
                  <p className="text-sm text-slate-700 line-clamp-2">
                    {employee.bandLevel || employee.position}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500">วันที่เริ่มงาน</p>
                <p className="text-sm text-slate-700">{formatDate(employee.createdAt)}</p>
              </div>
            </div>
            {employee.email && (
              <div className="flex items-start gap-2.5 pt-1 border-t border-dashed border-slate-200 mt-1">
                <Mail className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500">อีเมล</p>
                  <p className="text-sm text-slate-700 line-clamp-1">{employee.email}</p>
                </div>
              </div>
            )}
            {employee.tel && (
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500">เบอร์โทรศัพท์</p>
                  <p className="text-sm text-slate-700">{employee.tel}</p>
                </div>
              </div>
            )}
          </div>
          {/* Action Button */}
          <div className="pt-1">

            <a
              href={ftiConnectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
            >
              <span>ดูข้อมูลเพิ่มเติม</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}