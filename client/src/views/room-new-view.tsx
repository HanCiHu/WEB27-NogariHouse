/* eslint-disable object-shorthand */
import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useSetRecoilState, useRecoilValue } from 'recoil';

import roomDocumentIdState from '@atoms/room-document-id';
import userTypeState from '@atoms/user';
import roomViewState from '@atoms/room-view-type';
import { isOpenRoomModalState } from '@atoms/is-open-modal';
import DefaultButton from '@common/default-button';
import RoomTypeCheckBox from '@components/room/room-type-check-box';
import AnonymousCheckBox from '@components/room/anonymous-checkbox';
import { postRoomInfo } from '@api/index';
import { ButtonLayout } from '../components/room/style';

const CustomTitleForm = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const TitleInputbar = styled.input`
  background: none;
  color: #58964F;
  font-size: 18px;
  padding: 10px 10px 10px 5px;
  display: block;
  border: none;
  border-radius: 0;
  border-bottom: 1px solid #58964F;
  &:focus {
    outline: none;
  }
`;

const CheckboxLayout = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  width: 100%;
`;

const TitleInputbarLabel = styled.label`
  font-size: 12px;
  color: #B6B6B6;
`;

// 룸 생성 모달
function RoomModal() {
  const user = useRecoilValue(userTypeState);
  const setRoomView = useSetRecoilState(roomViewState);
  const setRoomDocumentId = useSetRecoilState(roomDocumentIdState);
  const setIsOpenModal = useSetRecoilState(isOpenRoomModalState);
  const [roomType, setRoomType] = useState('public');
  const [isDisabled, setIsDisabled] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submitButtonHandler = () => {
    const roomInfo = {
      type: roomType,
      title: inputRef.current?.value as string,
      userId: user.userId,
      userName: user.userName,
      isAnonymous: (roomType !== 'closed') ? isAnonymous : false,
    };
    postRoomInfo(roomInfo)
      .then((roomDocumentId: any) => {
        setRoomDocumentId(roomDocumentId);
        if (roomType === 'closed') setIsOpenModal(true);
        else if (isAnonymous) setRoomView('selectModeView');
        else setRoomView('inRoomView');
      })
      .catch((err) => console.error(err));
  };

  const inputOnChange = () => {
    setIsDisabled(!inputRef.current?.value);
  };

  const checkboxOnChange = () => {
    setIsAnonymous(!isAnonymous);
  };

  const roomTypeOnClick = (checkBoxName: string) => {
    setRoomType(checkBoxName);
  };

  return (
    <>
      <h2> Let&apos;s have fun together! </h2>
      <CheckboxLayout>
        {/* eslint-disable-next-line react/jsx-no-bind */}
        <RoomTypeCheckBox checkBoxName="public" onClick={roomTypeOnClick.bind(null, 'public')} roomType={roomType} />
        {/* eslint-disable-next-line react/jsx-no-bind */}
        <RoomTypeCheckBox checkBoxName="closed" onClick={roomTypeOnClick.bind(null, 'closed')} roomType={roomType} />
      </CheckboxLayout>
      <AnonymousCheckBox checked={isAnonymous} onChange={checkboxOnChange} roomType={roomType} />
      <CustomTitleForm>
        <TitleInputbarLabel>Add a Room Title</TitleInputbarLabel>
        <TitleInputbar ref={inputRef} onChange={inputOnChange} />
      </CustomTitleForm>
      <ButtonLayout>
        <DefaultButton buttonType="secondary" size="medium" onClick={submitButtonHandler} isDisabled={isDisabled}>
          Let&apos;s Go
        </DefaultButton>
        <DefaultButton buttonType="thirdly" size="medium" onClick={() => alert('random!!!')}>
          Randomly assigned
        </DefaultButton>
      </ButtonLayout>
    </>
  );
}

export default RoomModal;
