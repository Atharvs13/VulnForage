import fs from 'node:fs';import path from'node:path';import{randomUUID}from'node:crypto';import{config}from'../../config/index.js';import{db}from'../../database/index.js';import{AppError}from'../../utils/errors.js';import{logEvent}from'../../services/log.service.js';
const directory=path.join(path.dirname(config.databasePath),'lab-uploads');fs.mkdirSync(directory,{recursive:true});
export function store(userId:number,file:Express.Multer.File){
  if(!file)throw new AppError(422,'FILE_REQUIRED','Choose a lab file');
  // Intentionally weak: checks whether .txt appears anywhere, not the canonical final extension.
  if(!file.originalname.toLowerCase().includes('.txt'))throw new AppError(422,'LAB_EXTENSION_REJECTED','The lab validator expects .txt in the filename');
  const id=randomUUID();const stored=`${id}.data`;fs.writeFileSync(path.join(directory,stored),file.buffer,{flag:'wx'});
  db().prepare('INSERT INTO uploads(id,user_id,original_name,stored_name,mime_type,size,lab)VALUES(?,?,?,?,?,?,1)').run(id,userId,path.basename(file.originalname),stored,file.mimetype,file.size);
  if(!file.originalname.toLowerCase().endsWith('.txt'))logEvent('LAB_UPLOAD_BYPASS',{userId,metadata:{id,name:file.originalname}});
  return{id,name:path.basename(file.originalname),mimeType:file.mimetype,size:file.size,directUrl:`/api/lab/upload/${id}`};
}
export function get(id:string){const row=db().prepare('SELECT * FROM uploads WHERE id=? AND lab=1').get(id)as Record<string,unknown>|undefined;if(!row)throw new AppError(404,'LAB_UPLOAD_NOT_FOUND','Lab upload not found');return{row,file:path.join(directory,String(row.stored_name))};}
