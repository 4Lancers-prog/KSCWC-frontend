// WalletManagement.tsx — view wallet balances and make audited credit/debit adjustments (AC-13).
import { Fragment, useState } from 'react';
import { Button, Input, Select, Table, Th, Td, Pagination, Spinner, Alert } from '@/components/ui';
import { useAdminWallets, useWalletAdjust } from '../admin.api';
import { formatPaise } from '@/lib/format';
import { rupeesToPaise } from '@/lib/money';

export function WalletManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, isLoading } = useAdminWallets({ search: search || undefined, page });
  const adjust = useWalletAdjust();
  const [open, setOpen] = useState<string | null>(null);
  const [form, setForm] = useState({ rupees: '', direction: 'CREDIT', reason: '' });
  const [msg, setMsg] = useState<string | null>(null);

  const apply = async (userId: string) => {
    setMsg(null);
    const amt = Number(form.rupees);
    if (!amt || amt <= 0 || form.reason.trim().length < 3) return setMsg('ಮಾನ್ಯ ಮೊತ್ತ ಮತ್ತು ಕಾರಣ ನಮೂದಿಸಿ');
    try {
      await adjust.mutateAsync({ userId, amountPaise: rupeesToPaise(amt), direction: form.direction as 'CREDIT' | 'DEBIT', reason: form.reason });
      setOpen(null);
      setForm({ rupees: '', direction: 'CREDIT', reason: '' });
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Adjustment failed');
    }
  };

  return (
    <div>
      <div className="gold-rule mb-3" />
      <h1 className="font-display text-2xl text-navy-900">ವಾಲೆಟ್ ನಿರ್ವಹಣೆ</h1>
      <p className="text-sm text-slate2">Adjustments require a reason and are recorded in the audit log.</p>

      <div className="mt-6 max-w-sm"><Input placeholder="ಹೆಸರು / ಮೊಬೈಲ್ ಹುಡುಕಿ" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>

      <div className="mt-6">
        {isLoading ? <div className="grid place-items-center py-16"><Spinner className="h-7 w-7 text-navy-500" /></div> : !data || data.total === 0 ? (
          <div className="rounded-xl2 border border-dashed border-line bg-white p-10 text-center text-slate2">—</div>
        ) : (
          <>
            <Table>
              <thead><tr><Th>ಬಳಕೆದಾರ</Th><Th>ಬ್ಯಾಲೆನ್ಸ್</Th><Th> </Th></tr></thead>
              <tbody>
                {data.items.map((w) => (
                  <Fragment key={w.id}>
                    <tr>
                      <Td className="text-navy-900">{w.user.fullName}<div className="text-xs text-slate2">{w.user.phoneNormalized}</div></Td>
                      <Td>{formatPaise(w.balancePaise)}</Td>
                      <Td><Button size="sm" variant="secondary" onClick={() => { setOpen(open === w.user.id ? null : w.user.id); setMsg(null); }}>ಹೊಂದಾಣಿಕೆ</Button></Td>
                    </tr>
                    {open === w.user.id && (
                      <tr>
                        <Td className="bg-mist"> </Td>
                        <Td className="bg-mist"> </Td>
                        <Td className="bg-mist">
                          {msg && <div className="mb-2"><Alert tone="error">{msg}</Alert></div>}
                          <div className="flex flex-wrap items-center gap-2">
                            <Select value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })} className="w-28">
                              <option value="CREDIT">ಕ್ರೆಡಿಟ್</option>
                              <option value="DEBIT">ಡೆಬಿಟ್</option>
                            </Select>
                            <Input className="w-24" placeholder="₹" value={form.rupees} onChange={(e) => setForm({ ...form, rupees: e.target.value })} />
                            <Input className="w-48" placeholder="ಕಾರಣ · Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
                            <Button size="sm" loading={adjust.isPending} onClick={() => apply(w.user.id)}>ಅನ್ವಯಿಸಿ</Button>
                          </div>
                        </Td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </Table>
            <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
