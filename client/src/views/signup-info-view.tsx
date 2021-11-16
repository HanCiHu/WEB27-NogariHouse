/* eslint-disable max-len */
import React, {
  MouseEvent, useCallback, useRef, useState,
} from 'react';
import styled from 'styled-components';
import { useHistory, useLocation } from 'react-router-dom';

import SignHeader from '@components/sign/sign-header';
import SignTitle from '@components/sign/sign-title';
import SignBody from '@components/sign/sign-body';
import DefaultButton from '@common/default-button';
import { CustomInputBox, CustomInputBar } from '@common/custom-inputbar';
import InterestItem from '@common/interest-item';
import { postSignUpUserInfo } from '@src/api';

const InterestItemWarapper = styled.div`
  width: 50%;
  display: flex;
  flex-wrap: wrap;
  div {
    margin-right: 5%;
    margin-bottom: 5%;
  }
  margin-top: 5%;
  margin-right: -5%;
`;

const Padding = styled.div`
  padding: 20px;
`;

function SignupInfoView() {
  const inputPasswordRef = useRef<HTMLInputElement>(null);
  const inputPasswordCheckRef = useRef<HTMLInputElement>(null);
  const inputFullNameRef = useRef<HTMLInputElement>(null);
  const inputIdRef = useRef<HTMLInputElement>(null);
  const [isDisabled, setIsDisabled] = useState(true);
  const history = useHistory();
  const location = useLocation();

  const selectedItems = new Set();

  const inputOnChange = useCallback(() => {
    if (inputPasswordRef.current?.value && inputPasswordCheckRef.current?.value && inputFullNameRef.current?.value && inputIdRef.current?.value) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, []);

  const onClickInterestItem = (e: MouseEvent) => {
    const interestName = e.currentTarget?.textContent?.slice(2);
    if (typeof interestName === 'string') selectedItems.add(interestName);
  };

  const checkPassword = () => inputPasswordRef.current?.value === inputPasswordCheckRef.current?.value;

  const onClickNextButton = () => {
    if (checkPassword()) {
      const userInfo = {
        loginType: 'normal',
        userId: inputIdRef.current?.value as string,
        password: inputPasswordRef.current?.value as string,
        userName: inputFullNameRef.current?.value as string,
        userEmail: (location.state as {email: string}).email,
        interesting: Array.from(selectedItems),
      };

      postSignUpUserInfo(userInfo)
        .then(() => { history.replace('/'); });
    } else {
      alert('비밀번호를 확인해주세요');
    }
  };

  return (
    <>
      <SignHeader />
      <SignBody>
        <CustomInputBox>
          <SignTitle title="what’s your password?" />
          <CustomInputBar key="password" ref={inputPasswordRef} onChange={inputOnChange} type="password" placeholder="Password" />
          <CustomInputBar key="password" ref={inputPasswordCheckRef} onChange={inputOnChange} type="password" placeholder="Password Check" />
          <SignTitle title="what’s your full name?" />
          <CustomInputBar key="fullName" ref={inputFullNameRef} onChange={inputOnChange} type="text" placeholder="Full name" />
          <SignTitle title="what’s your id?" />
          <CustomInputBar key="id" ref={inputIdRef} onChange={inputOnChange} type="text" placeholder="Nick name" />
          <SignTitle title="what’s your interests?" />
          <InterestItemWarapper>
            <InterestItem onClick={onClickInterestItem} text="🐟노가리" />
            <InterestItem onClick={onClickInterestItem} text="🐟노가리" />
            <InterestItem onClick={onClickInterestItem} text="🐟노가리" />
            <InterestItem onClick={onClickInterestItem} text="🐟노가리" />
            <InterestItem onClick={onClickInterestItem} text="🐟노가리" />
            <InterestItem onClick={onClickInterestItem} text="🐟노가리" />
            <InterestItem onClick={onClickInterestItem} text="🐟노가리" />
            <InterestItem onClick={onClickInterestItem} text="🐟노가리" />
            <InterestItem onClick={onClickInterestItem} text="🐟노가리" />
            <InterestItem onClick={onClickInterestItem} text="🐟노가리" />
            <InterestItem onClick={onClickInterestItem} text="🐟노가리" />
            <InterestItem onClick={onClickInterestItem} text="🐟노가리" />
            <InterestItem onClick={onClickInterestItem} text="🐟노가리" />
            <InterestItem onClick={onClickInterestItem} text="🐟노가리" />
            <InterestItem onClick={onClickInterestItem} text="🐟노가리" />
          </InterestItemWarapper>
          <DefaultButton buttonType="secondary" size="medium" onClick={onClickNextButton} isDisabled={isDisabled}>NEXT</DefaultButton>
          <Padding />
        </CustomInputBox>
      </SignBody>
    </>
  );
}

export default SignupInfoView;
