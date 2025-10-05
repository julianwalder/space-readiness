'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Mail, Home, Search } from 'lucide-react';

export default function FakeWordPressCatchAll() {
  const [showMessage, setShowMessage] = useState(false);
  const [hackerIP, setHackerIP] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    setHackerIP('192.168.1.100');
    
    const timer = setTimeout(() => {
      setShowMessage(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const messages = [
    "WordPress path detected! This is Next.js! 🚀",
    "Looking for WordPress? You found the fake one! 🎭",
    "This isn't WordPress, it's a React app! ⚛️",
    "Wrong path, buddy! This is Next.js! 🔥",
    "WordPress? More like 'WordConfusion'! 😵",
    "You found the fake WordPress! 🎪",
    "This is a Next.js app, not WordPress! 🎯",
    "WordPress? We don't do that here! 🚫",
    "Nice try, but this is React! ⚡",
    "WordPress path? How about React path instead? 🎨"
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  // Extract the attempted path
  const attemptedPath = pathname.replace('/[...wordpress]', '');

  if (!showMessage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading WordPress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="shadow-lg">
          <CardHeader className="text-center bg-purple-50 border-b">
            <div className="flex justify-center mb-4">
              <Shield className="h-16 w-16 text-purple-500" />
            </div>
            <CardTitle className="text-2xl text-purple-600">
              🎪 Fake WordPress Path Detected!
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
              <div className="bg-pink-50 p-4 rounded-lg">
                <h3 className="font-semibold text-pink-800 mb-2">
                  <Search className="inline h-5 w-5 mr-2" />
                  You tried to access: <code className="bg-pink-200 px-2 py-1 rounded">{attemptedPath}</code>
                </h3>
                <p className="text-pink-700">
                  That&apos;s a WordPress-style path, but you&apos;re in a Next.js application! 
                  It&apos;s like trying to use a Windows command in a Mac terminal! 🖥️
                </p>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="font-semibold text-amber-800 mb-2">
                  🎯 What you were looking for:
                </h4>
                <ul className="text-amber-700 text-sm space-y-1">
                  <li>• WordPress admin panel</li>
                  <li>• PHP-based backend</li>
                  <li>• MySQL database access</li>
                  <li>• WordPress vulnerabilities</li>
                  <li>• wp-admin functionality</li>
                </ul>
              </div>

              <div className="bg-sky-50 p-4 rounded-lg">
                <h4 className="font-semibold text-sky-800 mb-2">
                  🚀 What you actually found:
                </h4>
                <ul className="text-sky-700 text-sm space-y-1">
                  <li>• Next.js application</li>
                  <li>• React-based frontend</li>
                  <li>• TypeScript code</li>
                  <li>• Modern web technologies</li>
                  <li>• A fake WordPress interface</li>
                  <li>• A friendly developer 😄</li>
                </ul>
              </div>

              <div className="bg-rose-50 p-4 rounded-lg">
                <h4 className="font-semibold text-rose-800 mb-2">
                  💡 Want to learn modern web development?
                </h4>
                <p className="text-rose-700 text-sm">
                  This application is built with cutting-edge technologies: Next.js, React, TypeScript, 
                  and Tailwind CSS. Instead of trying to hack WordPress, why not learn to build 
                  something amazing? The future of web development is in these modern frameworks! 🌟
                </p>
              </div>

              <div className="bg-lime-50 p-4 rounded-lg">
                <h4 className="font-semibold text-lime-800 mb-2">
                  🎓 Learning Resources:
                </h4>
                <ul className="text-lime-700 text-sm space-y-1">
                  <li>• Next.js Documentation</li>
                  <li>• React Learning Path</li>
                  <li>• TypeScript Handbook</li>
                  <li>• Tailwind CSS Guide</li>
                  <li>• Modern JavaScript ES6+</li>
                </ul>
              </div>

              <div className="flex gap-4 justify-center pt-4">
                <Button 
                  onClick={() => window.location.href = 'mailto:julian@swissaerospace.ventures?subject=Hello from a curious visitor&body=Hi! I found your fake WordPress interface and thought it was pretty clever. Mind if we chat?'}
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
                <p>Attempted path: {attemptedPath}</p>
                <p>Framework: Next.js 15.5.4 | Powered by React & TypeScript</p>
                <p>This is a fake WordPress interface for security purposes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
