import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { UserPlus, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const WaitersPage = () => {
  const { waiters, addWaiter, removeWaiter } = useApp();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !password.trim()) {
      toast.error('All fields are required');
      return;
    }
    if (password.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }
    const success = addWaiter(name.trim(), username.trim(), password);
    if (success) {
      toast.success(`Waiter "${name}" added successfully`);
      setName('');
      setUsername('');
      setPassword('');
    } else {
      toast.error('Username already exists');
    }
  };

  const handleRemove = (id: string, waiterName: string) => {
    removeWaiter(id);
    toast.success(`Waiter "${waiterName}" removed`);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <h1 className="text-2xl font-bold text-foreground">Waiter Management</h1>

      {/* Add Waiter Form */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" />
          Add New Waiter
        </h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ravi Kumar" className="h-10" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Username</label>
            <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. ravi01" className="h-10" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 4 chars" className="h-10" />
          </div>
          <div className="sm:col-span-3">
            <Button type="submit" className="gap-2">
              <UserPlus className="w-4 h-4" /> Add Waiter
            </Button>
          </div>
        </form>
      </div>

      {/* Waiters List */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Waiters ({waiters.length})
        </h2>

        {waiters.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No waiters added yet</p>
            <p className="text-sm text-muted-foreground mt-1">Use the form above to add your first waiter</p>
          </div>
        ) : (
          <div className="space-y-3">
            {waiters.map(w => (
              <div key={w.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">{w.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{w.name}</p>
                    <p className="text-sm text-muted-foreground">@{w.username}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(w.id, w.name)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WaitersPage;