import { Router, type IRouter } from "express";
import healthRouter from "./health";
import carsRouter from "./cars";
import inquiriesRouter from "./inquiries";
import bookingsRouter from "./bookings";
import testimonialsRouter from "./testimonials";
import blogRouter from "./blog";
import teamRouter from "./team";
import servicesRouter from "./services";
import settingsRouter from "./settings";
import adminRouter from "./admin";
import tradeInsRouter from "./trade-ins";
import financingRouter from "./financing";
import openaiRouter from "./openai/index";
import newsletterRouter from "./newsletter";

const router: IRouter = Router();

router.use(healthRouter);
router.use(carsRouter);
router.use(inquiriesRouter);
router.use(bookingsRouter);
router.use(testimonialsRouter);
router.use(blogRouter);
router.use(teamRouter);
router.use(servicesRouter);
router.use(settingsRouter);
router.use(adminRouter);
router.use(tradeInsRouter);
router.use(financingRouter);
router.use(openaiRouter);
router.use(newsletterRouter);

export default router;
