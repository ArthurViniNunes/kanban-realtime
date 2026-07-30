import { useState } from 'react';
import type { BoardMember, ManageableBoardRole } from '@/api/board-members.api';
import { ConfirmDialog } from './ConfirmDialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

interface BoardMembersPanelProps {
  members: BoardMember[];
  currentUserId: string;

  onAdd: (email: string, role: ManageableBoardRole) => Promise<boolean>;

  onUpdateRole: (memberId: string, role: ManageableBoardRole) => Promise<void>;

  onRemove: (memberId: string) => Promise<void>;
}

const roleLabels = {
  owner: 'Propietário',
  admin: 'Administrador',
  member: 'Membro',
} as const;

export function BoardMembersPanel({
  members,
  currentUserId,
  onAdd,
  onUpdateRole,
  onRemove,
}: BoardMembersPanelProps) {
  const [email, setEmail] = useState('');
  const [newMemberRole, setNewMemberRole] =
    useState<ManageableBoardRole>('member');
  const [adding, setAdding] = useState(false);
  const [pendingMemberId, setPendingMemberId] = useState<string | null>(null);
  const currentMembership = members.find(
    (member) => member.user.id === currentUserId,
  );

  const currentRole = currentMembership?.role;
  const canAddMembers = currentRole === 'owner' || currentRole === 'admin';

  async function handleAdd() {
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !canAddMembers) return;

    try {
      setAdding(true);

      const role = currentRole == 'admin' ? 'member' : newMemberRole;

      const added = await onAdd(normalizedEmail, role);

      if (added) {
        setEmail('');
        setNewMemberRole('member');
      }
    } finally {
      setAdding(false);
    }
  }

  async function handleUpdateRole(memberId: string, role: ManageableBoardRole) {
    try {
      setPendingMemberId(memberId);
      await onUpdateRole(memberId, role);
    } finally {
      setPendingMemberId(null);
    }
  }

  async function handleRemove(memberId: string) {
    try {
      setPendingMemberId(memberId);
      await onRemove(memberId);
    } finally {
      setPendingMemberId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Membros do board</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {canAddMembers && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="email"
              placeholder="Email do usuário"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="sm:flex-1"
            />

            {currentRole == 'owner' && (
              <select
                value={email}
                onChange={(event) =>
                  setNewMemberRole(event.target.value as ManageableBoardRole)
                }
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="member">Membro</option>
                <option value="admin">Administrador</option>
              </select>
            )}

            <Button onClick={handleAdd} disabled={adding || !email.trim()}>
              {adding ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>
        )}

        <div className="divide-y rounded-md border">
          {members.map((member) => {
            const isOwner = member.role === 'owner';

            const canUpdateRole = currentRole === 'owner' && !isOwner;

            const canRemove =
              !isOwner &&
              (currentRole === 'owner' ||
                (currentRole === 'admin' && member.role === 'member'));

            const pending = pendingMemberId === member.id;

            return (
              <div
                key={member.id}
                className="flex flex-col gap-3 p-3 sm:flex-row sm:itmes-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {member.user.name}
                    {member.user.id === currentUserId && ' (você)'}
                  </p>

                  <p className="truncate text-sm text-muted-foreground">
                    {member.user.email}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {canUpdateRole ? (
                    <select
                      value={member.role}
                      disabled={pending}
                      onChange={(event) =>
                        handleUpdateRole(
                          member.id,
                          event.target.value as ManageableBoardRole,
                        )
                      }
                      className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring=[3px] focus-visible:ring-ring/50"
                    >
                      <option value="member">Membro</option>
                      <option value="admin">Administrador</option>
                    </select>
                  ) : (
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                      {roleLabels[member.role]}
                    </span>
                  )}

                  {canRemove && (
                    <ConfirmDialog
                      title="Remover membro"
                      description={`Remover ${member.user.name} deste board?`}
                      confirmLabel="Remover"
                      onConfirm={() => handleRemove(member.id)}
                    >
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={pending}
                      >
                        Remover
                      </Button>
                    </ConfirmDialog>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
