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
    <div className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-slate-200">
      {/* Image Section */}
      <div className="relative h-56 bg-gradient-to-br from-blue-50 via-blue-100 to-slate-100 overflow-hidden">
        {employee.imageUrl && employee.imageUrl.trim() !== '' ? (
          <>
            <Image
              src={employee.imageUrl.startsWith('http') ? employee.imageUrl : employee.imageUrl.startsWith('/') ? employee.imageUrl : `https://res.cloudinary.com/dqsjatyw0/image/upload/v1750144132/FTI-Contact/user-images-prod/${employee.imageUrl}`}
              alt={employee.fullName}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </>
        ) : (
          /* แสดงเมื่อไม่มีรูปในฐานข้อมูล */
          <div className="flex items-center justify-center h-full">
            <div className="p-6 bg-white/80 rounded-full">
              <User className="w-16 h-16 text-blue-400" />
            </div>
          </div>
        )}
        
        {/* Overlay Badge */}
        <div className="absolute top-3 right-3">
          <div className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md">
            <span className="text-xs font-semibold text-blue-600">พนักงานใหม่</span>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-5">
        {/* Name */}
        <h3 className="text-lg font-bold text-slate-800 mb-3 line-clamp-2 min-h-[3.5rem]">
          {employee.fullName}
        </h3>
        
        {/* Details */}
        <div className="space-y-2.5 mb-4">
          {employee.nickname && (
            <div className="flex items-start gap-2.5">
              <User className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 font-medium">ชื่อเล่น</p>
                <p className="text-sm text-slate-700 font-medium">{employee.nickname}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-start gap-2.5">
            <Building2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 font-medium">ฝ่าย/สถาบัน</p>
              <p className="text-sm text-slate-700 font-medium line-clamp-2">{employee.department}</p>
            </div>
          </div>
          
          {employee.position && (
            <div className="flex items-start gap-2.5">
              <Badge className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 font-medium">ตำแหน่ง</p>
                <p className="text-sm text-slate-700 font-medium line-clamp-2">{employee.position}</p>
              </div>
            </div>
          )}
          
          {employee.bandLevel && (
            <div className="flex items-start gap-2.5">
              <Badge className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 font-medium">ระดับ</p>
                <p className="text-sm text-slate-700 font-medium">{employee.bandLevel}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-start gap-2.5">
            <Calendar className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 font-medium">วันที่เริ่มงาน</p>
              <p className="text-sm text-slate-700 font-medium">{formatDate(employee.createdAt)}</p>
            </div>
          </div>
          
          {employee.email && (
            <div className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 font-medium">อีเมล</p>
                <p className="text-sm text-slate-700 font-medium line-clamp-1">{employee.email}</p>
              </div>
            </div>
          )}
          
          {employee.tel && (
            <div className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 font-medium">เบอร์โทรศัพท์</p>
                <p className="text-sm text-slate-700 font-medium">{employee.tel}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Action Button */}
        <a
          href={ftiConnectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg group/btn"
        >
          <span>ดูข้อมูลเพิ่มเติม</span>
          <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </div>
  );
}