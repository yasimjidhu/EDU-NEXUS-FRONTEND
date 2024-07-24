import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, Paperclip, Smile } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../components/redux/store/store';
import { getEnrolledStudentInstructors } from '../../components/redux/slices/courseSlice';
import { fetchAllInstructors } from '../../components/redux/slices/instructorSlice';
import { useFilterEnrolledInstructors } from '../../utils/filterInstructors';
import { User } from '../../components/redux/slices/studentSlice';
import useWebSocket from '../../hooks/useWebSocket';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'instructor';
  timestamp: Date;
}

interface ChatUIProps {
  currentUser?: { id: string; name: string; avatar: string };
  onSendMessage?: (instructorId: string, message: string) => void;
  onStartCall?: (instructorId: string, type: 'audio' | 'video') => void;
}

const ChatUI: React.FC<ChatUIProps> = ({ currentUser, onSendMessage, onStartCall }) => {
  const [allInstructors, setAllInstructors] = useState<User[]>([]);
  const [enrolledInstructorRefs, setEnrolledInstructorRefs] = useState<string[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<User | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user } = useSelector((state: RootState) => state.user);
  const dispatch: AppDispatch = useDispatch();

  const enrolledInstructors = useFilterEnrolledInstructors(allInstructors, enrolledInstructorRefs);

  const {messages,sendMessage,isConnected} = useWebSocket('ws://your-websocket-url')
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user?._id) {
      dispatch(getEnrolledStudentInstructors(user._id)).then((res) => {
        setEnrolledInstructorRefs(res.payload.instructorRefs);
      });
    }
    dispatch(fetchAllInstructors()).then((res: any) => {
      console.log('fetched All instructors', res.payload.instructors);
      setAllInstructors(res.payload.instructors);
    });
  }, [dispatch, user?._id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() && selectedInstructor) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputMessage,
        sender: 'user',
        timestamp: new Date(),
      };
      sendMessage(newMessage)
      onSendMessage?.(selectedInstructor._id, inputMessage);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Instructor List */}
      <div className="w-1/4 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Chats</h2>
        </div>
        <div className="overflow-y-auto h-full">
          {enrolledInstructors && enrolledInstructors.length > 0 ? (
            enrolledInstructors.map((instructor) => (
              <div
                key={instructor._id}
                className={`flex items-center p-3 border-b border-gray-200 cursor-pointer transition-colors duration-200 ease-in-out
                  ${selectedInstructor?._id === instructor._id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                onClick={() => setSelectedInstructor(instructor)}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300 flex-shrink-0">
                  <img
                    src={instructor.profile?.avatar || '/default-avatar.png'}
                    alt={`${instructor.firstName} ${instructor.lastName}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-3 flex-grow">
                  <p className="font-semibold text-gray-800">{`${instructor.firstName} ${instructor.lastName}`}</p>
                  <p className="text-sm text-gray-500">
                    {instructor.status === 'online' ? (
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                        Online
                      </span>
                    ) : (
                      'Offline'
                    )}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">No instructors found</div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedInstructor ? (
          <>
            <div className="flex justify-between items-center border-b border-gray-200 p-4 bg-white">
              <div className="flex items-center">
                <img
                  src={selectedInstructor.profile?.avatar || '/default-avatar.png'}
                  alt={`${selectedInstructor.firstName} ${selectedInstructor.lastName}`}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <h2 className="text-lg font-semibold">{`${selectedInstructor.firstName} ${selectedInstructor.lastName}`}</h2>
                  <p className="text-sm text-gray-500">{selectedInstructor.status || 'Offline'}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onStartCall?.(selectedInstructor._id, 'audio')}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <Phone size={20} />
                </button>
                <button
                  onClick={() => onStartCall?.(selectedInstructor._id, 'video')}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <Video size={20} />
                </button>
              </div>
            </div>
            <div className="flex-grow overflow-y-auto p-4 bg-gray-100">
              {/* Messages should be rendered here */}
              <div ref={messagesEndRef} />
            </div>
            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="flex items-center">
                <button className="p-2 rounded-full hover:bg-gray-100 mr-2">
                  <Smile size={20} />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 mr-2">
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-grow p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="ml-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center bg-gray-50">
            <p className="text-xl text-gray-500">Select an instructor to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatUI;