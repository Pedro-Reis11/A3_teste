import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export const dashboardRoutes = Router();
dashboardRoutes.get('/trips/:tripId/dashboard', asyncHandler(dashboardController.getByTrip));
