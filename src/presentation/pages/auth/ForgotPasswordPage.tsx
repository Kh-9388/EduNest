import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { School, ArrowLeft, CheckCircle } from 'lucide-react';
import { APP_NAME } from '@/domain/constants';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
            <School className="h-9 w-9 text-white" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">{APP_NAME}</h1>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold">Reset Password</CardTitle>
            <CardDescription>Enter your email to receive reset instructions</CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="flex flex-col items-center py-6 text-center">
                <CheckCircle className="mb-3 h-12 w-12 text-green-500" />
                <h3 className="text-lg font-medium text-gray-900">Check your email</h3>
                <p className="mt-1 text-sm text-gray-500">
                  We've sent password reset instructions to {email}
                </p>
                <Link to="/login" className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-500">
                  Back to login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                    required
                  />
                </div>
                <Button type="submit" className="h-11 w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
