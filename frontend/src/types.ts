export type User={id:number;email:string;role:'user'|'support'|'admin';displayName:string};
export type Product={id:number;sku:string;name:string;description:string;category:string;priceCents:number;stock:number;image:string};
export type OrderItem={id:number;productId:number;name:string;quantity:number;unitPriceCents:number};
export type Order={id:number;userId:number;status:string;totalCents:number;shippingAddress:string;createdAt:string;customerName:string;items:OrderItem[]};
export type Ticket={id:number;subject:string;message:string;status:string;createdAt:string};
export type Mission={id:string;title:string;description:string;category:string;difficulty:string;objective:string;target:string;hints:string[];expectedEvidence:string;status:'available'|'in_progress'|'failed'|'completed';attempt:null|{attemptCount:number;startedAt:string;completedAt?:string};defense:null|{rootCause:string;remediation:string;retest:string}};
