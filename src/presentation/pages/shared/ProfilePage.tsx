import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/application/hooks/useAuth';
import { User, Mail, Phone, Shield, Save } from 'lucide-react';

export function ProfilePage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'super_admin': return 'Super Admin';
      case 'institute_manager': return 'Institute Manager';
      case 'teacher': return 'Teacher';
      case 'student': return 'Student';
      case 'parent': return 'Parent';
      default: return 'User';
    }
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'super_admin': return 'bg-red-100 text-red-700';
      case 'institute_manager': return 'bg-blue-100 text-blue-700';
      case 'teacher': return 'bg-green-100 text-green-700';
      case 'student': return 'bg-purple-100 text-purple-700';
      case 'parent': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div><h2 className="text-2xl font-bold text-gray-900">Profile</h2><p className="text-sm text-gray-500 mt-1">Manage your account settings</p></div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl">{user?.full_name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{user?.full_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getRoleColor()}>{getRoleLabel()}</Badge>
                <span className="text-sm text-gray-500">{user?.email}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5 text-blue-600" />Personal Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Full Name</Label><Input value={user?.full_name || ''} readOnly className="bg-gray-50" /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={user?.email || ''} readOnly className="bg-gray-50" /></div>
          </div>
          <div className="space-y-2"><Label>Phone</Label><Input placeholder="Add phone number" /></div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5 text-green-600" />Security</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Current Password</Label><Input type="password" placeholder="Enter current password" /></div>
          <div className="space-y-2"><Label>New Password</Label><Input type="password" placeholder="Enter new password" /></div>
          <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" placeholder="Confirm new password" /></div>
          <Button className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
            {saving ? 'Saving...' : <><Save className="mr-2 h-4 w-4" />Change Password</>}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
