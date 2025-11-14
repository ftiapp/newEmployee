import { useQuery } from '@tanstack/react-query';

export interface Employee {
  id: string;
  userAD: string;
  fullName: string;
  fullNameEN: string;
  nickname: string;
  imageUrl: string;
  departmentCode: string;
  department: string;
  departmentENG: string;
  departmentNickname: string;
  empCode: string;
  email: string;
  tel: string;
  bandCode: string;
  bandLevel: string;
  sortLevel: number;
  position: string;
  active: boolean;
  createdAt: Date;
  firstWorkingDate: Date;  // เปลี่ยนจาก string เป็น Date
}

export interface Department {
  id: string;
  name: string;
}

export interface CareerBand {
  id: string;
  name: string;
}

export const useEmployees = (params?: {
  startDate?: string;
  endDate?: string;
  department?: string;
  bandLevel?: string;
  isNewEmployee?: boolean;
}) => {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.startDate) searchParams.set('startDate', params.startDate);
      if (params?.endDate) searchParams.set('endDate', params.endDate);
      if (params?.department) searchParams.set('department', params.department);
      if (params?.bandLevel) searchParams.set('position', params.bandLevel);
      if (params?.isNewEmployee) searchParams.set('newEmployee', 'true');

      const response = await fetch(`/api/employees?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const data = await response.json();
      
      // Transform string dates to Date objects
      return data.map((employee: any) => ({
        ...employee,
        createdAt: new Date(employee.createdAt),
        firstWorkingDate: new Date(employee.firstWorkingDate),
      })) as Employee[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await fetch('/api/employees?type=departments');
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      return response.json() as Promise<Department[]>;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - departments change less frequently
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useCareerBands = () => {
  return useQuery({
    queryKey: ['careerBands'],
    queryFn: async () => {
      const response = await fetch('/api/employees?type=careerBands');
      if (!response.ok) {
        throw new Error('Failed to fetch career bands');
      }
      return response.json() as Promise<CareerBand[]>;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - career bands change less frequently
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};