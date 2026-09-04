import type { Request, Response } from 'express';
import * as core from '../services/core.service.js';
import { ok } from '../utils/http.js';

const elevated = (req: Request) => req.user?.role === 'support' || req.user?.role === 'admin';
export const listProducts = (req: Request, res: Response) => ok(res, { products: core.listProducts(req.query) });
export const getProduct = (req: Request, res: Response) => ok(res, { product: core.productById(Number(req.params.id)) });
export const listOrders = (req: Request, res: Response) => ok(res, { orders: core.listOrders(req.user!.id, elevated(req)) });
export const getOrder = (req: Request, res: Response) => ok(res, { order: core.orderById(Number(req.params.id), req.user!.id, elevated(req)) });
export const createOrder = (req: Request, res: Response) => ok(res, { order: core.createOrder(req.user!.id, req.body) }, 201);
export const updateOrder = (req: Request, res: Response) => ok(res, { order: core.updateOrder(Number(req.params.id), req.user!.id, req.body, elevated(req)) });
export const listTickets = (req: Request, res: Response) => ok(res, { tickets: core.listTickets(req.user!.id, elevated(req)) });
export const getTicket = (req: Request, res: Response) => ok(res, { ticket: core.ticketById(Number(req.params.id), req.user!.id, elevated(req)) });
export const createTicket = (req: Request, res: Response) => ok(res, { ticket: core.createTicket(req.user!.id, req.body) }, 201);
export const updateTicket = (req: Request, res: Response) => ok(res, { ticket: core.updateTicket(Number(req.params.id), req.user!.id, req.body, elevated(req)) });
export const getProfile = (req: Request, res: Response) => ok(res, { profile: core.getProfile(req.user!.id) });
export const updateProfile = (req: Request, res: Response) => ok(res, { profile: core.updateProfile(req.user!.id, req.body) });
export const publicUser = (req: Request, res: Response) => {
  const profile = core.getProfile(Number(req.params.id));
  ok(res, { user: { id: profile.id, displayName: profile.displayName, bio: profile.bio } });
};
