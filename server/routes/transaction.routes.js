import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import adminProtectRoute from "../middleware/verifyAdmin.js";
import { createTransaction, getLast10Transactions,createCashOutTransaction,createRechargeTransaction } from "../controllers/transaction.controller.js";
const router = express.Router();

router.post("/create-transaction", createTransaction);
router.post("/create-cash-out-transaction", createCashOutTransaction);
router.post("/create-recharge-transaction", createRechargeTransaction);
router.get("/get-transaction/:userPhone", getLast10Transactions);


export default router;
