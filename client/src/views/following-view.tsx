/* eslint-disable no-underscore-dangle */
import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import LoadingSpinner from '@common/loading-spinner';
import useFetchItems from '@src/hooks/useFetchItems';
import followingListState from '@atoms/following-list';
import UserCard from '@common/user-card';
import userState from '@atoms/user';

function FollowingView({ match }:any) {
  const userId = match.params.id;
  const [nowItemList, nowItemType] = useFetchItems<any>(`/user/followings/${userId}`, 'followings');
  const [loading, setLoading] = useState(true);
  const myFollowingList = useRecoilValue(followingListState);
  const user = useRecoilValue(userState);

  const makeUserObjectIncludedIsFollow = (
    userItem: {
      _id: string,
      userName:
      string,
      description: string,
      profileUrl: string
    },
  ) => ({
    _id: userItem._id,
    userName: userItem.userName,
    description: userItem.description,
    profileUrl: userItem.profileUrl,
    isFollow: !!myFollowingList.includes(userItem._id),
  });

  const makeItemToCardForm = (item: any) => {
    const newUserItemForm = makeUserObjectIncludedIsFollow(item);
    if (newUserItemForm._id === user.userDocumentId) {
      return (
        <UserCard
      // eslint-disable-next-line no-underscore-dangle
          key={newUserItemForm._id}
          cardType="others"
          userData={newUserItemForm}
        />
      );
    }

    return (
      <UserCard
          // eslint-disable-next-line no-underscore-dangle
        key={newUserItemForm._id}
        cardType="follow"
        userData={newUserItemForm}
      />
    );
  };

  useEffect(() => {
    if (nowItemList && nowItemType === 'followings') {
      console.log(nowItemList);
      setLoading(false);
    }
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {nowItemList.map(makeItemToCardForm)}
    </>
  );
}

export default FollowingView;
