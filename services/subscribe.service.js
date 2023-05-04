const { Types } = require('mongoose');

const userModel = require("../models/user");
const { transferForSubscribe } = require('./wallet.service');

// import { RequestWithUser } from '@/interfaces/auth.interface';


class SubscribeService {
  

   async subscribeToPerson(data,userId) {
    const { subscribingToId } = data;
    
   
    const transferData = {
      amount: 20,
      description: 'Monthly subscription payment',
      receiversId: subscribingToId,
    }
    const status = await transferForSubscribe(transferData,userId);
    
    return status;
  }
   async resetSubscriptions(userId, id) {
    const subscribedToUser = await this.user.findOne({ _id: id });
    const ifSubscribed = subscribedToUser.subscribeTime.find(data => Types.ObjectId(data.id).equals(userId));
    if (ifSubscribed) {
      if (new Date() >= new Date(ifSubscribed.expiresIn)) {
        const updatedUser = await this.user.findOneAndUpdate(
          { _id: subscribedToUser._id },
          {
            $set: {
              subscribers: subscribedToUser.subscribers.filter(eachId => !Types.ObjectId(eachId).equals(userId)),
              subscribeTime: subscribedToUser.subscribeTime.filter(eachId => !Types.ObjectId(eachId.id).equals(userId)),
              subscribersCount: subscribedToUser.subscribersCount - 1,
            },
          },
          { new: true },
        );
        return updatedUser;
      }
    }
  }
}

// Property.update({}, {'$set': {'numberOfViewsPerWeek' : 0}}, {multi: true}

module.exports = new SubscribeService();
