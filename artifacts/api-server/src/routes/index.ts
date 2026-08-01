import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth.js";
import profileRouter from "./profile.js";
import walletRouter from "./wallet.js";
import borrowerProfileRouter from "./borrower-profile.js";
import investorProfileRouter from "./investor-profile.js";
import investorRouter from "./investor.js";
import loansRouter from "./loans.js";
import marketRateRouter from "./market-rate.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/profile", profileRouter);
router.use("/wallet", walletRouter);
router.use("/borrower-profile", borrowerProfileRouter);
router.use("/investor-profile", investorProfileRouter);
router.use("/investor", investorRouter);
router.use("/loans", loansRouter);
router.use("/market-rate", marketRateRouter);

export default router;
