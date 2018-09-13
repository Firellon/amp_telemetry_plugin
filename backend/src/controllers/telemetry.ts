import { Request, Response } from "express";
import Telemetry from "../models/Telemetry";

/**
 * POST /signup
 * Create a new local account.
 */
export let postTelemetry = (req: Request, res: Response) => {
    const telemetry = new Telemetry(req.body);
    console.log(`postTelemetry`, telemetry);
    telemetry.save()
    res.sendStatus(200)
};