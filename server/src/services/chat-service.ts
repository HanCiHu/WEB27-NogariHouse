/* eslint-disable no-return-assign */
/* eslint-disable no-return-await */
/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
import Users from '@models/users';
import Chats from '@models/chats';

let instance: any = null;

class ChatService {
  constructor() {
    if (instance) return instance;
    instance = this;
  }

  async getChatRooms(userDocumentId : string) {
    const chatRoomList = await Users.findOne({ _id: userDocumentId }, ['chatRooms']);

    const chatRoomInfoArray = await Promise.all((chatRoomList!.chatRooms).map(async (chatDocumentId: string) => {
      const chatRoomInfo = await Chats.findOne({ _id: chatDocumentId }, ['participants', 'lastMsg', 'recentActive', 'unReadMsg']);
      const UserInfo : any = [];
      await Promise.all((chatRoomInfo)!.participants.map(async (_id) => {
        if (_id === userDocumentId) return;
        const info = await Users.findOne({ _id }, ['userName', 'profileUrl']);
        UserInfo.push({ userDocumentId: info!._id, userName: info!.userName, profileUrl: info!.profileUrl });
      }));
      const myUnReadMsg = chatRoomInfo!.unReadMsg.filter((user) => user.userDocumentId === userDocumentId);

      return ({
        chatDocumentId,
        participants: UserInfo,
        lastMsg: chatRoomInfo?.lastMsg,
        recentActive: chatRoomInfo?.recentActive,
        unCheckedMsg: myUnReadMsg[0].count,
      });
    }));

    return chatRoomInfoArray.sort((a: any, b: any) => {
      if (a.recentActive < b.recentActive) return 1;
      if (a.recentActive > b.recentActive) return -1;
      return 0;
    });
  }

  async makeChatRoom(participants: Array<string>) {
    const chatRoom = await Chats.findOne({ participants }, ['participants']);
    if (chatRoom) return chatRoom._id;

    const unReadMsg = participants.map((userDocumentId: string) => ({ userDocumentId, count: 0 }));
    const newChatRoom = new Chats({ participants, unReadMsg });
    await newChatRoom.save();

    participants.forEach(async (userDocumentId) => await Users.findOneAndUpdate({ _id: userDocumentId }, { $push: { chatRooms: newChatRoom._id } }));

    return newChatRoom._id;
  }

  async getChattingLog(chatDocumentId: string) {
    const chattingLog = await Chats.findOne({ _id: chatDocumentId }, ['chattingLog']);
    return chattingLog;
  }

  async addChattingLog(chattingLog: any, chatDocumentId: string, userDocumentId: string) {
    const chat = await Chats.findOneAndUpdate({ _id: chatDocumentId }, {
      $push: { chattingLog },
      $set: { recentActive: chattingLog.date, lastMsg: chattingLog.message },
    });
    chat?.participants.forEach(async (id) => {
      if (id === userDocumentId) return;
      await Chats.findOneAndUpdate({ _id: chatDocumentId, 'unReadMsg.userDocumentId': id }, { $inc: { 'unReadMsg.$.count': 1 } });
    });
  }

  async setUnCheckedMsg(chatDocumentId: string, userDocumentId: string) {
    await Chats.findOneAndUpdate({ _id: chatDocumentId, 'unReadMsg.userDocumentId': userDocumentId },
      { $set: { 'unReadMsg.$.count': 0 } });
  }
}

export = new ChatService();
