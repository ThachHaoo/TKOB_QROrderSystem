'use client';

import React from 'react';
import { useTenantProfileController } from '../../hooks';
import {
  TenantBasicInfoSection,
  TenantMediaSection,
  TenantLocalizationSection,
  TenantAppearanceSection,
  TenantOpeningHoursSection,
  TenantPaymentsSection,
  TenantPromotionsSection,
} from '../components/sections';
import { SubscriptionSettingsPage } from './SubscriptionSettingsPage';
import type { TenantProfileTab } from '../../model';


export function TenantProfilePage() {
  const controller = useTenantProfileController();

  const tabLabels: Record<TenantProfileTab, string> = {
    profile: 'Hồ sơ',
    hours: 'Giờ mở cửa',
    payments: 'Thanh toán',
    promotions: 'Mã giảm giá',
    subscription: 'Gói dịch vụ',
  };

  return (
    <div className="flex flex-col gap-6 px-6 pt-6 pb-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-text-primary">Cài đặt nhà hàng</h1>
        <p className="text-text-secondary text-sm">Quản lý thông tin và cài đặt nhà hàng của bạn</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-default">
        <div className="flex gap-2 overflow-x-auto">
          {(['profile', 'hours', 'payments', 'promotions', 'subscription'] as TenantProfileTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => controller.setActiveTab(tab)}
              className={`px-4 py-3 relative text-sm font-semibold transition-colors whitespace-nowrap ${
                controller.activeTab === tab ? 'text-accent-500' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tabLabels[tab]}
              {controller.activeTab === tab && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-accent-500" />}
            </button>
          ))}
        </div>
      </div>

      {/* Profile Tab */}
      {controller.activeTab === 'profile' && (
        <div className="flex flex-col gap-6">
          <TenantBasicInfoSection
            restaurantName={controller.restaurantName}
            urlSlug={controller.urlSlug}
            address={controller.address}
            phone={controller.phone}
            email={controller.email}
            description={controller.description}
            onRestaurantNameChange={controller.setRestaurantName}
            onUrlSlugChange={controller.setUrlSlug}
            onAddressChange={controller.setAddress}
            onPhoneChange={controller.setPhone}
            onEmailChange={controller.setEmail}
            onDescriptionChange={controller.setDescription}
            onSave={controller.handleSaveProfile}
          />

          <TenantMediaSection
            slugPreview={controller.slugPreview}
            coverUploaded={controller.coverUploaded}
          />

          <TenantLocalizationSection
            defaultLanguage={controller.defaultLanguage}
            timezone={controller.timezone}
            onDefaultLanguageChange={controller.setDefaultLanguage}
            onTimezoneChange={controller.setTimezone}
          />

          <TenantAppearanceSection
            theme={controller.theme}
            onThemeChange={controller.setTheme}
          />
        </div>
      )}

      {/* Hours Tab */}
      {controller.activeTab === 'hours' && (
        <TenantOpeningHoursSection
          openingHours={controller.openingHours}
          sourceDay={controller.sourceDay}
          onSourceDayChange={controller.setSourceDay}
          onHoursChange={controller.setOpeningHours}
          onCopyToAll={controller.handleCopyHoursToAll}
          onSave={controller.handleSaveHours}
        />
      )}

      {/* Payments Tab */}
      {controller.activeTab === 'payments' && (
        <TenantPaymentsSection />
      )}

      {/* Promotions Tab */}
      {controller.activeTab === 'promotions' && (
        <TenantPromotionsSection />
      )}

      {/* Subscription Tab */}
      {controller.activeTab === 'subscription' && (
        <SubscriptionSettingsPage />
      )}
    </div>
  );
}
