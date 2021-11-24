import React from 'react';
import { IconType } from 'react-icons';
import { MdOutlineArrowBackIos } from 'react-icons/md';

import { CustomtHeader, HeaderTitleNunito } from '@common/header';
import { makeIconToLink } from '@utils/index';

interface IconAndLink {
  Component:IconType,
  key: string | number,
  link: string,
  size?: number,
  color?: string,
}

function InviteHeader() {
  const Icon: IconAndLink = { Component: MdOutlineArrowBackIos, link: '/', key: 'main' };

  return (
    <CustomtHeader>
      {makeIconToLink(Icon)}
      <HeaderTitleNunito to="/invite">INVITE</HeaderTitleNunito>
      <div />
    </CustomtHeader>
  );
}

export default InviteHeader;
