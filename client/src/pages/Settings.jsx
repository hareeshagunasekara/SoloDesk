import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  Database,
  Download,
  Upload,
  Save,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // General
    language: 'en',
    timezone: 'America/Los_Angeles',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    projectUpdates: true,
    notificationInvoiceReminders: true,
    taskDeadlines: true,
    
    // Appearance
    theme: 'system',
    sidebarCollapsed: false,
    compactMode: false,
    
    // Security
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    
    // Billing
    autoRenewal: true,
    billingInvoiceReminders: true,
    paymentMethod: 'card',
  });

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Save settings to backend
      console.log('Saving settings:', settings);
      // await updateSettings(settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'data', label: 'Data & Export', icon: Database },
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label">Language</label>
          <select
            value={settings.language}
            onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
            className="select"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
          </select>
        </div>
        <div>
          <label className="label">Timezone</label>
          <select
            value={settings.timezone}
            onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
            className="select"
          >
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
            <option value="Asia/Tokyo">Tokyo</option>
          </select>
        </div>
        <div>
          <label className="label">Date Format</label>
          <select
            value={settings.dateFormat}
            onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
            className="select"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        <div>
          <label className="label">Time Format</label>
          <select
            value={settings.timeFormat}
            onChange={(e) => handleSettingChange('general', 'timeFormat', e.target.value)}
            className="select"
          >
            <option value="12h">12-hour</option>
            <option value="24h">24-hour</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-card-foreground">Email Notifications</h4>
            <p className="text-sm text-muted-foreground">Receive notifications via email</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-card-foreground">Push Notifications</h4>
            <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.pushNotifications}
              onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-card-foreground">Project Updates</h4>
            <p className="text-sm text-muted-foreground">Get notified about project changes</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.projectUpdates}
              onChange={(e) => handleSettingChange('notifications', 'projectUpdates', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-card-foreground">Invoice Reminders</h4>
            <p className="text-sm text-muted-foreground">Get reminded about unpaid invoices</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.notificationInvoiceReminders}
              onChange={(e) => handleSettingChange('notifications', 'notificationInvoiceReminders', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-card-foreground">Task Deadlines</h4>
            <p className="text-sm text-muted-foreground">Get notified about upcoming task deadlines</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.taskDeadlines}
              onChange={(e) => handleSettingChange('notifications', 'taskDeadlines', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="label">Theme</label>
        <div className="grid grid-cols-3 gap-4 mt-2">
          <button
            onClick={() => handleSettingChange('appearance', 'theme', 'light')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              settings.theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <Sun className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Light</span>
          </button>
          <button
            onClick={() => handleSettingChange('appearance', 'theme', 'dark')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              settings.theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <Moon className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Dark</span>
          </button>
          <button
            onClick={() => handleSettingChange('appearance', 'theme', 'system')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              settings.theme === 'system' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <Monitor className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">System</span>
          </button>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-card-foreground">Compact Mode</h4>
            <p className="text-sm text-muted-foreground">Reduce spacing for more content</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.compactMode}
              onChange={(e) => handleSettingChange('appearance', 'compactMode', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-card-foreground">Two-Factor Authentication</h4>
            <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.twoFactorAuth}
              onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
        <div>
          <label className="label">Session Timeout (minutes)</label>
          <select
            value={settings.sessionTimeout}
            onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
            className="select"
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={120}>2 hours</option>
            <option value={0}>Never</option>
          </select>
        </div>
        <div>
          <label className="label">Password Expiry (days)</label>
          <select
            value={settings.passwordExpiry}
            onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
            className="select"
          >
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
            <option value={180}>180 days</option>
            <option value={0}>Never</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderBillingSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-card-foreground">Auto-Renewal</h4>
            <p className="text-sm text-muted-foreground">Automatically renew your subscription</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.autoRenewal}
              onChange={(e) => handleSettingChange('billing', 'autoRenewal', e.target.checked)}
            />
          </label>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-card-foreground">Invoice Reminders</h4>
            <p className="text-sm text-muted-foreground">Get reminded about unpaid invoices</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.billingInvoiceReminders}
              onChange={(e) => handleSettingChange('billing', 'billingInvoiceReminders', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
        <div>
          <label className="label">Payment Method</label>
          <select
            value={settings.paymentMethod}
            onChange={(e) => handleSettingChange('billing', 'paymentMethod', e.target.value)}
            className="select"
          >
            <option value="card">Credit Card</option>
            <option value="paypal">PayPal</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="card">
          <div className="card-content">
            <h4 className="font-medium text-card-foreground mb-2">Export Data</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Download all your data in JSON format
            </p>
            <Button variant="outline" icon={<Download className="h-4 w-4" />}>
              Export Data
            </Button>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <h4 className="font-medium text-card-foreground mb-2">Import Data</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Import data from a JSON file
            </p>
            <Button variant="outline" icon={<Upload className="h-4 w-4" />}>
              Import Data
            </Button>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <h4 className="font-medium text-card-foreground mb-2 text-error">Delete Account</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete your account and all data
            </p>
            <Button variant="outline" className="text-error border-error hover:bg-error hover:text-error-foreground">
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'security':
        return renderSecuritySettings();
      case 'billing':
        return renderBillingSettings();
      case 'data':
        return renderDataSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and configuration
          </p>
        </div>
        <Button icon={<Save className="h-4 w-4" />} onClick={handleSave}>
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-content p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary/10 text-primary border-r-2 border-primary'
                          : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="card">
            <div className="card-content">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 