import React from 'react';
import Button from '../components/Button';
import { Play, Search, Filter } from 'lucide-react';

const TimeTracking = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Time Tracking</h1>
          <p className="text-muted-foreground">
            Track your time and monitor productivity
          </p>
        </div>
        <Button icon={<Play className="h-4 w-4" />}>
          Start Timer
        </Button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search time entries..."
                  className="input pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm" icon={<Filter className="h-4 w-4" />}>
                Filter
              </Button>
            </div>
          </div>
        </div>
        <div className="card-content">
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Play className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-card-foreground mb-2">
              No time entries found
            </h3>
            <p className="text-muted-foreground mb-4">
              Start tracking your time to monitor your productivity and bill accurately.
            </p>
            <Button icon={<Play className="h-4 w-4" />}>
              Start Your First Timer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTracking; 