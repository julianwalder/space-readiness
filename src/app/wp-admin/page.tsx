'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Smile, Mail, Home } from 'lucide-react';

export default function FakeWordPressAdmin() {
  const [showMessage, setShowMessage] = useState(false);
  const [hackerIP, setHackerIP] = useState('');

  useEffect(() => {
    // Simulate getting IP
    setHackerIP('192.168.1.100');
    
    // Show the message after a short delay
    const timer = setTimeout(() => {
      setShowMessage(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const messages = [
    "WordPress admin? This is Next.js territory! 🚀",
    "Looking for wp-admin? You found the fake one! 🎭",
    "This isn't WordPress, it's a React app! ⚛️",
    "Wrong CMS, buddy! This is Next.js! 🔥",
    "WordPress admin? More like 'admin of confusion'! 😵",
    "You found the fake WordPress admin! 🎪",
    "This is a Next.js app, not WordPress! 🎯",
    "WordPress? We don't do that here! 🚫",
    "Nice try, but this is React! ⚡",
    "WordPress admin? How about React admin instead? 🎨"
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  if (!showMessage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading WordPress admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="shadow-lg">
          <CardHeader className="text-center bg-orange-50 border-b">
            <div className="flex justify-center mb-4">
              <Shield className="h-16 w-16 text-orange-500" />
            </div>
            <CardTitle className="text-2xl text-orange-600">
              🎪 Fake WordPress Admin
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
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">
                  <Smile className="inline h-5 w-5 mr-2" />
                  Welcome to the fake WordPress admin!
                </h3>
                <p className="text-purple-700">
                  You're looking for WordPress, but you found a Next.js application instead. 
                  That's like ordering pizza and getting sushi! 🍣
                </p>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-semibold text-indigo-800 mb-2">
                  🎯 What you were looking for vs. what you found:
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-red-600">
                    <strong>You wanted:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• WordPress admin</li>
                      <li>• PHP backend</li>
                      <li>• MySQL database</li>
                      <li>• wp-admin access</li>
                    </ul>
                  </div>
                  <div className="text-green-600">
                    <strong>You found:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Next.js app</li>
                      <li>• React frontend</li>
                      <li>• TypeScript code</li>
                      <li>• Fake admin page</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-teal-50 p-4 rounded-lg">
                <h4 className="font-semibold text-teal-800 mb-2">
                  🚀 Want to learn modern web development?
                </h4>
                <p className="text-teal-700 text-sm">
                  This application is built with cutting-edge technologies: Next.js, React, TypeScript, 
                  and Tailwind CSS. Much more exciting than WordPress! 
                  Why not learn to build something amazing instead of trying to hack? 💡
                </p>
              </div>

              <div className="flex gap-4 justify-center pt-4">
                <Button 
                  onClick={() => window.location.href = 'mailto:julian@swissaerospace.ventures?subject=Hello from a curious visitor&body=Hi! I found your fake WordPress admin and thought it was pretty clever. Mind if we chat?'}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Developer
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Real App
                </Button>
              </div>

              <div className="text-xs text-gray-500 mt-6">
                <p>IP: {hackerIP} | Time: {new Date().toLocaleString()}</p>
                <p>Framework: Next.js 15.5.4 | Powered by React & TypeScript</p>
                <p>This is a fake WordPress admin interface for security purposes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
