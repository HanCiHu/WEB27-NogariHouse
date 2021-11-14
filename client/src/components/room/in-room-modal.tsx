/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable object-shorthand */
import React, {
  useEffect, useState, useRef, useReducer, useCallback,
} from 'react';
import { useRecoilState, useSetRecoilState, useRecoilValue } from 'recoil';
import {
  FiMoreHorizontal, FiScissors, FiPlus, FiMic, FiMicOff,
} from 'react-icons/fi';

import userTypeState from '@atoms/user';
import roomDocumentIdState from '@atoms/room-document-id';
import roomViewType from '@src/recoil/atoms/room-view-type';
import DefaultButton from '@common/default-button';
import { IParticipant, InRoomUserBox, InRoomOtherUserBox } from '@components/room/in-room-user-box';
import { getRoomInfo } from '@api/index';
import { reducer, initialState } from '@components/room/in-room-reducer';
import useSocket from '@src/hooks/useSocket';
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
  const setRoomView = useSetRecoilState(roomViewType);
  const [user] = useRecoilState(userTypeState);
  const roomDocumentId = useRecoilValue(roomDocumentIdState);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [roomInfo, setRoomInfo] = useState<IRooms>();
  const socket = useSocket();
  const [isMic, setMic] = useState(false);
  const myPeerConnection = useRef<RTCPeerConnection>();
  const myStream = useRef<any>();
  const myBox = useRef<HTMLVideoElement>(null);

  const handleIce = (data: any) => {
    dispatch({ type: 'SENT_CANDIDATE', payload: { data: data.candidate, socket } });
  };

  // 다른 유저 접속시 연결하기 dispatch로 비디오 태그 추가
  const handleAddStream = (data: any) => {
    dispatch({ type: 'ADD_STREAM', payload: { data } });
  };

  const makeConnection = () => {
    myPeerConnection.current = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            'stun:stun.l.google.com:19302',
            'stun:stun1.l.google.com:19302',
            'stun:stun2.l.google.com:19302',
            'stun:stun3.l.google.com:19302',
            'stun:stun4.l.google.com:19302',
          ],
        },
      ],
    });
    myPeerConnection.current.addEventListener('icecandidate', handleIce);
    myPeerConnection.current.addEventListener('track', handleAddStream);

    myStream.current.getTracks()
      .forEach((track: any) => {
        myPeerConnection.current!.addTrack(track, myStream.current);
      });
  };

  const getMedia = async () => {
    try {
      myStream.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      myBox.current!.srcObject = myStream.current;
    } catch (e) {
      console.error(e);
    }
  };

  const initConnection = async () => {
    try {
      await getMedia();
      await makeConnection();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    initConnection();

    return () => {
      if (myPeerConnection.current) {
        myPeerConnection.current.close();
        myPeerConnection.current.removeEventListener('icecandidate', handleIce);
        myPeerConnection.current.removeEventListener('track', handleAddStream);
      }
    };
  }, []);

  // roomId 기반으로 room 정보 불러오기
  useEffect(() => {
    getRoomInfo(roomDocumentId)
      .then((res: any) => {
        setRoomInfo(res);
        dispatch({ type: 'SET_USERS', payload: { participants: res.participants } });
      });
  }, []);

  // socket 이벤트
  useEffect(() => {
    if (!socket) return;

    socket.emit('room:join', {
      roomDocumentId: roomDocumentId, userDocumentId: user.userDocumentId,
    });

    socket.on('room:join', async (payload: any) => {
      const { userData } = payload;
      dispatch({
        type: 'JOIN_USER',
        payload: { userData },
      });

      const offer = await myPeerConnection.current!.createOffer();
      myPeerConnection.current!.setLocalDescription(offer);

      socket!.emit('room:offer', offer);
    });

    socket.on('room:leave', async (payload: any) => {
      const { userDocumentId } = payload;
      dispatch({
        type: 'LEAVE_USER',
        payload: { userDocumentId },
      });
    });

    socket.on('room:offer', async (offer: RTCSessionDescriptionInit) => {
      myPeerConnection.current!.setRemoteDescription(offer);
      const answer = await myPeerConnection.current!.createAnswer();
      myPeerConnection.current!.setLocalDescription(answer);
      socket!.emit('room:answer', answer);
    });

    socket.on('room:answer', async (answer: RTCSessionDescriptionInit) => {
      myPeerConnection.current!.setRemoteDescription(answer);
    });

    socket.on('room:ice', async (ice: RTCIceCandidateInit) => {
      myPeerConnection.current!.addIceCandidate(ice);
    });
  }, [socket]);

  const leaveEvent = () => {
    setRoomView('createRoomView');
  };

  return (
    <>
      <InRoomHeader>
        <TitleDiv><span>{roomInfo?.title}</span></TitleDiv>
        <OptionBtn><FiMoreHorizontal /></OptionBtn>
      </InRoomHeader>
      <InRoomUserList>
        {state.participants.map(({ userDocumentId, stream }: any) => <InRoomOtherUserBox key={userDocumentId} stream={stream} userDocumentId={userDocumentId} isMicOn={false} />)}
        <InRoomUserBox ref={myBox} key={user.userDocumentId} userDocumentId={user.userDocumentId} isMicOn={isMic} />
      </InRoomUserList>
      <InRoomFooter>
        <DefaultButton buttonType="active" size="small" onClick={leaveEvent}> Leave a Quietly </DefaultButton>
        <FooterBtnDiv><FiScissors /></FooterBtnDiv>
        <FooterBtnDiv><FiPlus /></FooterBtnDiv>
        <FooterBtnDiv>{isMic ? <FiMic onClick={() => setMic(false)} /> : <FiMicOff onClick={() => setMic(true)} />}</FooterBtnDiv>
      </InRoomFooter>
    </>
  );
}

export default InRoomModal;
