'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AccountSettings() {
    const [email, setEmail] = useState('user@example.com');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEmailChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // TODO: API call
        setTimeout(() => setLoading(false), 1000);
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        setLoading(true);
        // TODO: API call
        setTimeout(() => setLoading(false), 1000);
    };

    return (
        <div className="space-y-6">
            <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-lg font-semibold mb-4">Email Address</h3>
                <form onSubmit={handleEmailChange} className="space-y-4">
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                    />
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Email'}
                    </Button>
                </form>
            </div>

            <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Current password"
                    />
                    <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password"
                    />
                    <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                    />
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Changing...' : 'Change Password'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
