import React, { useRef, useEffect, useState } from 'react';
import { Message } from '../../types/chat';
import { isOnlyEmojis } from '../../utils/CheckIsEmojis';
import { useMessageObserver } from '../../hooks/useMessageObserver';
import { useSocket } from '../../contexts/SocketContext';
import AudioPlayer from './AudioPlayer';
import Lightbox from './LightBox';
import { getColorForSender } from '../../utils/generateUniquesColors';
import UserLeftMessage from './userLeft';


interface MessageListProps {
  messages: Message[];
  currentUserId: string | undefined;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('')
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false)
  const [userLeftMessage, setUserLeftMessage] = useState<string>('');
  const [userLeftTimestamp, setUserLeftTimestamp] = useState<number | null>(null);


  const { socket } = useSocket()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages,userLeftMessage]);

  useEffect(() => {
    if (socket) {
      socket.on('userLeft', (userName: string) => {
        console.log('user left message got in messgae list component user is', userName)
        setUserLeftMessage(`${userName} has left the chat.`);
        setUserLeftTimestamp(Date.now());
      });

      return () => {
        socket.off('userLeft');
      };
    }
  }, [socket]);

  const handleMessageRead = (messageId: string) => {
    if (socket) {
      socket.emit('messageRead', messageId);
    }
  };

  const handleImageClick = (url: string) => {
    setCurrentImageUrl(url)
    setIsLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setIsLightboxOpen(false);
    setCurrentImageUrl('')
  };

  const messageObserver = useMessageObserver(handleMessageRead)
  

  // return (
  //   <div className="flex-grow overflow-y-auto p-4 space-y-2">
  //     {messages && messages.length > 0 ? (
  //       messages.map((msg, index) => {
  //         const onlyEmojis = isOnlyEmojis(msg.text!);
  //         const isCurrentUser = msg.senderId === currentUserId;
  //         const senderColor = getColorForSender(msg.senderId)
  //         return (
  //           <div key={index} className={`flex items-end ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
  //             {!isCurrentUser && (
  //               <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mr-2">
  //                 <img
  //                   src={msg.senderProfile || '/assets/png/user.png'}
  //                   alt="User avatar"
  //                   className="w-full h-full object-cover"
  //                 />
  //               </div>
  //             )}
  //             <div
  //               data-message-id={msg._id}
  //               ref={(el) => el && messageObserver.current?.observe(el)}
  //               className={`max-w-xs p-2 m-2 rounded-2xl shadow-md transition-all duration-300 hover:shadow-lg ${isCurrentUser
  //                   ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
  //                   : 'bg-white text-gray-800'
  //                 }`}
  //             >
  //               {!isCurrentUser && (
  //                 <span className="text-xs font-semibold mb-1 block" style={{ color: senderColor }}>
  //                   {msg.senderName}
  //                 </span>
  //               )}
  //               {msg.fileUrl ? (
  //                 msg.fileType === 'audio' ? (
  //                   <AudioPlayer src={msg.fileUrl} />
  //                 ) : msg.fileType === 'image' ? (
  //                   <>
  //                     <img
  //                       src={msg.fileUrl}
  //                       alt="Uploaded image"
  //                       className="w-full rounded cursor-pointer"
  //                       onClick={() => handleImageClick(msg.fileUrl!)}
  //                     />
  //                     {isLightboxOpen && (
  //                       <Lightbox imageUrl={currentImageUrl} onClose={handleCloseLightbox} />
  //                     )}
  //                   </>
  //                 ) : msg.fileType === 'video' ? (
  //                   <video controls src={msg.fileUrl} className="w-full rounded cursor-pointer" />
  //                 ) : null
  //               ) : (
  //                 <p className={`inter ${onlyEmojis ? 'text-4xl' : 'text-sm md:text-base'}`}>
  //                   {msg.text}
  //                 </p>
  //               )}
  //               <div className='flex justify-end space-x-2'>
  //                 <p className={`text-xs ${currentUserId !== msg.senderId ? 'text-black' : 'text-gray-100'} mt-2`}>
  //                   {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
  //                 </p>
  //                 {isCurrentUser && (
  //                   <span className="ml-2">
  //                     {msg.status === 'sent' && <span className="text-xs">✓</span>}
  //                     {msg.status === 'delivered' && <span className="text-xs">✓✓</span>}
  //                     {msg.status === 'read' && (
  //                       <span className="text-blue-500 text-xs">✓✓</span>
  //                     )}
  //                   </span>
  //                 )}
  //               </div>
  //             </div>
  //             {isCurrentUser && (
  //               <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ml-2">
  //                 <img
  //                   src={msg.senderProfile || '/assets/png/user.png'}
  //                   alt="User avatar"
  //                   className="w-full h-full object-cover"
  //                 />
  //               </div>
  //             )}
  //           </div>
  //         );
  //       })
  //     ) : (
  //       <div className='flex justify-center items-center'>
  //         <p className='text-md text-black'>Send a message to start the conversation 🙌</p>
  //       </div>
  //     )}
  //     {/* User left message */}
  //     {userLeftMessage && (
  //       <UserLeftMessage message={userLeftMessage}/>
  //     )}
  //     <div ref={messagesEndRef} />
  //   </div>
  // );

  const renderMessage = (msg: Message) => {
    const onlyEmojis = isOnlyEmojis(msg.text!);
    const isCurrentUser = msg.senderId === currentUserId;
    const senderColor = getColorForSender(msg.senderId);

    return (
      <div key={msg._id} className={`flex items-end ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
        {!isCurrentUser && (
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mr-2">
            <img
              src={msg.senderProfile || '/assets/png/user.png'}
              alt="User avatar"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div
          data-message-id={msg._id}
          ref={(el) => el && messageObserver.current?.observe(el)}
          className={`max-w-xs p-2 m-2 rounded-2xl shadow-md transition-all duration-300 hover:shadow-lg ${
            isCurrentUser
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
              : 'bg-white text-gray-800'
          }`}
        >
          {!isCurrentUser && (
            <span className="text-xs font-semibold mb-1 block" style={{ color: senderColor }}>
              {msg.senderName}
            </span>
          )}
          {msg.fileUrl ? (
            msg.fileType === 'audio' ? (
              <AudioPlayer src={msg.fileUrl} />
            ) : msg.fileType === 'image' ? (
              <>
                <img
                  src={msg.fileUrl}
                  alt="Uploaded image"
                  className="w-full rounded cursor-pointer"
                  onClick={() => handleImageClick(msg.fileUrl!)}
                />
                {isLightboxOpen && (
                  <Lightbox imageUrl={currentImageUrl} onClose={handleCloseLightbox} />
                )}
              </>
            ) : msg.fileType === 'video' ? (
              <video controls src={msg.fileUrl} className="w-full rounded cursor-pointer" />
            ) : null
          ) : (
            <p className={`inter ${onlyEmojis ? 'text-4xl' : 'text-sm md:text-base'}`}>
              {msg.text}
            </p>
          )}
          <div className='flex justify-end space-x-2'>
            <p className={`text-xs ${currentUserId !== msg.senderId ? 'text-black' : 'text-gray-100'} mt-2`}>
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            {isCurrentUser && (
              <span className="ml-2">
                {msg.status === 'sent' && <span className="text-xs">✓</span>}
                {msg.status === 'delivered' && <span className="text-xs">✓✓</span>}
                {msg.status === 'read' && (
                  <span className="text-blue-500 text-xs">✓✓</span>
                )}
              </span>
            )}
          </div>
        </div>
        {isCurrentUser && (
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ml-2">
            <img
              src={msg.senderProfile || '/assets/png/user.png'}
              alt="User avatar"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    );
  };

  const renderMessages = () => {
    if (!messages || messages.length === 0) {
      return (
        <div className='flex justify-center items-center'>
          <p className='text-md text-black'>Send a message to start the conversation 🙌</p>
        </div>
      );
    }

    const messagesToRender = [];
    let userLeftMessageRendered = false;

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const messageTimestamp = new Date(msg.createdAt).getTime();

      if (userLeftTimestamp && messageTimestamp > userLeftTimestamp && !userLeftMessageRendered) {
        messagesToRender.push(
          <UserLeftMessage key="user-left" message={userLeftMessage} />
        );
        userLeftMessageRendered = true;
      }

      messagesToRender.push(renderMessage(msg));
    }

    if (userLeftTimestamp && !userLeftMessageRendered) {
      messagesToRender.push(
        <UserLeftMessage key="user-left" message={userLeftMessage} />
      );
    }

    return messagesToRender;
  };

  return (
    <div className="flex-grow overflow-y-auto p-4 space-y-2">
      {renderMessages()}
      <div ref={messagesEndRef} />
    </div>
  );

};

export default MessageList;
