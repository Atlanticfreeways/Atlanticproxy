'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountSettings } from './components/AccountSettings';
import { PreferencesSettings } from './components/PreferencesSettings';
import { SecuritySettings } from './components/SecuritySettings';

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Settings</h1>

            <Tabs defaultValue="account" className="w-full">
                <TabsList>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="preferences">Preferences</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
                <TabsContent value="account" className="mt-6">
                    <AccountSettings />
                </TabsContent>
                <TabsContent value="preferences" className="mt-6">
                    <PreferencesSettings />
                </TabsContent>
                <TabsContent value="security" className="mt-6">
                    <SecuritySettings />
                </TabsContent>
            </Tabs>
        </div>
    );
}
