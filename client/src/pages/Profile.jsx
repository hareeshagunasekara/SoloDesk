import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { cn, generateInitials } from '../utils/cn';
import Button from '../components/Button';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Camera,
  Save,
  Edit,
  Shield,
  Bell,
  Palette,
  Globe as GlobeIcon,
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || 'John',
    lastName: user?.lastName || 'Doe',
    email: user?.email || 'john.doe@example.com',
    phone: user?.phone || '+1 (555) 123-4567',
    company: user?.company || 'SoloDesk',
    website: user?.website || 'https://solodesk.com',
    address: user?.address || '123 Business St, San Francisco, CA 94105',
    bio: user?.bio || 'Freelance web developer and designer with 5+ years of experience.',
    timezone: user?.timezone || 'America/Los_Angeles',
    currency: user?.currency || 'USD',
    hourlyRate: user?.hourlyRate || 75,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || 'John',
      lastName: user?.lastName || 'Doe',
      email: user?.email || 'john.doe@example.com',
      phone: user?.phone || '+1 (555) 123-4567',
      company: user?.company || 'SoloDesk',
      website: user?.website || 'https://solodesk.com',
      address: user?.address || '123 Business St, San Francisco, CA 94105',
      bio: user?.bio || 'Freelance web developer and designer with 5+ years of experience.',
      timezone: user?.timezone || 'America/Los_Angeles',
      currency: user?.currency || 'USD',
      hourlyRate: user?.hourlyRate || 75,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button icon={<Save className="h-4 w-4" />} onClick={handleSave}>
                Save Changes
              </Button>
            </>
          ) : (
            <Button icon={<Edit className="h-4 w-4" />} onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Personal Information</h3>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="input"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={3}
                    className="textarea"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={4}
                    className="textarea"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Business Settings */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Business Settings</h3>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="label">Timezone</label>
                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
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
                  <label className="label">Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="select"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="AUD">AUD (A$)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Hourly Rate</label>
                  <input
                    type="number"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="input"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="card">
            <div className="card-content text-center">
              <div className="relative inline-block">
                <div className="h-24 w-24 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-accent-foreground">
                    {generateInitials(`${formData.firstName} ${formData.lastName}`)}
                  </span>
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>
              <h3 className="font-semibold text-card-foreground mb-1">
                {formData.firstName} {formData.lastName}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {formData.company}
              </p>
              <p className="text-sm text-muted-foreground">
                {formData.bio}
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Contact Information</h3>
            </div>
            <div className="card-content space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    Email
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formData.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    Phone
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formData.phone}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <GlobeIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    Website
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formData.website}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    Address
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formData.address}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Quick Actions</h3>
            </div>
            <div className="card-content space-y-3">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                icon={<Shield className="h-4 w-4" />}
                iconPosition="left"
              >
                Change Password
              </Button>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                icon={<Bell className="h-4 w-4" />}
                iconPosition="left"
              >
                Notification Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                icon={<Palette className="h-4 w-4" />}
                iconPosition="left"
              >
                Appearance
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 