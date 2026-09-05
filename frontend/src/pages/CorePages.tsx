import{useEffect,useState,type FormEvent}from'react';import{Link,useNavigate,useParams}from'react-router-dom';import{api,money}from'../services/api';import type{Mission,Order,Product,Ticket}from'../types';import{Empty,ErrorBox,Loading}from'../components/Status';
function useLoad<T>(path:string){const[data,setData]=useState<T>();const[error,setError]=useState<unknown>();const[version,setVersion]=useState(0);useEffect(()=>{setError(undefined);api<T>(path).then(setData).catch(setError)},[path,version]);return{data,error,reload:()=>setVersion(v=>v+1)}}
const Header=({eyebrow,title,copy}:{eyebrow:string;title:string;copy:string})=><div className="mb-6"><p className="eyebrow">{eyebrow}</p><h1 className="page-title mt-2">{title}</h1><p className="mt-2 max-w-2xl text-muted">{copy}</p></div>;
export function Dashboard(){const{data,error}=useLoad<{products:Product[]}>('/api/products');const orders=useLoad<{orders:Order[]}>('/api/orders');const missions=useLoad<{missions:Mission[]}>('/api/missions');if(error||orders.error||missions.error)return <ErrorBox error={error||orders.error||missions.error}/>;if(!data||!orders.data||!missions.data)return <Loading/>;const complete=missions.data.missions.filter(m=>m.status==='completed').length;return <><Header eyebrow="Range telemetry" title="Operation overview" copy="Your commerce surface, mission progress, and current synthetic activity."/><div className="grid gap-4 sm:grid-cols-3"><div className="card"><span className="label">Catalog targets</span><b className="text-4xl">{data.products.length}</b></div><div className="card"><span className="label">Orders observed</span><b className="text-4xl">{orders.data.orders.length}</b></div><div className="card"><span className="label">Missions cleared</span><b className="text-4xl text-acid">{complete}/{missions.data.missions.length}</b></div></div><section className="mt-8"><div className="mb-3 flex items-end justify-between"><h2 className="text-xl font-semibold">Active mission board</h2><Link to="/missions" className="text-sm text-cyan">View all →</Link></div><div className="grid-auto">{missions.data.missions.slice(0,3).map(m=><Link key={m.id} to={`/missions/${m.id}`} className="card group hover:border-cyan/50"><span className="eyebrow">{m.id} · {m.category}</span><h3 className="mt-3 text-lg font-semibold group-hover:text-cyan">{m.title}</h3><p className="mt-2 text-sm text-muted">{m.objective}</p><span className="pill mt-4">{m.status}</span></Link>)}</div></section></>}
export function Products(){const[q,setQ]=useState('');const{data,error}=useLoad<{products:Product[]}>(`/api/products?q=${encodeURIComponent(q)}`);return <><Header eyebrow="Commerce surface" title="Field equipment" copy="Browse the realistic application first. Product and checkout traffic create useful requests to inspect."/><input className="input mb-5 max-w-md" placeholder="Search catalog…" value={q} onChange={e=>setQ(e.target.value)}/>{error?<ErrorBox error={error}/>:!data?<Loading/>:data.products.length===0?<Empty>No matching products.</Empty>:<div className="grid-auto">{data.products.map(p=><Link key={p.id} to={`/products/${p.id}`} className="card group"><div className="mb-5 grid h-28 place-items-center rounded-lg bg-gradient-to-br from-cyan/10 to-acid/5 font-mono text-3xl uppercase text-cyan/70">{p.image.slice(0,3)}</div><div className="flex items-start justify-between gap-3"><div><span className="eyebrow">{p.category} / {p.sku}</span><h2 className="mt-2 text-lg font-semibold group-hover:text-cyan">{p.name}</h2></div><b>{money(p.priceCents)}</b></div><p className="mt-3 text-sm text-muted">{p.description}</p><p className="mt-4 font-mono text-xs text-acid">{p.stock} in synthetic stock</p></Link>)}</div>}</>}
export function ProductDetail(){const{id}=useParams();const{data,error}=useLoad<{product:Product}>(`/api/products/${id}`);if(error)return <ErrorBox error={error}/>;if(!data)return <Loading/>;const p=data.product;return <><Link className="eyebrow" to="/products">← catalog</Link><div className="mt-4 grid gap-6 lg:grid-cols-2"><div className="card grid min-h-80 place-items-center bg-gradient-to-br from-cyan/10 to-acid/5 font-mono text-7xl uppercase text-cyan/60">{p.image.slice(0,3)}</div><div className="card"><span className="eyebrow">{p.category} / {p.sku}</span><h1 className="page-title mt-3">{p.name}</h1><p className="mt-5 leading-7 text-muted">{p.description}</p><p className="mt-8 text-3xl font-semibold">{money(p.priceCents)}</p><p className="mt-2 font-mono text-xs text-acid">{p.stock} units available</p><Link className="btn mt-8 w-full" to={`/checkout/${p.id}`}>Configure checkout</Link></div></div></>}
export function Checkout(){const{id}=useParams();const navigate=useNavigate();const{data,error}=useLoad<{product:Product}>(`/api/products/${id}`);const[address,setAddress]=useState('100 Training Circuit, Lab City');const[quantity,setQuantity]=useState(1);const[busy,setBusy]=useState(false);const[submitError,setSubmitError]=useState<unknown>();if(error)return <ErrorBox error={error}/>;if(!data)return <Loading/>;async function submit(e:FormEvent){e.preventDefault();setBusy(true);setSubmitError(undefined);try{const x=await api<{order:Order}>('/api/orders',{method:'POST',body:JSON.stringify({items:[{productId:Number(id),quantity}],shippingAddress:address})});navigate(`/orders/${x.order.id}`)}catch(err){setSubmitError(err)}finally{setBusy(false)}}return <><Header eyebrow="Checkout" title="Confirm synthetic order" copy="No real payment occurs. The secure core endpoint calculates price and inventory on the server."/><form className="card max-w-2xl space-y-5" onSubmit={submit}>{submitError?<ErrorBox error={submitError}/>:null}<div className="flex justify-between"><b>{data.product.name}</b><span>{money(data.product.priceCents*quantity)}</span></div><label><span className="label">Quantity</span><input className="input" type="number" min={1} max={20} value={quantity} onChange={e=>setQuantity(Number(e.target.value))}/></label><label><span className="label">Shipping address</span><textarea className="input min-h-24" value={address} onChange={e=>setAddress(e.target.value)}/></label><button className="btn w-full" disabled={busy}>{busy?'Creating order…':'Place lab order'}</button></form></>}
export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  let badgeClass = 'border-line text-muted bg-ink/60';
  if (s === 'shipped' || s === 'completed' || s === 'delivered') {
    badgeClass = 'border-acid/40 text-acid bg-acid/10 font-semibold';
  } else if (s === 'processing' || s === 'in_progress' || s === 'pending') {
    badgeClass = 'border-cyan/40 text-cyan bg-cyan/10 font-semibold';
  } else if (s === 'cancelled' || s === 'failed') {
    badgeClass = 'border-red-500/40 text-red-300 bg-red-500/10';
  }
  return <span className={`pill ${badgeClass}`}>{status.replace('_', ' ')}</span>;
}

export function Orders() {
  const { data, error } = useLoad<{ orders: Order[] }>('/api/orders');

  return (
    <>
      <Header
        eyebrow="Account management"
        title="Order History"
        copy="View your recent purchases, order statuses, and shipment details."
      />
      {error ? (
        <ErrorBox error={error} />
      ) : !data ? (
        <Loading />
      ) : data.orders.length === 0 ? (
        <Empty>No orders placed yet. Explore the equipment catalog to place a test order.</Empty>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-line">
                <tr>
                  <th className="px-6 py-4 font-mono text-[11px] uppercase tracking-wider text-muted">Order ID</th>
                  <th className="px-6 py-4 font-mono text-[11px] uppercase tracking-wider text-muted">Date</th>
                  <th className="px-6 py-4 font-mono text-[11px] uppercase tracking-wider text-muted">Status</th>
                  <th className="px-6 py-4 font-mono text-[11px] uppercase tracking-wider text-muted">Items</th>
                  <th className="px-6 py-4 font-mono text-[11px] uppercase tracking-wider text-muted">Total</th>
                  <th className="px-6 py-4 text-right font-mono text-[11px] uppercase tracking-wider text-muted">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {data.orders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-white">#{o.id}</td>
                    <td className="px-6 py-4 text-slate-300">
                      {new Date(o.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {o.items.reduce((acc, item) => acc + item.quantity, 0)} {o.items.reduce((acc, item) => acc + item.quantity, 0) === 1 ? 'item' : 'items'}
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-white">{money(o.totalCents)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/orders/${o.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-cyan hover:text-white transition-colors"
                      >
                        View Order <span aria-hidden="true">→</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const { data, error, reload } = useLoad<{ order: Order }>(`/api/orders/${id}`);
  const [message, setMessage] = useState('');
  const [cancelling, setCancelling] = useState(false);

  if (error) return <ErrorBox error={error} />;
  if (!data) return <Loading />;

  const o = data.order;

  async function cancel() {
    setCancelling(true);
    try {
      await api(`/api/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'cancelled' }),
      });
      setMessage('Order cancelled successfully.');
      reload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Unable to cancel order');
    } finally {
      setCancelling(false);
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Link className="eyebrow inline-flex items-center gap-1 hover:text-white transition-colors" to="/orders">
          ← Back to Order History
        </Link>
      </div>

      <div className="space-y-6">
        {/* Order Header Summary Card */}
        <div className="card">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
            <div>
              <span className="label">Order Reference</span>
              <h1 className="text-3xl font-bold tracking-tight text-white font-mono">#{o.id}</h1>
              <p className="mt-1 text-xs text-muted">
                Placed on{' '}
                {new Date(o.createdAt).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={o.status} />
              {!['cancelled', 'shipped'].includes(o.status.toLowerCase()) && (
                <button
                  className="btn-ghost text-xs py-1.5 px-3"
                  onClick={cancel}
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}
            </div>
          </div>

          {message && <div className="alert mt-4">{message}</div>}

          {/* Details Grid */}
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="label">Shipping Information</h3>
              <div className="mt-2 rounded-lg border border-line bg-ink/40 p-4 text-sm space-y-1">
                {o.customerName && <p className="font-semibold text-white">{o.customerName}</p>}
                <p className="text-slate-300 leading-relaxed">{o.shippingAddress}</p>
              </div>
            </div>

            <div>
              <h3 className="label">Order Summary</h3>
              <div className="mt-2 rounded-lg border border-line bg-ink/40 p-4 text-sm space-y-2 font-mono">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span>{money(o.totalCents)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Shipping</span>
                  <span className="text-acid">Free</span>
                </div>
                <div className="flex justify-between border-t border-line/60 pt-2 text-base font-bold text-white">
                  <span>Total</span>
                  <span className="text-cyan">{money(o.totalCents)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items Table Card */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Purchased Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-white/5">
                <tr>
                  <th className="p-3 font-mono text-[10px] uppercase tracking-wider text-muted">Product</th>
                  <th className="p-3 font-mono text-[10px] uppercase tracking-wider text-muted text-center">Qty</th>
                  <th className="p-3 font-mono text-[10px] uppercase tracking-wider text-muted text-right">Unit Price</th>
                  <th className="p-3 font-mono text-[10px] uppercase tracking-wider text-muted text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/40">
                {o.items.map((i) => (
                  <tr key={i.id} className="hover:bg-white/[0.02]">
                    <td className="p-3 font-medium text-white">{i.name}</td>
                    <td className="p-3 text-center text-slate-300 font-mono">{i.quantity}</td>
                    <td className="p-3 text-right text-slate-300 font-mono">{money(i.unitPriceCents)}</td>
                    <td className="p-3 text-right font-mono font-semibold text-white">
                      {money(i.unitPriceCents * i.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
export function Support(){const{data,error,reload}=useLoad<{tickets:Ticket[]}>('/api/support/tickets');const[subject,setSubject]=useState('');const[message,setMessage]=useState('');const[formError,setFormError]=useState<unknown>();async function submit(e:FormEvent){e.preventDefault();try{await api('/api/support/tickets',{method:'POST',body:JSON.stringify({subject,message})});setSubject('');setMessage('');reload()}catch(err){setFormError(err)}}return <><Header eyebrow="Customer channel" title="Support desk" copy="Core support renders messages safely. A separate mission exposes the intentionally unsafe path."/><div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]"><form className="card space-y-4" onSubmit={submit}><h2 className="text-lg font-semibold">Open ticket</h2>{formError?<ErrorBox error={formError}/>:null}<label><span className="label">Subject</span><input className="input" required minLength={3} value={subject} onChange={e=>setSubject(e.target.value)}/></label><label><span className="label">Message</span><textarea className="input min-h-32" required minLength={5} value={message} onChange={e=>setMessage(e.target.value)}/></label><button className="btn">Submit ticket</button></form><div className="space-y-3">{error?<ErrorBox error={error}/>:!data?<Loading/>:data.tickets.length===0?<Empty>No support tickets.</Empty>:data.tickets.map(t=><article className="card" key={t.id}><div className="flex justify-between"><b>#{t.id} · {t.subject}</b><span className="pill">{t.status}</span></div><p className="mt-3 whitespace-pre-wrap text-sm text-muted">{t.message}</p></article>)}</div></div></>}
export function Profile(){const{data,error,reload}=useLoad<{profile:{displayName:string;email:string;role:string;bio:string;shippingAddress:string}}>('/api/users/me');const[state,setState]=useState({displayName:'',bio:'',shippingAddress:''});const[ready,setReady]=useState(false);const[msg,setMsg]=useState('');useEffect(()=>{if(data&&!ready){setState({displayName:data.profile.displayName,bio:data.profile.bio,shippingAddress:data.profile.shippingAddress});setReady(true)}},[data,ready]);if(error)return <ErrorBox error={error}/>;if(!data)return <Loading/>;async function submit(e:FormEvent){e.preventDefault();try{await api('/api/users/me',{method:'PATCH',body:JSON.stringify(state)});setMsg('Profile saved.');reload()}catch(err){setMsg(err instanceof Error?err.message:'Save failed')}}return <><Header eyebrow="Identity" title="Operator profile" copy={`${data.profile.email} · ${data.profile.role}`}/><form className="card max-w-2xl space-y-5" onSubmit={submit}>{msg&&<div className="alert">{msg}</div>}<label><span className="label">Display name</span><input className="input" value={state.displayName} onChange={e=>setState({...state,displayName:e.target.value})}/></label><label><span className="label">Bio</span><textarea className="input" value={state.bio} onChange={e=>setState({...state,bio:e.target.value})}/></label><label><span className="label">Default address</span><textarea className="input" value={state.shippingAddress} onChange={e=>setState({...state,shippingAddress:e.target.value})}/></label><button className="btn">Save profile</button></form></>}
