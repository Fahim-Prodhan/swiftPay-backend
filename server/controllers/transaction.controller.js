import bcrypt from "bcryptjs";
import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";

export const createTransaction = async (req, res) => {
  const { from, to, amount, tType, pin } = req.body;

  const amountInt = parseFloat(amount);

  if (from == to) {
    return res.status(400).send({ error: "Can't send To Your Own Account" });
  }

  if (amountInt < 10) {
    return res
      .status(400)
      .send({ error: "Minimum transaction amount is 10 Taka" });
  }

  try {
    // Find sender and receiver
    const sender = await User.findOne({ phone: from });
    const receiver = await User.findOne({ phone: to });

    if (!sender || !receiver) {
      return res.status(404).send({ error: "Sender or receiver not found" });
    }

    const isPinValid = await bcrypt.compare(pin, sender.pin);

    if (!isPinValid) {
      return res.status(400).send({ error: "Invalid PIN" });
    }


    // Calculate the transaction fee
    const transactionFee = amountInt >= 100 ? 5 : 0;
    const totalAmount = amountInt + transactionFee;

    if (sender.balance < totalAmount) {
      return res.status(400).send({ error: "Insufficient balance" });
    }

    const transactionId = `SFTID-${Math.floor(100000 + Math.random() * 90000)}`;

    const senderId = sender._id;
    const balance = sender.balance - totalAmount;
    const receiverId = receiver._id;
    const receiverBalance = receiver.balance + amountInt;

    // Update sender's balance
    const updatedSender = await User.findByIdAndUpdate(
      senderId,
      { balance },
      { new: true, runValidators: true }
    );

    const updatedReceiver = await User.findByIdAndUpdate(
      receiverId,
      { balance: receiverBalance },
      { new: true, runValidators: true }
    );

    const feeReceiver = await User.findOne({ phone: "01303687632" });
    if (feeReceiver) {
      feeReceiver.balance += transactionFee;
      await feeReceiver.save();
    }

    // Create the main transaction
    const mainTransaction = new Transaction({
      from: sender.phone,
      to: receiver.phone,
      amount,
      tType,
      transactionId:transactionId, // Shared transactionId
    });
    await mainTransaction.save();

    // Create the fee transaction if applicable
    if (transactionFee > 0) {
      const feeTransaction = new Transaction({
        from: sender.phone,
        to: feeReceiver.phone,
        amount: transactionFee,
        tType: 'Fee',
        transactionId:transactionId, // Same transactionId
      });
      await feeTransaction.save();
    }
    res.status(200).send(mainTransaction);

  } catch (error) {
    res.status(500).send(error);
    console.log(error);
    
  }
};

export const createCashOutTransaction = async (req, res) => {
  const { from, to, amount, tType, pin } = req.body;

  const amountInt = parseFloat(amount);

  if (from == to) {
    return res
      .status(400)
      .send({ error: "Can't send To Your Own Account" });
  }

  if (amountInt < 10) {
    return res
      .status(400)
      .send({ error: "Minimum transaction amount is 10 Taka" });
  }

  try {
    // Find sender and receiver
    const sender = await User.findOne({ phone: from });
    const receiver = await User.findOne({ phone: to });

    if (!sender || !receiver) {
      return res.status(404).send({ error: "Sender or receiver not found" });
    }

    if (receiver.role != 'agent') {
      return res.status(404).send({ error: "Receiver is not an agent" });
    }

    const isPinValid = await bcrypt.compare(pin, sender.pin);
    if (!isPinValid) {
      return res.status(400).send({ error: "Invalid PIN" });
    }

    // Calculate the transaction fee
    const transactionFee = (amountInt * 1.5) / 100;
    const totalAmount = amountInt + transactionFee;

    if (sender.balance < totalAmount) {
      return res.status(400).send({ error: "Insufficient balance" });
    }

  const transactionId = `SFTID-${Math.floor(100000 + Math.random() * 90000)}`;
  
    const senderId = sender._id;
    const balance = sender.balance - totalAmount;
    const receiverId = receiver._id;
    const receiverBalance = receiver.balance + amountInt + transactionFee;

    // Update sender's balance
    const updatedSender = await User.findByIdAndUpdate(
      senderId,
      { balance },
      { new: true, runValidators: true }
    );
    const updatedReceiver = await User.findByIdAndUpdate(
      receiverId,
      { balance: receiverBalance },
      { new: true, runValidators: true }
    );

    // Create transaction record
    const transaction = new Transaction({
      from: sender.phone,
      to: receiver.phone,
      amount,
      tType,
      transactionId
    });
    await transaction.save();

    if (transactionFee > 0) {
      const transaction = new Transaction({
        from: sender.phone,
        to: receiver.phone,
        amount: transactionFee,
        tType: 'Fee',
        transactionId
      });
      await transaction.save();
    }

    res.status(200).send(transaction);
  } catch (error) {
    res.status(500).send(error);
  }
};


// Recharge
export const createRechargeTransaction = async (req, res) => {
  const { from, to, amount, tType, pin } = req.body;

  const amountInt = parseFloat(amount);

  if (amountInt < 10) {
    return res
      .status(400)
      .send({ error: "Minimum transaction amount is 10 Taka" });
  }

  try {
    // Find sender and receiver
    const sender = await User.findOne({ phone: from });

    if (!sender ) {
      return res.status(404).send({ error: "Sender or receiver not found" });
    }


    const isPinValid = await bcrypt.compare(pin, sender.pin);
    if (!isPinValid) {
      return res.status(400).send({ error: "Invalid PIN" });
    }

    // Calculate the transaction fee
    const transactionFee = 0;
    const totalAmount = amountInt + transactionFee;

    if (sender.balance < totalAmount) {
      return res.status(400).send({ error: "Insufficient balance" });
    }
  const transactionId = `SFTID-${Math.floor(100000 + Math.random() * 90000)}`;
  
    const senderId = sender._id;
    const balance = sender.balance - totalAmount;


    // Update sender's balance
    const updatedSender = await User.findByIdAndUpdate(
      senderId,
      { balance },
      { new: true, runValidators: true }
    );


    // Create transaction record
    const transaction = new Transaction({
      from: sender.phone,
      to: to,
      amount,
      tType,
      transactionId
    });
    await transaction.save();


    res.status(200).send(transaction);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const getLast10Transactions = async (req, res) => {
  const { userPhone } = req.params;

  try {
    const transactions = await Transaction.find({
      $or: [{ from: userPhone }, { to: userPhone }],
    })
      .sort({ createdAt: -1 })
      .limit(20);

    // Separate transactions into debit and credit
    const debitTransactions = transactions.filter(transaction => transaction.from === userPhone);
    const creditTransactions = transactions.filter(transaction => transaction.to === userPhone);

    return res.status(200).send(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).send({ error: "Failed to fetch transactions" });
  }
};


