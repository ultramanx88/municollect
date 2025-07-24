'use client';

import { useState, useRef, useEffect } from 'react';
import { initialMessages, type Message, initialStaff } from '@/data/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizonal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Mock current user ID. In a real app, this would come from an auth context.
const currentUserId = 'STF-001'; // 'STF-001' is Admin, 'STF-005' is Collector

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const currentUser = initialStaff.find(s => s.id === currentUserId);

    useEffect(() => {
        // Auto-scroll to bottom on new messages
        if(scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !currentUser) return;

        const message: Message = {
            id: `MSG-NEW-${Date.now()}`,
            senderId: currentUser.id,
            senderName: currentUser.name,
            text: newMessage.trim(),
            timestamp: new Date().toISOString(),
        };

        setMessages([...messages, message]);
        setNewMessage('');
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('');
    };

    return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.32))]">
            <h1 className="text-3xl font-bold mb-6">ห้องแชทกลาง</h1>

            <Card className="flex-1 flex flex-col">
                <CardHeader>
                    <CardTitle>ศูนย์ประสานงาน</CardTitle>
                    <CardDescription>แชทระหว่างเจ้าหน้าที่ส่วนกลางและพนักงานเก็บขยะ</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col min-h-0">
                    <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollAreaRef as any}>
                        <div className="space-y-4">
                            {messages.map((msg) => {
                                const isSent = msg.senderId === currentUserId;
                                return (
                                    <div key={msg.id} className={cn('flex items-end gap-2', isSent && 'justify-end')}>
                                        {!isSent && (
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>{getInitials(msg.senderName)}</AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className={cn(
                                            'max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg',
                                            isSent ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                        )}>
                                            {!isSent && <p className="text-xs font-semibold mb-1">{msg.senderName}</p>}
                                            <p>{msg.text}</p>
                                            <p className={cn(
                                                'text-xs mt-2',
                                                isSent ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                            )}>
                                                {new Date(msg.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                         {isSent && (
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>{currentUser ? getInitials(currentUser.name) : 'ME'}</AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>

                    <form onSubmit={handleSendMessage} className="mt-4 flex gap-2 pt-4 border-t">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="พิมพ์ข้อความ..."
                            autoComplete="off"
                        />
                        <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                            <SendHorizonal className="h-4 w-4" />
                            <span className="sr-only">ส่ง</span>
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
