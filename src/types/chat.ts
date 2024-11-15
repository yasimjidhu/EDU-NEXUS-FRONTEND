export interface Message {
    id?: string;
    conversationId: string;
    recipientEmail?:string;
    senderId: string;
    senderName?: string;
    senderProfile?: string;
    text?: string;
    fileUrl?: string;
    fileType?: 'audio' | 'image' | 'video' | string;
    status: string;
    createdAt?: Date;
    updatedAt?: Date;
    _id?: string;
    isGroup?: boolean;
    groupId?:string;
    replyTo?: {
        messageId?: string;  // ID of the message being replied to
        text?: string;      // Text of the original message (optional if it's a file)
        senderId?: string;   // ID of the sender of the original message
    };
}

export interface TStudent {
    contact: {
        address: string;
        phone: string;
        social: string;
    };
    createdAt: string;
    email: string;
    firstName: string;
    isBlocked: boolean;
    isGAuth: boolean;
    isRejected: boolean;
    isVerified: boolean;
    lastName: string;
    profile: {
        avatar: string;
        dateOfBirth: string;
        gender: string;
    };
    profit: number;
    qualification: string;
    role: string;
    updatedAt: string;
    __v: number;
    _id: string;
}

export interface Group {
    _id?: string;
    name: string;
    image: string;
    description: string;
    members: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

interface LatestMessage {
    _id: string;
    senderId: string;
    senderName: string;
    senderProfile:string;
    text: string | null;
    fileUrl: string | null;
    fileType: string | null;
    createdAt: string;
}

export interface UnreadMessage {
    conversationId: string;
    unreadCount: number;
    latestMessage: LatestMessage;
    _id?:string;
}

