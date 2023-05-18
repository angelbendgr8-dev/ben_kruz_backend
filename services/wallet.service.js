const HttpException = require("../helpers/HttpException");
const walletModel = require("../models/wallet.model");
const userModel = require("../models/user");
const transactionHistory = require("../models/transaction.model");

const notifications = require("./notifications");
const { DateTime } = require("luxon");

const createWallet = async (userId) => {
  console.log(userId);
  const wallet = await walletModel.findOne({ user: userId });
  console.log("wallet");
  if (!wallet) {
    await walletModel.create({ user: userId });
  } else {
    throw new HttpException(409, `User Wallet already exists`, {});
  }
};
const fundWallet = async (data, id) => {
  const wallet = await walletModel.findOne({ user: id });
  const userData = await userModel.findOne({ _id: id });
  if (!userData) throw new HttpException(409, `Not a user`, {});
  if (!data)
    throw new HttpException(400, "Transaction data cannot be empty", {});
  if (!wallet) throw new HttpException(409, `Wallet data not found`, {});
  // once a payment is confirmed
  wallet.balance += data.amount;
  await transactionHistory.create({
    userId: id,
    ...data,
    date:DateTime.now(),
    type: "CREDIT",
    recipient: userData._id,
    status: 'completed'
  });
  wallet.save();


  return wallet;
};
const subscribe = async (walletData) => {
  const senderWallet = await walletModel.findOne({ user: id });
  const receiverWallet = await walletModel.findOne({
    user: walletData.receiversId,
  });
  const senderData = await userModel.findOne({ _id: id });
  const receiverData = await userModel.findOne({ _id: walletData.receiversId });
  if (!senderData)
    throw new HttpException(
      409,
      `user with id ${senderData._id} not found`,
      {}
    );
  if (!receiverData)
    throw new HttpException(
      409,
      `user with id ${!receiverData._id} not found`,
      {}
    );
  if (!senderWallet || !receiverWallet)
    throw new HttpException(409, `Wallet data not found`, {});
  if (walletData.amount > senderWallet.balance)
    throw new HttpException(409, `Insuffcient Balance`, {});

  if (!receiverData.subscribers.includes(senderData._id)) {
    const reference = "SUB" + `${Math.random().toString().substr(2, 8)}`;
    senderWallet.balance -= walletData.amount;
    receiverWallet.balance += walletData.amount;
    if (walletData.amount !== 0) {
      senderWallet.transaction_history.push({
        amount: walletData.amount,
        description: walletData.description,
        date:DateTime.now(),
        type: "transferOut",
        recipient: receiverData.firstName + " " + receiverData.lastName,
        sender: senderData.firstName + " " + senderData.lastName,
        reference,
      });
      receiverWallet.transaction_history.push({
        amount: walletData.amount,
        description: walletData.description,
        date:  DateTime.now(),
        type: "transferIn",
        recipient: receiverData.firstName + " " + receiverData.lastName,
        sender: senderData.firstName + " " + senderData.lastName,
        reference,
      });
    }
    const date =DateTime.now();
    const exipire = date.plus({months: 1});
    receiverData.subscribers.push(senderData._id);
    receiverData.subscribeTime.push({
      expiresIn: date.toString(),
      id: senderData._id,
    });
    receiverData.subscribersCount += 1;
    Promise.all([
      senderWallet.save(),
      receiverWallet.save(),
      receiverData.save(),
    ])
      .then(async () => {
        console.log("");
        // send notification to receiver
        await this.userNotification.create({
          userId: walletData.receiversId,
          triggerId: senderData?._id,
          title: `  subscribed to your channel`,
          content: `  subscribed to your channel and sent you ${walletData.amount} naira`,
          type: "Credit",
        });

        // send notification to sender
        await this.userNotification.create({
          userId: id,
          title: `You subscribed to @${receiverData?.username} channel`,
          triggerId: receiverData?._id,
          content: `You subscribed to @${receiverData?.username}   channel and  ${walletData.amount} naira was deducted from your wallet`,
          type: "Debit",
        });
      })
      .catch((error) => {
        throw new HttpException(409, error.message, {});
      });
  } else {
    throw new HttpException(
      409,
      `You are already subscribed to ${receiverData.username}`,
      {}
    );
  }
};
const getWallet = async (userId) => {
  const wallet = await walletModel.findOne({ user: userId });
  const walletSorted = {
    ...wallet,
    transaction_history: wallet.transaction_history.reverse(),
  };
  return walletSorted._doc;
};
const transferForSubscribe = async (walletData, id) => {
  const senderWallet = await walletModel.findOne({ user: id });
  const receiverWallet = await walletModel.findOne({
    user: walletData.receiversId,
  });
  const senderData = await userModel.findOne({ _id: id });
  const receiverData = await userModel.findOne({ _id: walletData.receiversId });
  if (!senderData)
    throw new HttpException(
      409,
      `user with id ${senderData._id} not found`,
      {}
    );
  if (!receiverData)
    throw new HttpException(
      409,
      `user with id ${!receiverData._id} not found`,
      {}
    );
  if (!senderWallet || !receiverWallet)
    throw new HttpException(409, `Wallet data not found`, {});
  if (walletData.amount > senderWallet.balance)
    throw new HttpException(409, `Insuffcient Balance`, {});

  // const channel = await this.channel.findOne({ userId: walletData.receiversId });
  if (!receiverData.subscribers.includes(senderData._id)) {
    console.log("Entered");
    const reference = "SUB" + `${Math.random().toString().substr(2, 8)}`;
    senderWallet.balance -= walletData.amount;
    receiverWallet.balance += walletData.amount;
    if (walletData.amount !== 0) {
      await transactionHistory.create({
        userId: senderData._id,
        amount: walletData.amount,
        description: "debit for subscription",
        date:DateTime.now(),
        type: "DEBIT",
        recipient: receiverData._id,
        reference,
        status: 'completed'
      });
      await transactionHistory.create({
        userId: receiverData._id,
        amount: walletData.amount,
        description: "credit for subscription",
        date:DateTime.now(),
        type: "CREDIT",
        sender: senderData._id,
        reference,
        status: 'completed'
      });
    }
    const date = DateTime.now();
    const expires = date.plus({months: 1});
    receiverData.subscribers.push(senderData._id);
    receiverData.subscribeTime.push({
      expiresIn: expires.toString(),
      id: senderData._id,
    });
    senderData.subscriptions.push({
      expiresIn: expires.toString(),
      id: receiverData._id,
    });
    receiverData.subscribersCount += 1;
    const date2 =DateTime.now();
    // const ifExists = channel.subscribe.find(
    //   each => each.month === date2.toString().slice(4, 7) && each.year === date2.toString().slice(11, 15),
    // );
    // let newChannelSub: { date; month; year; count }[] = [];
    // if (ifExists?.date) {
    //   newChannelSub = channel.subscribe.map(each => {
    //     if (each.month === ifExists.month && each.year === ifExists.year) {
    //       return { ...ifExists._doc, count: ifExists.count + 1 };
    //     } else {
    //       return each;
    //     }
    //   });
    // } else {
    //   newChannelSub = [
    //     ...channel.subscribe,
    //     { date: date2.toString(), month: date2.toString().slice(4, 7), count: 1, year: date2.toString().slice(11, 15) },
    //   ];
    // }
    await senderWallet.save();
    await receiverWallet.save();
    await receiverData.save();
    await senderData.save();
    // this.channel.findOneAndUpdate({ userId: walletData.receiversId }, { $set: { subscribe: newChannelSub } }),
    // send notification to receiver
    await notifications.createNotification({
      userId: walletData.receiversId,
      triggerId: senderData?._id,
      title: `@${senderData?.username}  subscribed to your channel`,
      content: `You're on a roll! @${senderData?.username}   just subscribed to your channel. Keep up the great work!`,
      type: "Credit",
    });
    // send notification to sender
    await notifications.createNotification({
      userId: id,
      title: `You subscribed to @${receiverData?.username}   channel`,
      triggerId: receiverData?._id,
      content: `Congratulations, you've subscribed to @${receiverData?.username}! Keep an eye out for new videos from your favorite creators`,
      type: "Debit",
    });
    return "subscribed";
  } else {
    throw new HttpException(
      409,
      `You are already subscribed to ${receiverData.username}`,
      {}
    );
  }
};
const createBeneficiary = async (user, beneData) => {
  const wallet = await walletModel.findOneAndUpdate(
    { user: user._id },
    { beneficiary: { account_name: beneData.account_ame, bank_name: beneData.bank_name, account_number: beneData.account_number, code: beneData?.code } },
    { new: true },
  );
  if (!wallet) throw new HttpException(409, `Wallet not found`, {});
  return wallet;
};

module.exports = {
  createWallet,
  fundWallet,
  subscribe,
  getWallet,
  transferForSubscribe,
  createBeneficiary,
};
