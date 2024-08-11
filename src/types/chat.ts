export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    text?: string;
    fileUrl?: string;
    fileType?: 'audio' | 'image' | 'video';
    status: string;
    createdAt: Date;
    _id?: string;
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