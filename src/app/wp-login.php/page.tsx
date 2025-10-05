'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, AlertTriangle, Smile, Mail, Lock } from 'lucide-react';

export default function FakeWordPressLogin() {
  const [showMessage, setShowMessage] = useState(false);
  const [hackerIP, setHackerIP] = useState('');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    setHackerIP('192.168.1.100');
    
    const timer = setTimeout(() => {
      setShowMessage(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleFakeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAttempts(prev => prev + 1);
    
    // Show different messages based on attempts
    if (attempts >= 2) {
      setShowMessage(true);
    }
  };

  const messages = [
    "WordPress login? This is Next.js! 🚀",
    "Looking for wp-login.php? You found the fake one! 🎭",
    "This isn't WordPress, it's a React app! ⚛️",
    "Wrong login page, buddy! This is Next.js! 🔥",
    "WordPress login? More like 'login of confusion'! 😵",
    "You found the fake WordPress login! 🎪",
    "This is a Next.js app, not WordPress! 🎯",
    "WordPress? We don't do that here! 🚫",
    "Nice try, but this is React! ⚡",
    "WordPress login? How about React login instead? 🎨"
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  if (!showMessage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="shadow-lg">
            <CardHeader className="text-center bg-blue-50">
              <div className="flex justify-center mb-4">
                <Lock className="h-12 w-12 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-blue-800">
                WordPress Login
              </CardTitle>
              <p className="text-blue-600">Please log in to continue</p>
            </CardHeader>
            
            <CardContent className="p-6">
              <form onSubmit={handleFakeLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username or Email</Label>
                  <Input 
                    id="username" 
                    type="text" 
                    placeholder="Enter your username"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Enter your password"
                    className="mt-1"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Log In
                </Button>
              </form>
              
              {attempts > 0 && (
                <Alert className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Invalid credentials. Attempt {attempts} of 3.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="shadow-lg">
          <CardHeader className="text-center bg-red-50 border-b">
            <div className="flex justify-center mb-4">
              <Shield className="h-16 w-16 text-red-500" />
            </div>
            <CardTitle className="text-2xl text-red-600">
              🎭 Fake WordPress Login Detected!
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-lg font-medium">
                {randomMessage}
              </AlertDescription>
            </Alert>

            <div className="space-y-4 text-center">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">
                  <Smile className="inline h-5 w-5 mr-2" />
                  You tried to login {attempts} times!
                </h3>
                <p className="text-yellow-700">
                  That&apos;s some serious dedication! But you&apos;re still in the wrong place. 
                  This is a Next.js application, not WordPress! 🎯
                </p>
              </div>

              <div className="bg-cyan-50 p-4 rounded-lg">
                <h4 className="font-semibold text-cyan-800 mb-2">
                  🔍 What you were trying to do:
                </h4>
                <ul className="text-cyan-700 text-sm space-y-1">
                  <li>• Access WordPress admin</li>
                  <li>• Login to wp-login.php</li>
                  <li>• Find a vulnerability</li>
                  <li>• Get unauthorized access</li>
                </ul>
              </div>

              <div className="bg-emerald-50 p-4 rounded-lg">
                <h4 className="font-semibold text-emerald-800 mb-2">
                  🚀 What you actually found:
                </h4>
                <ul className="text-emerald-700 text-sm space-y-1">
                  <li>• A Next.js application</li>
                  <li>• React-based frontend</li>
                  <li>• TypeScript code</li>
                  <li>• A fake login page</li>
                  <li>• A friendly developer 😄</li>
                </ul>
              </div>

              <div className="bg-violet-50 p-4 rounded-lg">
                <h4 className="font-semibold text-violet-800 mb-2">
                  💡 Pro tip for aspiring developers:
                </h4>
                <p className="text-violet-700 text-sm">
                  Instead of trying to hack WordPress, why not learn to build amazing applications? 
                  This site uses modern technologies like Next.js, React, and TypeScript. 
                  Much more exciting and rewarding than trying to break into systems! 🌟
                </p>
              </div>

              <div className="flex gap-4 justify-center pt-4">
                <Button 
                  onClick={() => window.location.href = 'mailto:julian@swissaerospace.ventures?subject=Hello from a curious visitor&body=Hi! I found your fake WordPress login and thought it was pretty clever. Mind if we chat?'}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Developer
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Smile className="h-4 w-4 mr-2" />
                  Go to Real App
                </Button>
              </div>

              <div className="text-xs text-gray-500 mt-6">
                <p>IP: {hackerIP} | Time: {new Date().toLocaleString()}</p>
                <p>Framework: Next.js 15.5.4 | Powered by React & TypeScript</p>
                <p>Login attempts: {attempts} | This is a fake WordPress login for security purposes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
