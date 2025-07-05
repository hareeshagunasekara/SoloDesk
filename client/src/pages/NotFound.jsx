import React from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import { Home, ArrowLeft, Search } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 404 Number */}
        <div className="relative">
          <h1 className="text-9xl font-bold gradient-text">404</h1>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl -z-10" />
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-card-foreground">
            Page not found
          </h2>
          <p className="text-muted-foreground text-lg">
            Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            size="lg"
            icon={<Home className="h-4 w-4" />}
            iconPosition="left"
            as={Link}
            to="/dashboard"
          >
            Go to Dashboard
          </Button>
          <Button
            variant="outline"
            size="lg"
            icon={<ArrowLeft className="h-4 w-4" />}
            iconPosition="left"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>

        {/* Helpful links */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            Here are some helpful links:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              to="/dashboard"
              className="text-accent hover:text-accent/80 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/clients"
              className="text-accent hover:text-accent/80 transition-colors"
            >
              Clients
            </Link>
            <Link
              to="/projects"
              className="text-accent hover:text-accent/80 transition-colors"
            >
              Projects
            </Link>
            <Link
              to="/tasks"
              className="text-accent hover:text-accent/80 transition-colors"
            >
              Tasks
            </Link>
            <Link
              to="/calendar"
              className="text-accent hover:text-accent/80 transition-colors"
            >
              Calendar
            </Link>
          </div>
        </div>

        {/* Search suggestion */}
        <div className="pt-4">
          <p className="text-xs text-muted-foreground">
            Can't find what you're looking for? Try using the search bar in the top navigation.
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFound 