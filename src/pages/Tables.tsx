import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Pencil, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import WaiterOrderPanel from '@/components/WaiterOrderPanel';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Tables = () => {
  const { tables, currentUser, updateTableSeats } = useApp();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [editingTable, setEditingTable] = useState<number | null>(null);
  const [seatValue, setSeatValue] = useState('');

  const statusConfig = {
    available: { label: 'Available', dot: 'bg-emerald-500', card: 'status-available' },
    occupied: { label: 'Occupied', dot: 'bg-red-500', card: 'status-occupied' },
    reserved: { label: 'Reserved', dot: 'bg-amber-500', card: 'status-reserved' },
  };

  if (selectedTable) {
    return <WaiterOrderPanel tableId={selectedTable} onBack={() => setSelectedTable(null)} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Table Management</h1>
          <p className="text-muted-foreground text-sm">Click a table to manage orders</p>
        </div>
        <div className="flex gap-4">
          {Object.entries(statusConfig).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className={cn("w-2.5 h-2.5 rounded-full", val.dot)} />
              {val.label}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {tables.map(table => {
          const config = statusConfig[table.status];
          return (
            <button
              key={table.id}
              onClick={() => setSelectedTable(table.id)}
              className={cn(
                "p-5 rounded-xl border-2 transition-all duration-200 hover:shadow-md hover:-translate-y-1 text-left",
                config.card
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold">T{table.number}</span>
                <div className={cn("w-3 h-3 rounded-full", config.dot)} />
              </div>
              <div className="flex items-center gap-1.5 text-sm opacity-80">
                <Users className="w-3.5 h-3.5" />
                <span>{table.seats} seats</span>
              </div>
              {currentUser?.role === 'admin' && (
                <div className="mt-3" onClick={e => e.stopPropagation()}>
                  {editingTable === table.id ? (
                    <div className="flex gap-2">
                      <Input
                        value={seatValue}
                        onChange={e => setSeatValue(e.target.value)}
                        inputMode="numeric"
                        className="h-8"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          const seats = Number(seatValue);
                          if (seats > 0) updateTableSeats(table.id, seats);
                          setEditingTable(null);
                          setSeatValue('');
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingTable(table.id);
                        setSeatValue(String(table.seats));
                      }}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Pencil className="w-3 h-3" /> Edit seats
                    </button>
                  )}
                </div>
              )}
              <p className="text-xs font-medium mt-2 capitalize">{config.label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Tables;
