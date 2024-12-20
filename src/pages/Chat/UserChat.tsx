import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { Smile } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../components/redux/store/store';
import { getEnrolledStudentInstructors } from '../../components/redux/slices/courseSlice';
import { User } from '../../components/redux/slices/studentSlice';
import {  createGroup, getMessages, getUserJoinedGroups, incrementUnreadCount, markConversationAsRead, sendMessage, updateMessageStatus } from '../../components/redux/slices/chatSlice';
import { useSocket } from '../../contexts/SocketContext';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { Group, Message } from '../../types/chat';
import { ChatSidebar } from '../../components/chat/ChatSidebar';
import { Header } from '../../components/chat/Header';
import { DisplayMessages } from '../../components/chat/DisplayMessages';
import { AudioRecord } from '../../components/chat/AudioRecorder';
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const CreateGroupModal = lazy(() => import('../../components/chat/createGroup'))
const GroupChat = lazy(() => import('./GroupChat'))
const Picker = lazy(() => import('emoji-picker-react'))

interface ChatUIProps {
  currentUser?: { id: string; name: string; avatar: string };
  onStartCall?: (instructorId: string, type: 'audio' | 'video') => void;
}

const ChatUI: React.FC<ChatUIProps> = () => {
  const [enrolledInstructors, setEnrolledInstructors] = useState<User[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<User | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState<string>('');
  const [selectedConversationId, setSelectedConversationId] = useState<string>('')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<NodeJS.Timeout | null>(null);
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [showMessages, setShowMessages] = useState<"user" | "group" | ''>('')
  const [clickedItem, setClickedItem] = useState<'instructor' | 'group' | '' | 'students'>('')
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  // const audioRef = useRef(new Audio());
  const [replay,setReplay] = useState<Message | null>(null)
  const { user } = useSelector((state: RootState) => state.user);
  const { messages} = useSelector((state: RootState) => state.chat);

  console.log(joinedGroups)
  console.log(audioProgress)
  console.log(audioDuration)
  console.log(uploadProgress)

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate()
  const { socket, onlineUsers } = useSocket();

  useDocumentTitle('Messages')

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user?._id) {
      dispatch(getEnrolledStudentInstructors(user._id)).then((res) => {
        if (getEnrolledStudentInstructors.fulfilled.match(res)) {
          setEnrolledInstructors(res.payload.instructors);
        }
      });
    }
  }, [dispatch, user?._id]);


  useEffect(() => {
    if (user?._id) {
      dispatch(getUserJoinedGroups(user._id)).then((res: any) => {
        setJoinedGroups(res.payload.groups)
      })
    }
  }, [dispatch, user?._id])

  useEffect(() => {
    if (socket) {
      // Handler for receiving new messages
      const newMessageHandler = (newMessage: Message) => {
        console.log('New message received in user-specific room:', newMessage);
        
        // If the message is not from the currently selected conversation, mark as unread
        if (newMessage.conversationId !== selectedConversationId) {
          dispatch(incrementUnreadCount(newMessage.conversationId));
        }
  
        // Optionally emit 'messageDelivered' if the sender needs confirmation
        if (newMessage.senderId !== user?._id) {
          socket.emit('messageDelivered', { messageId: newMessage._id, userId: user?._id });
        }
      };
  
      // Listen for 'newMessage' events
      socket.on('newMessage', newMessageHandler);
  
      return () => {
        socket.off('newMessage', newMessageHandler);
      };
    }
  }, [socket, dispatch, selectedConversationId, user?._id]);
  

  useEffect(() => {
    if (socket) {
      const messageHandler = (newMessage: Message) => {
        console.log('new message recieved in user chat',newMessage)
        // dispatch(addMessage(newMessage));
        if (newMessage.senderId !== user?._id) {
          socket.emit('messageDelivered', newMessage._id);
        }
      };

      const messageUpdateHandler = (updatedMessage: Message) => {
        dispatch(updateMessageStatus(updatedMessage));
      };

      const typingHandler = ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
        if (userId !== user?._id) {
          setIsTyping(isTyping);
        }
      };

      socket.on('message', messageHandler);
      socket.on('messageStatusUpdated', messageUpdateHandler);
      socket.on('typing', typingHandler);

      return () => {
        socket.off('message', messageHandler);
        socket.off('messageStatusUpdated', messageUpdateHandler);
        socket.off('typing', typingHandler);
      };
    }
  }, [socket, dispatch, user?._id]);

  useEffect(() => {
    return () => {
      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (showMessages.trim() !== '' && selectedConversationId.trim() !== '') {
      dispatch(markConversationAsRead({ conversationId: selectedConversationId, item: showMessages }))
    }
  }, [showMessages, selectedConversationId])

  useEffect(() => {
    if (selectedInstructor && socket) {
      const conversationid = [user?._id, selectedInstructor._id].sort().join('-');
      setConversationId(conversationid);

      socket.emit('join', conversationid);
      dispatch(getMessages(conversationid));

      return () => {
        socket.emit('leave', conversationid);
      };
    }
  }, [selectedInstructor, socket, user?._id, dispatch]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if ((inputMessage.trim() || audioBlob || selectedFile) && selectedInstructor && socket) {
      let fileUrl = '';
      let fileType = '';

      if (selectedFile) {
        try {
          fileUrl = await uploadToCloudinary(selectedFile, setUploadProgress);
          fileType = selectedFile.type.split('/')[0]; // 'image', 'audio', or 'video'
        } catch (error) {
          console.error('Error uploading file:', error);
          return; // Exit if upload fails
        }
      } else if (audioBlob) {
        try {
          fileUrl = await uploadToCloudinary(new File([audioBlob], 'audio.webm', { type: 'audio/webm' }), setUploadProgress);
          fileType = 'audio';
          console.log('audio file uploaded to cloudinary', fileUrl)
        } catch (error) {
          console.error('Error uploading audio:', error);
          return; // Exit if upload fails
        }
      }

      const messageData : Message= {
        conversationId,
        senderId: user?._id || '',
        senderName:`${user?.firstName} ${user?.lastName}`,
        replyTo: replay ? {
          messageId:replay?._id,
          senderId:replay?.senderId,
          text:replay?.text
        }:undefined,
        recipientEmail:selectedInstructor.email,
        senderProfile:user?.profile.avatar,
        text: inputMessage.trim(),
        fileUrl,
        fileType: fileType as 'audio' | 'image' | 'video' | undefined,
        status: 'sent',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      try {
        const response = await dispatch(sendMessage(messageData));
        const savedMessage = response.payload;

        socket.emit('message', savedMessage);
        setInputMessage('');
        setSelectedFile(null);
        setAudioBlob(null);
        setReplay(null)
        setUploadProgress(0);
        setAudioProgress(0);
        setAudioDuration(0);

        // Clear typing status
        if (typingTimer.current) {
          clearTimeout(typingTimer.current);
        }
        setIsTyping(false);
        socket.emit('typing', { conversationId, userId: user?._id, isTyping: false });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };
  const handleFileSelect = (file: File) => {
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (socket && selectedInstructor) {
      setInputMessage(e.target.value);

      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
      }

      typingTimer.current = setTimeout(() => {
        socket.emit('typing', { conversationId, userId: user?._id, isTyping: false });
      }, 1000);

      if (!isTyping) {
        socket.emit('typing', { conversationId, userId: user?._id, isTyping: true });
      }
    }
  };

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    setInputMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleCreateGroup = async (data: any) => {
    try {
      const response = await dispatch(createGroup(data))
      navigate('/instructor/group', { state: response.payload.group._id })
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleSelectStudent = (instructor: User) => {
    const conversationid = [user?._id, instructor._id].sort().join('-');
    setSelectedConversationId(conversationid)
    setSelectedInstructor(instructor)
    setSelectedGroup(null)
    setShowMessages("user")
  }

  const handleSelectGroup = (group: Group) => {
    setSelectedConversationId(group._id!)
    setSelectedGroup(group)
    setSelectedInstructor(null);
    setShowMessages("group");
  }

  const handleRecordedAudio = (blob: Blob) => {
    setAudioBlob(blob)
  }

  const handleClickEntity = (item: 'instructor' | 'group' | 'students') => {
    setClickedItem(item)
  }

  const handleReply = (message:Message)=>{
    setReplay(message)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/4 bg-white border-r border-gray-200">
        {/* Sidebar */}
        <ChatSidebar
          messagedStudents={enrolledInstructors}
          onlineUsers={onlineUsers}
          onSelectStudent={handleSelectStudent}
          selectedStudent={selectedInstructor}
          onSelectGroup={handleSelectGroup}
          selectedGroup={selectedGroup}
          onClickEntity={handleClickEntity}
          user={'student'}
        />
      </div>
  
      <div className="flex-1 flex flex-col relative">
        {isModalOpen && (
          <Suspense fallback={<div>Loading....</div>}>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
              <div className="relative z-10 bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <CreateGroupModal
                  show={isModalOpen}
                  students={enrolledInstructors}
                  handleClose={() => setIsModalOpen(false)}
                  onCreateGroup={(data: any) => handleCreateGroup(data)}
                />
              </div>
            </div>
          </Suspense>
        )}
  
        {showMessages === "group" && selectedGroup ? (
          <Suspense fallback={<div>Loading...</div>}>
            <GroupChat id={selectedGroup._id!} userId={user?._id!} />
          </Suspense>
        ) : showMessages === "user" && selectedInstructor ? (
          <>
            <Header
              isTyping={isTyping}
              onlineUsers={onlineUsers}
              selectedStudent={selectedInstructor}
              key={selectedInstructor._id}
            />
            <div className="flex-1 overflow-y-auto">
              <DisplayMessages
               messages={messages}
               onReply={handleReply}
                />
            </div>
            <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2 relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <Smile size={24} />
                </button>
                {showEmojiPicker && (
                  <Suspense fallback={<div className='flex justify-center items-center'>Loading...</div>}>
                    <div className="absolute bottom-20 left-2">
                      <Picker onEmojiClick={handleEmojiClick} />
                    </div>
                  </Suspense>
                )}
                <AudioRecord
                  handleInput={handleInput}
                  handleKeyPress={handleKeyPress}
                  handleSendMessage={handleSendMessage}
                  recordedAudio={handleRecordedAudio}
                  inputMessage={inputMessage}
                  onSelectFile={(file) => handleFileSelect(file)}
                  selectedFile={selectedFile}
                  key={selectedInstructor._id}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1">
            <p className="text-gray-500">
              {clickedItem === "instructor"
                ? "Select an instructor to start chatting"
                : clickedItem === "group"
                  ? "Select a group to start chatting"
                  : "Please select a chat to start messaging"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ChatUI);
