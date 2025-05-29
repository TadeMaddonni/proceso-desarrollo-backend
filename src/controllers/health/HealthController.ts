import { Request, Response } from 'express';
import { HealthService } from '../../services/health/HealthService.js';

export class HealthController {
    private healthService: HealthService;

    constructor() {
        this.healthService = new HealthService();
    }

    check = (req: Request, res: Response): void => {
        const healthStatus = this.healthService.getStatus();
        res.json(healthStatus);
    };
}