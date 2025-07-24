import Link from 'next/link';
import { ArrowLeft, ParkingCircle, Store, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function BrowseServicesPage() {
  const services = [
    {
      href: '/dashboard/services/parking',
      icon: <ParkingCircle className="h-8 w-8 text-indigo-500" />,
      title: 'ที่จอดรถ',
      description: 'ค้นหาและลงทะเบียนที่จอดรถรายเดือน',
    },
    {
      href: '/dashboard/services/markets',
      icon: <Store className="h-8 w-8 text-green-500" />,
      title: 'แผงตลาด',
      description: 'ค้นหาแผงค้าว่างในตลาดของเทศบาล',
    },
    {
      href: '/dashboard/services/rentals',
      icon: <Building2 className="h-8 w-8 text-orange-500" />,
      title: 'พื้นที่เช่า',
      description: 'ค้นหาอาคารหรือพื้นที่เช่าที่ว่าง',
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <header className="flex items-center mb-6">
        <Button asChild variant="ghost" size="icon" className="mr-2">
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">ค้นหาบริการ</h1>
      </header>
      <div className="grid gap-4">
        {services.map((service) => (
          <Link href={service.href} key={service.title} className="block">
            <Card className="hover:bg-secondary transition-colors">
              <CardHeader className="flex flex-row items-center gap-4 p-4">
                <div className="p-3 bg-muted rounded-lg">{service.icon}</div>
                <div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
