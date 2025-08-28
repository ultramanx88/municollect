'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

type DaySchedule = {
  enabled: boolean;
  open: string;
  close: string;
};

const initialSchedule: Record<string, DaySchedule> = {
  monday: { enabled: true, open: '08:30', close: '15:30' },
  tuesday: { enabled: true, open: '08:30', close: '15:30' },
  wednesday: { enabled: true, open: '08:30', close: '15:30' },
  thursday: { enabled: true, open: '08:30', close: '15:30' },
  friday: { enabled: true, open: '08:30', close: '15:30' },
  saturday: { enabled: false, open: '09:00', close: '12:00' },
  sunday: { enabled: false, open: '09:00', close: '12:00' },
};

const dayLabels: Record<string, string> = {
  monday: 'วันจันทร์',
  tuesday: 'วันอังคาร',
  wednesday: 'วันพุธ',
  thursday: 'วันพฤหัสบดี',
  friday: 'วันศุกร์',
  saturday: 'วันเสาร์',
  sunday: 'วันอาทิตย์',
};

export default function CollectionSettingsPage() {
  const [schedule, setSchedule] = useState(initialSchedule);
  const [holidays, setHolidays] = useState<Date[]>([new Date('2024-12-10'), new Date('2024-12-31')]);
  const [newHoliday, setNewHoliday] = useState('');
  const [cutoffEnabled, setCutoffEnabled] = useState(true);
  const { toast } = useToast();

  const handleScheduleChange = (day: string, field: keyof DaySchedule, value: string | boolean) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const applyToWeekdays = () => {
    const mondaySchedule = schedule.monday;
    setSchedule(prev => ({
      ...prev,
      tuesday: { ...prev.tuesday, ...mondaySchedule },
      wednesday: { ...prev.wednesday, ...mondaySchedule },
      thursday: { ...prev.thursday, ...mondaySchedule },
      friday: { ...prev.friday, ...mondaySchedule },
    }));
    toast({ title: 'ใช้การตั้งค่ากับวันทำการทั้งหมดแล้ว' });
  };
  
  const handleAddHoliday = () => {
    if (newHoliday) {
      const holidayDate = new Date(newHoliday);
      // Adjust for timezone offset to prevent off-by-one day errors
      const adjustedDate = new Date(holidayDate.getTime() + holidayDate.getTimezoneOffset() * 60000);
      if (!holidays.find(h => h.getTime() === adjustedDate.getTime())) {
        setHolidays([...holidays, adjustedDate].sort((a,b) => a.getTime() - b.getTime()));
        setNewHoliday('');
      } else {
        toast({ variant: 'destructive', title: 'วันที่นี้ถูกเพิ่มเป็นวันหยุดแล้ว' });
      }
    }
  };

  const removeHoliday = (dateToRemove: Date) => {
    setHolidays(holidays.filter(h => h.getTime() !== dateToRemove.getTime()));
  };

  const handleSaveAll = () => {
    // In a real app, this would save to a backend (e.g., Firestore)
    console.log({ schedule, holidays, cutoffEnabled });
    toast({ title: 'บันทึกการตั้งค่าสำเร็จ' });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/muni-dashboard/settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">ตั้งค่าเวลารับชำระเงิน</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>เวลาทำการรับชำระ</CardTitle>
          <CardDescription>กำหนดวันและเวลาที่เปิดรับชำระเงิน ณ ที่ทำการเทศบาล</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(schedule).map(([day, { enabled, open, close }]) => (
            <div key={day} className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-lg border">
              <div className="flex items-center gap-4 flex-1">
                <Switch
                  id={`enabled-${day}`}
                  checked={enabled}
                  onCheckedChange={(checked) => handleScheduleChange(day, 'enabled', checked)}
                />
                <Label htmlFor={`enabled-${day}`} className="w-24 font-medium">{dayLabels[day]}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={open}
                  onChange={(e) => handleScheduleChange(day, 'open', e.target.value)}
                  disabled={!enabled}
                  className="w-[120px]"
                />
                <span>-</span>
                <Input
                  type="time"
                  value={close}
                  onChange={(e) => handleScheduleChange(day, 'close', e.target.value)}
                  disabled={!enabled}
                  className="w-[120px]"
                />
              </div>
            </div>
          ))}
          <div className="pt-2">
            <Button variant="secondary" onClick={applyToWeekdays}>ใช้เวลาของวันจันทร์กับทุกวันทำการ (จ-ศ)</Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>วันหยุดทำการ</CardTitle>
            <CardDescription>เพิ่มวันหยุดพิเศษที่เทศบาลปิดทำการ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input type="date" value={newHoliday} onChange={(e) => setNewHoliday(e.target.value)} />
              <Button onClick={handleAddHoliday} disabled={!newHoliday}>เพิ่มวันหยุด</Button>
            </div>
            <Separator />
            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-2">
              {holidays.length > 0 ? holidays.map(h => (
                <div key={h.toISOString()} className="flex justify-between items-center text-sm p-2 rounded-md bg-muted">
                  <span>{format(h, 'd MMMM yyyy', { locale: th })}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeHoliday(h)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="sr-only">ลบวันหยุด</span>
                  </Button>
                </div>
              )) : <p className="text-sm text-muted-foreground text-center py-4">ไม่มีวันหยุดที่กำหนด</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>การตั้งค่าการตัดรอบ</CardTitle>
            <CardDescription>จัดการวิธีการบันทึกยอดที่ชำระนอกเวลาทำการ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
                <Switch id="cutoff-switch" checked={cutoffEnabled} onCheckedChange={setCutoffEnabled} />
                <Label htmlFor="cutoff-switch" className="flex-1 cursor-pointer">
                    บันทึกยอดที่ชำระนอกเวลาทำการเป็นของวันถัดไป
                </Label>
            </div>
             <p className="text-xs text-muted-foreground">
              เมื่อเปิดใช้งาน: หากลูกบ้านชำระเงินออนไลน์หลังเวลาปิดทำการ ยอดชำระจะถูกบันทึกในรายงานของวันทำการถัดไปโดยอัตโนมัติ
            </p>
            <Button variant="outline" className="w-full">บันทึกการตั้งค่านี้เป็น Template</Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-4 mt-6 border-t">
        <Button size="lg" onClick={handleSaveAll}>บันทึกการเปลี่ยนแปลงทั้งหมด</Button>
      </div>
    </div>
  )
}
