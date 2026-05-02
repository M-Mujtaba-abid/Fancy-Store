"use client";

import React, { useState } from "react";
import { useGetProfile, useUpdateProfile } from "@/hooks/useAuth"; 
import { User, Mail, Shield, Camera, Edit3, X, Save, MapPin, Box, UploadCloud } from "lucide-react";
import Image from "next/image";

const ProfilePage = () => {
  const { data: profileResponse, isLoading, isError } = useGetProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // ✅ Nayi States: File aur Preview handle karne ke liye
  const [formData, setFormData] = useState({ name: "" });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const profile = profileResponse?.data;
console.log("profile => ", profile)
  const handleEditClick = () => {
    if (profile) {
      setFormData({ name: profile.name || "" });
      setAvatarFile(null);
      setAvatarPreview(profile.avatar || null); // Purani image ko preview mein dikhayein
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Image select karne ka function (Live Preview ke sath)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file)); // Image ka temporary live preview banata hai
    }
  };

  const handleSave = () => {
    // ✅ File bhejne ke liye FormData banaya
    const payload = new FormData();
    payload.append("name", formData.name);
    
    if (avatarFile) {
      payload.append("avatar", avatarFile); // Agar nayi file select ki hai toh wo jayegi
    }

    updateProfile(payload, {
      onSuccess: () => {
        setIsEditing(false); 
        setAvatarFile(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center text-center">
        <Shield size={48} className="text-red-400 mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Profile Not Found</h2>
        <p className="text-gray-500 mt-2">We could not load your profile data. Please try refreshing.</p>
      </div>
    );
  }

  // Konsi image dikhani hai? (Preview -> DB Avatar -> Fallback)
  const displayImage = isEditing && avatarPreview ? avatarPreview : profile.avatar;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-background/50 pt-4 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-text-main">My Profile</h1>
          {/* <p className="text-text-muted mt-1">Manage your personal information and security.</p> */}
        </div>

        <div 
        className="flex flex-col lg:flex-row gap-8">
          
          {/* ================= LEFT COLUMN: PROFILE SUMMARY ================= */}
          <div className="w-full lg:w-1/3">
            <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6 flex flex-col items-center text-center sticky top-24">
              
              {/* Avatar Box */}
              <div className="relative w-32 h-32 rounded-full border-4 border-background bg-primary/5 overflow-hidden shadow-md mb-4 group">
                {displayImage ? (
                  <Image
                    src={displayImage}
                    alt={profile.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary text-5xl font-bold uppercase">
                    {profile.name?.charAt(0)}
                  </div>
                )}
                
                {/* Camera Icon Overlay (Edit mode pe) */}
                {isEditing && (
                  <label className="absolute inset-0 bg-black/50 z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="text-white mb-1" size={24} />
                    <span className="text-[10px] text-white font-semibold uppercase tracking-wider">Change</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>

              <h2 className="text-xl font-bold text-text-main mb-1">{profile.name}</h2>
              <p className="text-sm text-text-muted flex items-center justify-center gap-2 mb-4">
                <Mail size={14} /> {profile.email}
              </p>

              <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                {profile.role} Account
              </span>

              <div className="w-full border-t border-border/50 pt-6 space-y-3 text-sm">
                <div className="flex items-center justify-between text-text-main p-2 hover:bg-background rounded-lg cursor-pointer transition-colors">
                  <span className="flex items-center gap-2"><Box size={16} className="text-text-muted"/> My Orders</span>
                <span className="bg-background px-2 py-0.5 rounded-md font-semibold border border-border/50">
  {profile.orderCount || 0}
</span>
                </div>
                <div className="flex items-center justify-between text-text-main p-2 hover:bg-background rounded-lg cursor-pointer transition-colors">
                  <span className="flex items-center gap-2"><MapPin size={16} className="text-text-muted"/> Shipping Addresses</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: EDIT FORM ================= */}
          <div className="w-full lg:w-2/3">
            <div className="bg-card rounded-2xl shadow-sm border border-border/50 overflow-hidden">
              
              <div className="p-6 md:p-8 border-b border-border/50 flex justify-between items-center bg-background/30">
                <h3 className="text-lg font-bold text-text-main">Personal Information</h3>
                {!isEditing && (
                  <button
                    onClick={handleEditClick}
                    className="flex items-center gap-2 text-sm font-semibold text-primary bg-primary/10 hover:bg-primary hover:text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Edit3 size={16} /> Edit Details
                  </button>
                )}
              </div>

              <div className="p-6 md:p-8 space-y-6">
                
                {/* Full Name Input */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                    <User size={14} className="text-primary" /> Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      placeholder="e.g. John Doe"
                    />
                  ) : (
                    <p className="text-base font-semibold text-text-main bg-background/50 p-3 rounded-xl border border-border/30">
                      {profile.name}
                    </p>
                  )}
                </div>

                {/* ✅ Professional File Upload Box (Only in Edit Mode) */}
                {isEditing && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                      <Camera size={14} className="text-primary" /> Profile Picture
                    </label>
                    
                    <div className="relative border-2 border-dashed border-border/80 hover:border-primary/50 bg-background/50 rounded-xl p-6 flex flex-col items-center justify-center transition-colors">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <UploadCloud size={28} className="text-text-muted mb-2" />
                      <p className="text-sm font-semibold text-text-main">
                        {avatarFile ? avatarFile.name : "Click or drag image to upload"}
                      </p>
                      <p className="text-xs text-text-muted mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                    </div>
                  </div>
                )}

                {/* Email Address (Read Only) */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                    <Mail size={14} className="text-gray-400" /> Email Address
                  </label>
                  <p className="text-base font-semibold text-text-muted bg-background/50 p-3 rounded-xl border border-border/30 cursor-not-allowed">
                    {profile.email}
                  </p>
                  {isEditing && <p className="text-[11px] text-text-muted mt-1.5 ml-1">Email address cannot be changed.</p>}
                </div>

                {/* Account Type (Read Only) */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                    <Shield size={14} className="text-gray-400" /> Account Type
                  </label>
                  <p className="text-base font-semibold text-text-muted bg-background/50 p-3 rounded-xl border border-border/30 capitalize cursor-not-allowed">
                    {profile.role}
                  </p>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="mt-8 pt-6 border-t border-border/50 flex flex-col-reverse sm:flex-row items-center gap-3 sm:justify-end animate-in fade-in duration-300">
                    <button
                      onClick={handleCancel}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-text-main border border-border hover:bg-background transition-colors"
                      disabled={isUpdating}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isUpdating}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold bg-primary text-white hover:opacity-90 shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Save size={18} /> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;