'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Smile, Mail } from 'lucide-react';

export default function FakeWordPressSetup() {
  const [showMessage, setShowMessage] = useState(false);
  const [hackerIP, setHackerIP] = useState('');

  useEffect(() => {
    // Simulate getting IP (in real implementation, you'd get this from headers)
    setHackerIP('192.168.1.100');
    
    // Show the message after a short delay to make it look more realistic
    const timer = setTimeout(() => {
      setShowMessage(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const messages = [
    "Nice try! 🕵️‍♂️ But this isn't WordPress...",
    "Looking for WordPress? You're in the wrong neighborhood! 🏠",
    "This is a Next.js app, not WordPress. Better luck next time! 🚀",
    "WordPress? We don't do that here. 😄",
    "Hacker detected! 🚨 But don't worry, we're friendly here.",
    "Wrong framework, buddy! This is React territory. ⚛️",
    "WordPress admin? More like 'admin of disappointment'! 😂",
    "You found the fake WordPress! 🎭 Congratulations!",
    "This isn't the WordPress you're looking for. 👋",
    "WordPress setup? How about we setup a coffee instead? ☕"
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  if (!showMessage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading WordPress setup...</p>
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
              🎭 Fake WordPress Detected!
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
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">
                  <Smile className="inline h-5 w-5 mr-2" />
                  Hey there, curious visitor!
                </h3>
                <p className="text-blue-700">
                  You're trying to access WordPress admin on a Next.js application. 
                  That's like trying to use a screwdriver as a hammer! 🔨
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  📊 Your "Hacker" Stats:
                </h4>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• Attempted WordPress access: ✅</li>
                  <li>• Found fake interface: ✅</li>
                  <li>• Technical skills: Needs improvement 📈</li>
                  <li>• Persistence level: Admirable! 💪</li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">
                  💡 Want to learn proper web development?
                </h4>
                <p className="text-green-700 text-sm">
                  Instead of trying to hack WordPress, why not learn to build amazing applications? 
                  This site is built with Next.js, React, and TypeScript - much cooler than WordPress! 🚀
                </p>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={() => window.location.href = 'mailto:julian@swissaerospace.ventures?subject=Hello from a curious visitor&body=Hi! I found your fake WordPress interface and thought it was pretty clever. Mind if we chat?'}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact the Developer
                </Button>
              </div>

              <div className="text-xs text-gray-500 mt-6">
                <p>IP: {hackerIP} | Time: {new Date().toLocaleString()}</p>
                <p>Framework: Next.js 15.5.4 | Powered by React & TypeScript</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
