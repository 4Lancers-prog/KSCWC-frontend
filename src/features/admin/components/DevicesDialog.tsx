// DevicesDialog.tsx — an operator's registered devices (max 2) and their current login.
// Admin can remove a device (frees a slot; signs it out if in use) or end the login now.
import { Modal, Button, Spinner, Alert } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { useDeviceActions, useOperatorDevices } from '../admin.api';

export function DevicesDialog({ user, onClose }: { user: { id: string; fullName: string; phoneNormalized: string } | null; onClose: () => void }) {
  const { data, isLoading, isError } = useOperatorDevices(user?.id ?? null);
  const act = useDeviceActions(user?.id ?? null);
  const signedIn = data?.devices.find((d) => d.signedIn);

  return (
    <Modal open={!!user} onClose={onClose} title="ಸಾಧನಗಳು · Devices">
      {user && <p className="mb-3 text-sm text-slate2">{user.fullName} · {user.phoneNormalized}</p>}
      {isLoading && <div className="grid place-items-center py-8"><Spinner className="h-6 w-6 text-navy-500" /></div>}
      {isError && <Alert tone="error">ಲೋಡ್ ಆಗಲಿಲ್ಲ · Could not load devices.</Alert>}
      {data && (
        <>
          <p className="mb-3 text-xs text-slate2">
            {data.devices.length}/{data.maxDevices} ಸಾಧನಗಳು · devices registered. Only one can be signed in at a time;
            a signed-in device that is unused for {data.idleMinutes} minutes can be taken over by the other.
          </p>
          {data.devices.length === 0 ? (
            <p className="rounded-lg bg-mist p-4 text-sm text-slate2">ಇನ್ನೂ ಯಾವುದೇ ಸಾಧನವಿಲ್ಲ · No devices yet — registered on first sign-in.</p>
          ) : (
            <ul className="divide-y divide-line rounded-lg border border-line">
              {data.devices.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <p className="font-medium text-navy-900">
                      {d.label}
                      {d.signedIn && (
                        <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${d.idle ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {d.idle ? 'ಸೈನ್ ಇನ್ (ನಿಷ್ಕ್ರಿಯ) · Signed in, idle' : 'ಸೈನ್ ಇನ್ · Signed in now'}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate2">
                      ಮೊದಲು {formatDate(d.createdAt)} · ಕೊನೆಯ ಬಳಕೆ {formatDate(d.lastSeenAt)}
                    </p>
                  </div>
                  <Button size="sm" variant="danger" loading={act.remove.isPending && act.remove.variables === d.id}
                    onClick={() => act.remove.mutate(d.id)}>
                    ತೆಗೆದುಹಾಕಿ · Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex flex-wrap justify-between gap-2">
            <Button variant="secondary" disabled={!signedIn} loading={act.signOut.isPending} onClick={() => act.signOut.mutate()}>
              ಈಗ ಸೈನ್ ಔಟ್ ಮಾಡಿ · Sign out now
            </Button>
            <Button variant="secondary" onClick={onClose}>ಮುಚ್ಚಿ · Close</Button>
          </div>
        </>
      )}
    </Modal>
  );
}
