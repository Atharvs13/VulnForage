import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import multer from 'multer';
import { config } from '../config/index.js';
import { db } from '../database/index.js';
import { requireAuth } from '../middleware/auth.js';
import { logEvent } from '../services/log.service.js';
import { AppError } from '../utils/errors.js';
import { ok } from '../utils/http.js';

const directory = path.join(path.dirname(config.databasePath), 'uploads');
fs.mkdirSync(directory, { recursive: true });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: config.uploadMaxBytes } });
const allowed = new Set(['text/plain', 'image/png', 'image/jpeg', 'application/pdf']);

export const uploadsRouter = Router();
uploadsRouter.use(requireAuth);
uploadsRouter.post('/', upload.single('file'), (req, res) => {
  if (!req.file) throw new AppError(422, 'FILE_REQUIRED', 'Choose a file to upload');
  if (!allowed.has(req.file.mimetype)) throw new AppError(422, 'INVALID_FILE_TYPE', 'Only text, PNG, JPEG, and PDF files are accepted');
  const id = randomUUID(); const stored = `${id}.bin`;
  fs.writeFileSync(path.join(directory, stored), req.file.buffer, { flag: 'wx' });
  db().prepare('INSERT INTO uploads (id,user_id,original_name,stored_name,mime_type,size,lab) VALUES (?,?,?,?,?,?,0)').run(id, req.user!.id, path.basename(req.file.originalname), stored, req.file.mimetype, req.file.size);
  logEvent('UPLOAD', { requestId: req.requestId, userId: req.user!.id, route: req.path, method: req.method, metadata: { id, size: req.file.size } });
  ok(res, { upload: { id, name: path.basename(req.file.originalname), mimeType: req.file.mimetype, size: req.file.size } }, 201);
});
uploadsRouter.get('/:id', (req, res) => {
  const row = db().prepare('SELECT * FROM uploads WHERE id=? AND user_id=? AND lab=0').get(req.params.id, req.user!.id) as Record<string, unknown> | undefined;
  if (!row) throw new AppError(404, 'UPLOAD_NOT_FOUND', 'Upload not found');
  res.type(String(row.mime_type)); res.setHeader('Content-Disposition', `attachment; filename="${path.basename(String(row.original_name)).replaceAll('"','')}"`); res.sendFile(path.join(directory, String(row.stored_name)));
});
