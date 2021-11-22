/* eslint-disable react/no-array-index-key */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable max-len */
/* eslint-disable prefer-template */
import React, {
  useEffect, useState, useRef,
} from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import { getChattingLog, setUnCheckedMsg0 } from '@api/index';
import { ChatRoomsLayout, ChattingLog } from '@components/chat/style';
import ChatRoomHeader from '@components/chat/chat-room-header';
import ChatRoomFooter from '@components/chat/chat-room-footer';
import userType from '@atoms/user';
import { makeDateToHourMinute } from '@utils/index';

type urlParams = { chatDocumentId: string };

const Chat = styled.div< { isMyMsg: boolean } >`
  display: flex;
  width: auto;
  max-width: 99%;

  margin: 10px;
  ${({ isMyMsg }: any) => {
    if (isMyMsg) return 'flex-direction: row-reverse';
    return '';
  }};
`;

const Message = styled.div< { isMyMsg: boolean } >`
  white-space: pre-line;

  width: auto;
  max-width: 60%;
  word-break: break-all;

  border-radius: 20px;

  background-color: ${({ isMyMsg }: any) => {
    if (isMyMsg) return '#F1F0E4';
    return '#C4CDC0';
  }};

  p {
    margin: 10px;
  }
`;

const UserProfile = styled.img`
  width: 36px;
  height: 36px;
  margin: 10px;

  border-radius: 15px;
`;

const DateDiv = styled.div`
  color: #CED3C2;
  font-size: 15px;

  display: flex;
  align-items: end;
  margin: 5px;
`;

interface IChattingLog {
  message: string,
  profileUrl: string,
  userName: string,
  userDocumentId: string,
  date: string,
}

function ChatRoomDetailView() {
  const { chatDocumentId } = useParams<urlParams>();
  const location = useLocation<any>();
  const [chattingLog, setChattingLog] = useState<any>([]);
  const user = useRecoilValue(userType);
  const chattingLogDiv = useRef(null);

  const addChattingLog = (message: string) => {
    setChattingLog([...chattingLog, message]);
  };

  useEffect(() => {
    getChattingLog(chatDocumentId)
      .then((res: any) => {
        setUnCheckedMsg0(chatDocumentId, user.userDocumentId);
        setChattingLog(res.chattingLog.map((chat: any) => {
          if (chat.userDocumentId === user.userDocumentId) {
            return ({
              message: chat.message,
              userDocumentId: chat.userDocumentId,
              profileUrl: user.profileUrl,
              userName: user.userName,
              date: makeDateToHourMinute(new Date(chat.date)),
            });
          }
          const userData = location.state.participantsInfo.filter((userInfo: any) => userInfo.userDocumentId === chat.userDocumentId);
          return ({
            message: chat.message,
            userDocumentId: chat.userDocumentId,
            profileUrl: userData[0].profileUrl,
            userName: userData[0].userName,
            date: makeDateToHourMinute(new Date(chat.date)),
          });
        }));
        (chattingLogDiv as any).current.scrollTop = (chattingLogDiv as any).current.scrollHeight - (chattingLogDiv as any).current.clientHeight;
      });
    return () => {
      setUnCheckedMsg0(chatDocumentId, user.userDocumentId).then(() => {

      });
    };
  }, [chatDocumentId]);

  useEffect(() => {
    (chattingLogDiv as any).current.scrollTop = (chattingLogDiv as any).current.scrollHeight - (chattingLogDiv as any).current.clientHeight;
  }, [chattingLog]);

  return (
    <ChatRoomsLayout>
      <ChatRoomHeader participantsInfo={location.state.participantsInfo} />
      <ChattingLog ref={chattingLogDiv}>
        {chattingLog.map(({
          message, profileUrl, userName, userDocumentId, date,
        } : IChattingLog, index: number) => (
          <Chat key={index} isMyMsg={userDocumentId === user.userDocumentId}>
            <UserProfile src={profileUrl} />
            <Message isMyMsg={userDocumentId === user.userDocumentId}>
              {userDocumentId === user.userDocumentId
                ? <p style={{ color: '#598272', marginBottom: '0px' }}>Me</p>
                : <p style={{ color: '#4A6970', marginBottom: '0px' }}>{userName}</p>}
              <p>{`${message}`}</p>
            </Message>
            <DateDiv><span>{date}</span></DateDiv>
          </Chat>
        ))}
      </ChattingLog>
      <ChatRoomFooter addChattingLog={addChattingLog} chatDocumentId={chatDocumentId} />
    </ChatRoomsLayout>
  );
}

export default ChatRoomDetailView;
