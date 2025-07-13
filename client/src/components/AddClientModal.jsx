import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';
import { X, User, Building2, Tag, FileText as FileTextIcon, Link, Loader2, ChevronRight, Upload, ExternalLink, Trash2, Plus, File, FileImage, FileVideo, FileAudio, FileArchive } from 'lucide-react';

const AddClientModal = ({ isOpen, onClose, onSubmit, onClientCreated }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [addingLink, setAddingLink] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    // Client Type & Contact Info
    type: 'Individual',
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: ''
    },
    
    // Company Details (conditional)
    companyName: '',
    companyWebsite: '',
    industry: '',
    
    // CRM Info
    status: 'Lead',
    tags: [],
    lastContacted: '',
    
    // Notes
    notes: '',
    
    // Attachments & Links
    attachments: [],
    links: []
  });

  // New link form state
  const [newLink, setNewLink] = useState({
    title: '',
    url: '',
    description: '',
    type: 'other'
  });

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      e.target.value = '';
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // File upload handling
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingFiles(true);
    
    // Simulate file upload (in real app, you'd upload to cloud storage)
    const uploadPromises = files.map(file => {
      return new Promise((resolve) => {
        // Simulate upload delay
        setTimeout(() => {
          const attachment = {
            filename: `uploaded_${Date.now()}_${file.name}`,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            url: URL.createObjectURL(file), // In real app, this would be the cloud storage URL
            uploadedAt: new Date(),
            // Add preview URL for images
            previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
          };
          resolve(attachment);
        }, 1000);
      });
    });

    Promise.all(uploadPromises)
      .then(attachments => {
        setFormData(prev => ({
          ...prev,
          attachments: [...prev.attachments, ...attachments]
        }));
        setUploadingFiles(false);
      })
      .catch(error => {
        console.error('File upload error:', error);
        setError('Failed to upload files. Please try again.');
        setUploadingFiles(false);
      });
  };

  const removeAttachment = (index) => {
    setFormData(prev => {
      const attachment = prev.attachments[index];
      // Clean up object URLs to prevent memory leaks
      if (attachment.previewUrl) {
        URL.revokeObjectURL(attachment.previewUrl);
      }
      if (attachment.url) {
        URL.revokeObjectURL(attachment.url);
      }
      return {
        ...prev,
        attachments: prev.attachments.filter((_, i) => i !== index)
      };
    });
  };

  // Link management
  const handleAddLink = () => {
    if (!newLink.title.trim() || !newLink.url.trim()) {
      setError('Title and URL are required for links');
      return;
    }

    // Validate URL
    try {
      new URL(newLink.url);
    } catch (error) {
      setError('Please enter a valid URL');
      return;
    }

    const link = {
      ...newLink,
      title: newLink.title.trim(),
      url: newLink.url.trim(),
      description: newLink.description.trim(),
      createdAt: new Date()
    };

    setFormData(prev => ({
      ...prev,
      links: [...prev.links, link]
    }));

    // Reset form
    setNewLink({
      title: '',
      url: '',
      description: '',
      type: 'other'
    });
    setError(null);
  };

  const removeLink = (index) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return <FileImage className="h-4 w-4" />;
    if (mimeType.startsWith('video/')) return <FileVideo className="h-4 w-4" />;
    if (mimeType.startsWith('audio/')) return <FileAudio className="h-4 w-4" />;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return <FileArchive className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Cleanup object URLs on component unmount
  useEffect(() => {
    return () => {
      formData.attachments.forEach(attachment => {
        if (attachment.previewUrl) {
          URL.revokeObjectURL(attachment.previewUrl);
        }
        if (attachment.url) {
          URL.revokeObjectURL(attachment.url);
        }
      });
    };
  }, []);

  const resetForm = () => {
    // Clean up object URLs before resetting
    formData.attachments.forEach(attachment => {
      if (attachment.previewUrl) {
        URL.revokeObjectURL(attachment.previewUrl);
      }
      if (attachment.url) {
        URL.revokeObjectURL(attachment.url);
      }
    });
    
    setFormData({
      type: 'Individual',
      name: '',
      email: '',
      phone: '',
      address: { street: '', city: '', state: '', country: '', postalCode: '' },
      companyName: '',
      companyWebsite: '',
      industry: '',
      status: 'Lead',
      tags: [],
      lastContacted: '',
      notes: '',
      attachments: [],
      links: []
    });
    setNewLink({
      title: '',
      url: '',
      description: '',
      type: 'other'
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);

      // Client-side validation to match backend requirements
      if (!formData.name.trim()) {
        setError('Full name is required');
        return;
      }

      if (formData.name.trim().length > 100) {
        setError('Client name cannot exceed 100 characters');
        return;
      }

      if (!formData.email.trim()) {
        setError('Email is required');
        return;
      }

      // Email validation to match backend regex
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setError('Please enter a valid email address');
        return;
      }

      // Validate company fields if type is Company
      if (formData.type === 'Company' && !formData.companyName.trim()) {
        setError('Company name is required for company clients');
        return;
      }

      if (formData.type === 'Company' && formData.companyName.trim().length > 100) {
        setError('Company name cannot exceed 100 characters');
        return;
      }

      // Prepare data for API
      const clientData = {
        ...formData,
        // Remove empty address fields
        address: Object.fromEntries(
          Object.entries(formData.address).filter(([_, value]) => value && value.trim() !== '')
        ),
        // Remove empty company fields if type is Individual
        ...(formData.type === 'Individual' && {
          companyName: undefined,
          companyWebsite: undefined,
          industry: undefined
        }),
        // Handle notes field properly - backend expects array of objects
        notes: (typeof formData.notes === 'string' && formData.notes.trim()) ? 
          [{ content: formData.notes.trim(), createdAt: new Date() }] : []
      };

      await onSubmit(clientData);
      
      // Close modal and reset form
      onClose();
      resetForm();
      
      // Notify parent component that client was created
      if (onClientCreated) {
        onClientCreated();
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create client. Please try again.');
      console.error('Error creating client:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle client type change and reset company fields if switching to Individual
  const handleClientTypeChange = (newType) => {
    handleInputChange('type', newType);
    
    // Reset company fields if switching to Individual
    if (newType === 'Individual') {
      setFormData(prev => ({
        ...prev,
        companyName: '',
        companyWebsite: '',
        industry: ''
      }));
    }
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200">
        {/* iOS Style Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Add New Client</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[60vh]">
          <div className="p-6 space-y-8">
            {/* Client Type Section - iOS Style */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Client Type</h3>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Client Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleClientTypeChange('Individual')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      formData.type === 'Individual'
                        ? 'border-gray-800 bg-gray-800 text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <User className="h-6 w-6 mx-auto mb-2" />
                      <div className="font-medium">Individual</div>
                      <div className="text-xs opacity-75">Personal client</div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleClientTypeChange('Company')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      formData.type === 'Company'
                        ? 'border-gray-800 bg-gray-800 text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <Building2 className="h-6 w-6 mx-auto mb-2" />
                      <div className="font-medium">Company</div>
                      <div className="text-xs opacity-75">Business client</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {/* Address Section */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Address (Optional)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => handleInputChange('address.street', e.target.value)}
                      className="md:col-span-2 w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                      placeholder="Street Address"
                    />
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => handleInputChange('address.city', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                      placeholder="City"
                    />
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) => handleInputChange('address.state', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                      placeholder="State/Province"
                    />
                    <input
                      type="text"
                      value={formData.address.country}
                      onChange={(e) => handleInputChange('address.country', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                      placeholder="Country"
                    />
                    <input
                      type="text"
                      value={formData.address.postalCode}
                      onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                      placeholder="Postal Code"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Company Details Section - Conditional with iOS Animation */}
            <div className={`space-y-4 transition-all duration-500 ease-out ${
              formData.type === 'Company' 
                ? 'opacity-100 max-h-screen translate-y-0' 
                : 'opacity-0 max-h-0 overflow-hidden -translate-y-4'
            }`}>
              {formData.type === 'Company' && (
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Company Details</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                        placeholder="Official business name"
                        required={formData.type === 'Company'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Website
                      </label>
                      <input
                        type="url"
                        value={formData.companyWebsite}
                        onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                        placeholder="https://company.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Industry
                      </label>
                      <select
                        value={formData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                      >
                        <option value="">Select Industry</option>
                        
                        {/* Creative & Freelance Services */}
                        <optgroup label="🎨 Creative & Freelance Services" className="font-semibold text-gray-800 bg-gray-50">
                          <option value="Graphic Design" className="pl-4">Graphic Design</option>
                          <option value="Photography" className="pl-4">Photography</option>
                          <option value="Copywriting" className="pl-4">Copywriting</option>
                          <option value="Video Editing" className="pl-4">Video Editing</option>
                          <option value="Voiceover" className="pl-4">Voiceover</option>
                        </optgroup>
                        
                        {/* Coaching & Consulting */}
                        <optgroup label="🎯 Coaching & Consulting" className="font-semibold text-gray-800 bg-gray-50">
                          <option value="Life Coaching" className="pl-4">Life Coaching</option>
                          <option value="Business Consulting" className="pl-4">Business Consulting</option>
                          <option value="Academic Tutoring" className="pl-4">Academic Tutoring</option>
                          <option value="Fitness Coaching" className="pl-4">Fitness Coaching</option>
                        </optgroup>
                        
                        {/* Local & Artisan Businesses */}
                        <optgroup label="🏪 Local & Artisan Businesses" className="font-semibold text-gray-800 bg-gray-50">
                          <option value="Bakeries" className="pl-4">Bakeries</option>
                          <option value="Event Planners" className="pl-4">Event Planners</option>
                          <option value="Florists" className="pl-4">Florists</option>
                          <option value="Home-based Artisans" className="pl-4">Home-based Artisans</option>
                        </optgroup>
                        
                        {/* Home & Field Services */}
                        <optgroup label="🔧 Home & Field Services" className="font-semibold text-gray-800 bg-gray-50">
                          <option value="Handyman Services" className="pl-4">Handyman Services</option>
                          <option value="Interior Designers" className="pl-4">Interior Designers</option>
                          <option value="Pet Groomers" className="pl-4">Pet Groomers</option>
                          <option value="Cleaners" className="pl-4">Cleaners</option>
                        </optgroup>
                        
                        {/* Tech & Software */}
                        <optgroup label="💻 Tech & Software" className="font-semibold text-gray-800 bg-gray-50">
                          <option value="Web Development" className="pl-4">Web Development</option>
                          <option value="UI/UX Design" className="pl-4">UI/UX Design</option>
                          <option value="App Development" className="pl-4">App Development</option>
                          <option value="SEO" className="pl-4">SEO</option>
                          <option value="Tech Copywriting" className="pl-4">Tech Copywriting</option>
                        </optgroup>
                        
                        {/* Entertainment & Content Creators */}
                        <optgroup label="🎭 Entertainment & Content Creators" className="font-semibold text-gray-800 bg-gray-50">
                          <option value="Influencers" className="pl-4">Influencers</option>
                          <option value="Streamers" className="pl-4">Streamers</option>
                          <option value="YouTubers" className="pl-4">YouTubers</option>
                          <option value="Musicians" className="pl-4">Musicians</option>
                        </optgroup>
                        
                        {/* Boutique Retail & E-Commerce */}
                        <optgroup label="🛍️ Boutique Retail & E-Commerce" className="font-semibold text-gray-800 bg-gray-50">
                          <option value="Fashion Stylists" className="pl-4">Fashion Stylists</option>
                          <option value="Jewelry Designers" className="pl-4">Jewelry Designers</option>
                          <option value="Personal Shoppers" className="pl-4">Personal Shoppers</option>
                        </optgroup>
                        
                        {/* Media & Content Agencies */}
                        <optgroup label="📱 Media & Content Agencies" className="font-semibold text-gray-800 bg-gray-50">
                          <option value="Social Media Management" className="pl-4">Social Media Management</option>
                          <option value="Marketing" className="pl-4">Marketing</option>
                          <option value="Brand Strategy" className="pl-4">Brand Strategy</option>
                        </optgroup>
                        
                        {/* Financial & Legal Freelancers */}
                        <optgroup label="💰 Financial & Legal Freelancers" className="font-semibold text-gray-800 bg-gray-50">
                          <option value="Freelance Accountants" className="pl-4">Freelance Accountants</option>
                          <option value="Legal Consultants" className="pl-4">Legal Consultants</option>
                          <option value="Bookkeepers" className="pl-4">Bookkeepers</option>
                        </optgroup>
                        
                        {/* Other */}
                        <optgroup label="📋 Other" className="font-semibold text-gray-800 bg-gray-50">
                          <option value="Other" className="pl-4">Other</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CRM Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Tag className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">CRM Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                  >
                    <option value="Lead">🎯 Lead</option>
                    <option value="Active">✅ Active</option>
                    <option value="Inactive">❌ Inactive</option>
                    <option value="Archived">📁 Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Contacted
                  </label>
                  <input
                    type="date"
                    value={formData.lastContacted}
                    onChange={(e) => handleInputChange('lastContacted', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tags
                </label>
                
                {/* Tag Input Container */}
                <div className="relative">
                  <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-gray-500 focus-within:border-gray-500 transition-all">
                    <Tag className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <input
                      type="text"
                      onKeyPress={handleTagInput}
                      className="flex-1 border-none outline-none bg-transparent text-gray-900 placeholder:text-gray-400 text-sm"
                      placeholder="Type a tag and press Enter, or select from suggestions below"
                    />
                  </div>
                  
                  {/* Quick Tag Suggestions */}
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2 font-medium">Quick Add:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'VIP', label: '⭐ VIP', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
                        { value: 'high-budget', label: '💰 High Budget', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
                        { value: 'retainer', label: '📋 Retainer', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
                        { value: 'urgent', label: '⚡ Urgent', color: 'bg-red-100 text-red-800 hover:bg-red-200' },
                        { value: 'weekly client', label: '📅 Weekly', color: 'bg-purple-100 text-purple-800 hover:bg-purple-200' },
                        { value: 'seasonal', label: '🌱 Seasonal', color: 'bg-orange-100 text-orange-800 hover:bg-orange-200' }
                      ].map((tag) => (
                        <button
                          key={tag.value}
                          type="button"
                          onClick={() => {
                            if (!formData.tags.includes(tag.value)) {
                              setFormData(prev => ({
                                ...prev,
                                tags: [...prev.tags, tag.value]
                              }));
                            }
                          }}
                          disabled={formData.tags.includes(tag.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                            formData.tags.includes(tag.value)
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : `${tag.color} cursor-pointer hover:scale-105 active:scale-95`
                          }`}
                        >
                          {tag.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Display Selected Tags */}
                {formData.tags.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">Selected Tags ({formData.tags.length})</p>
                      {formData.tags.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, tags: [] }))}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${
                            tag === 'VIP' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                            tag === 'high-budget' ? 'bg-green-100 text-green-800 border border-green-200' :
                            tag === 'retainer' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            tag === 'low-maintenance' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
                            tag === 'urgent' ? 'bg-red-100 text-red-800 border border-red-200' :
                            tag === 'weekly client' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                            tag === 'quarterly review' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                            tag === 'seasonal' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                            'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            {tag === 'VIP' ? '⭐' : 
                             tag === 'high-budget' ? '💰' :
                             tag === 'retainer' ? '📋' :
                             tag === 'low-maintenance' ? '🔧' :
                             tag === 'urgent' ? '⚡' :
                             tag === 'weekly client' ? '📅' :
                             tag === 'quarterly review' ? '📊' :
                             tag === 'seasonal' ? '🌱' : ''} 
                            {tag}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-1 transition-colors group"
                            title="Remove tag"
                          >
                            <X className="h-3 w-3 group-hover:scale-110 transition-transform" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Help Text */}
                <p className="mt-2 text-xs text-gray-500">
                  Tags help you organize and quickly identify client characteristics. Use them to mark priority levels, project types, or special requirements.
                </p>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <FileTextIcon className="h-4 w-4 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Notes & Details</h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all h-32 resize-none"
                  placeholder="Add important context, tone, or relationship details..."
                />
              </div>
            </div>

            {/* Attachments & Links Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Link className="h-4 w-4 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Attachments & Links</h3>
              </div>
              
              {/* File Upload Section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attach Files
                  </label>
                  <div 
                    className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-gray-300 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.zip,.rar"
                    />
                    {uploadingFiles ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        <span className="text-gray-600">Uploading files...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 mb-3 font-medium">Upload briefs, contracts, or other documents</p>
                        <p className="text-sm text-gray-500 mb-3">Click to browse or drag files here</p>
                        <button
                          type="button"
                          className="px-6 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all font-medium"
                        >
                          Choose Files
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Display Uploaded Files */}
                {formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Uploaded Files ({formData.attachments.length})</h4>
                    <div className="space-y-2">
                      {formData.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            {/* Image Preview */}
                            {attachment.previewUrl ? (
                              <div className="relative">
                                <img
                                  src={attachment.previewUrl}
                                  alt={attachment.originalName}
                                  className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                />
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center">
                                  {getFileIcon(attachment.mimeType)}
                                </div>
                              </div>
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                {getFileIcon(attachment.mimeType)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{attachment.originalName}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                              {attachment.previewUrl && (
                                <p className="text-xs text-blue-600 font-medium">Image Preview</p>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="p-1 hover:bg-red-100 rounded-full transition-colors ml-2"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Links Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    External Links
                  </label>
                  <button
                    type="button"
                    onClick={() => setAddingLink(!addingLink)}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    Add Link
                  </button>
                </div>

                {/* Add Link Form */}
                {addingLink && (
                  <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={newLink.title}
                        onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Link title"
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                      />
                      <select
                        value={newLink.type}
                        onChange={(e) => setNewLink(prev => ({ ...prev, type: e.target.value }))}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        <option value="project">📁 Project</option>
                        <option value="contract">📄 Contract</option>
                        <option value="brief">📋 Brief</option>
                        <option value="reference">🔗 Reference</option>
                        <option value="social">📱 Social Media</option>
                        <option value="other">🔗 Other</option>
                      </select>
                    </div>
                    <input
                      type="url"
                      value={newLink.url}
                      onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                    <input
                      type="text"
                      value={newLink.description}
                      onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description (optional)"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddLink}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                      >
                        Add Link
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAddingLink(false);
                          setNewLink({ title: '', url: '', description: '', type: 'other' });
                        }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Display Links */}
                {formData.links.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Added Links ({formData.links.length})</h4>
                    <div className="space-y-2">
                      {formData.links.map((link, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <ExternalLink className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{link.title}</p>
                              <p className="text-xs text-gray-500">{link.url}</p>
                              {link.description && (
                                <p className="text-xs text-gray-600 mt-1">{link.description}</p>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLink(index)}
                            className="p-1 hover:bg-red-100 rounded-full transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* iOS Style Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-sm text-gray-600 font-medium">
                {formData.type === 'Individual' ? 'Individual Client' : 'Company Client'}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="px-6 py-2 text-gray-700 font-medium hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Save Client
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddClientModal; 