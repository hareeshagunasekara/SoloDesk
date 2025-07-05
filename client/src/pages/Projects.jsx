import React from 'react';
import Button from '../components/Button';
import { Plus, Search, Filter } from 'lucide-react';

const Projects = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Projects</h1>
          <p className="text-muted-foreground">
            Manage your projects and track their progress
          </p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />}>
          New Project
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
                  placeholder="Search projects..."
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
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-card-foreground mb-2">
              No projects found
            </h3>
            <p className="text-muted-foreground mb-4">
              Start by creating your first project to organize your work.
            </p>
            <Button icon={<Plus className="h-4 w-4" />}>
              Create Your First Project
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects; 