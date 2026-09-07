import type { Request, Response } from 'express';
import { labContext } from '../../../lab/lab.context.js';
import { ok } from '../../../utils/http.js';
import * as service from './service.js';

const labMarker = { intentionallyVulnerable: true, scope: 'synthetic-local-fixtures' };

export function getDirectOrder(req: Request, res: Response): void {
  ok(res, { order: service.directBola(req.params.id, labContext(req)), lab: labMarker });
}

export function getNestedOrder(req: Request, res: Response): void {
  ok(res, { order: service.nestedBola(req.params.userId, req.params.orderId, labContext(req)), lab: labMarker });
}

export function roles(req: Request, res: Response): void {
  ok(res, { ...service.listRoleCatalog(req.query), lab: labMarker });
}

export function resources(req: Request, res: Response): void {
  ok(res, { resources: service.listResources(labContext(req), req.query), lab: labMarker });
}

export function reclassify(req: Request, res: Response): void {
  ok(res, { resource: service.reclassifyResource(req.params.id, req.header('x-lab-role-id'), req.body, labContext(req)), lab: labMarker });
}
