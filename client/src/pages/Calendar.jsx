import React from 'react';
import Button from '../components/Button';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';

const Calendar = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Calendar</h1>
          <p className="text-muted-foreground">
            Schedule meetings, deadlines, and events
          </p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />}>
          New Event
        </Button>
      </div>

      <div className="card">
        <div className="card-content">
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <CalendarIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-card-foreground mb-2">
              Calendar coming soon
            </h3>
            <p className="text-muted-foreground mb-4">
              FullCalendar integration will be implemented here for scheduling and event management.
            </p>
            <Button icon={<Plus className="h-4 w-4" />}>
              Add Event
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar; 