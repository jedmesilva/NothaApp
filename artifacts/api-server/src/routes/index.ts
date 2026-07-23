import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth.js";
import profileRouter from "./profile.js";
import walletRouter from "./wallet.js";
import borrowerProfileRouter from "./borrower-profile.js";
import investorProfileRouter from "./investor-profile.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/profile", profileRouter);
router.use("/wallet", walletRouter);
router.use("/borrower-profile", borrowerProfileRouter);
router.use("/investor-profile", investorProfileRouter);

export default router;
