import React, {
  useEffect, useState, RefObject,
} from 'react';
import { useSetRecoilState, useResetRecoilState } from 'recoil';
import {
  FiMoreHorizontal, FiScissors, FiPlus, FiMic, FiMicOff,
} from 'react-icons/fi';

import roomDocumentIdState from '@atoms/room-document-id';
import roomViewState from '@atoms/room-view-type';
import isOpenRoomState from '@atoms/is-open-room';
import DefaultButton from '@common/default-button';
import { IParticipant, InRoomUserBox, InRoomOtherUserBox } from '@components/room/in-room-user-box';
import { getRoomInfo } from '@api/index';
import { useRtc, IRTC } from '@hooks/useRtc';
import {
  InRoomHeader, TitleDiv, OptionBtn, InRoomFooter, InRoomUserList, FooterBtnDiv,
} from './style';

export interface IRooms extends Document{
  title: string,
  type: string,
  isAnonymous: boolean,
  participants: Array<IParticipant>,
}

// 룸 생성 모달
function InRoomModal() {
  const setRoomView = useSetRecoilState(roomViewState);
  const resetRoomDocumentId = useResetRecoilState(roomDocumentIdState);
  const setIsOpenRoom = useSetRecoilState(isOpenRoomState);
  const [roomInfo, setRoomInfo] = useState<IRooms>();
  const [isMic, setMic] = useState(false);
  const [
    participants, setParticipants, myVideoRef, roomDocumentId, user, socket, myStreamRef,
  ] = useRtc();

  useEffect(() => {
    getRoomInfo(roomDocumentId)
      .then((res: any) => {
        if (!res) {
          setRoomView('notFoundRoomView');
        }
        setRoomInfo(res);
      });

    return () => {
      resetRoomDocumentId();
      setIsOpenRoom(false);
    };
  }, []);

  useEffect(() => {
    let isMount = true;

    socket?.on('room:mic', ({ userData }: any) => {
      if (isMount) {
        const newParticipants = participants.reduce((acc: Array<IRTC>, cur: IRTC) => {
          if (userData.userDocumentId === cur.userDocumentId) {
            acc.push({
              userDocumentId: userData.userDocumentId as string,
              mic: userData.isMicOn as boolean,
              stream: cur.stream as MediaStream,
              socketId: cur.socketId,
              isAnonymous: cur.isAnonymous,
            });
          } else acc.push(cur);
          return acc;
        }, []);

        setParticipants(newParticipants);
      }
    });

    return () => {
      isMount = false;
    };
  }, [socket, participants]);

  const micToggle = (isMicOn : boolean) => {
    socket?.emit('room:mic', { roomDocumentId, userDocumentId: user.userDocumentId, isMicOn });
    setMic(isMicOn);
    myStreamRef.current!
      .getAudioTracks()
      // eslint-disable-next-line
      .forEach((track: MediaStreamTrack) => (track.enabled = !track.enabled));
  };

  return (
    <>
      <InRoomHeader>
        <TitleDiv><span>{roomInfo?.title}</span></TitleDiv>
        <OptionBtn><FiMoreHorizontal /></OptionBtn>
      </InRoomHeader>
      <InRoomUserList>
        {/* eslint-disable-next-line max-len */}
        <InRoomUserBox ref={myVideoRef as RefObject<HTMLVideoElement>} key={user.userDocumentId} stream={myStreamRef.current as MediaStream} userDocumentId={user.userDocumentId} isMicOn={isMic} isAnonymous />
        {participants.map(({
          userDocumentId, stream, mic, isAnonymous,
        // eslint-disable-next-line max-len
        }: any) => <InRoomOtherUserBox key={userDocumentId} stream={stream} userDocumentId={userDocumentId} isMicOn={mic} isAnonymous={isAnonymous} />)}

      </InRoomUserList>
      <InRoomFooter>
        <DefaultButton buttonType="active" size="small" onClick={() => setRoomView('createRoomView')}> Leave a Quietly </DefaultButton>
        <FooterBtnDiv><FiScissors /></FooterBtnDiv>
        <FooterBtnDiv><FiPlus /></FooterBtnDiv>
        <FooterBtnDiv>
          {isMic
            ? <FiMic onClick={() => micToggle(false)} />
            : <FiMicOff onClick={() => micToggle(true)} />}
        </FooterBtnDiv>
      </InRoomFooter>
    </>
  );
}

export default InRoomModal;
