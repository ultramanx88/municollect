'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, FileText } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts';

export default function MuniDashboardPage() {
    const { user } = useAuth();
    
    return (
        <ProtectedRoute allowedRoles={['municipal_staff', 'admin']}>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">ภาพรวมเทศบาล</h1>
                    {user && (
                        <p className="text-muted-foreground">
                            ยินดีต้อนรับ, {user.firstName} {user.lastName}
                        </p>
                    )}
                </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ผู้พักอาศัยทั้งหมด</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,250</div>
                        <p className="text-xs text-muted-foreground">+50 จากเดือนที่แล้ว</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ใบแจ้งหนี้ที่ออก</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">980</div>
                        <p className="text-xs text-muted-foreground">ในรอบบิลปัจจุบัน</p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>กิจกรรมล่าสุด</CardTitle>
                    <CardDescription>แสดงกิจกรรมล่าสุดที่เกิดขึ้นในระบบของคุณ</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>ยังไม่มีกิจกรรมล่าสุด</p>
                </CardContent>
            </Card>
        </div>
        </ProtectedRoute>
    )
}
