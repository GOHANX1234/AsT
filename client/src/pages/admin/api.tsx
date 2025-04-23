import AdminLayout from "@/layouts/admin-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Copy, Check, Code, Webhook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminApi() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  
  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-2 mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">API Documentation</h2>
        <p className="text-muted-foreground text-sm">Integration guide for verifying license keys</p>
      </div>
      
      <div className="grid gap-6">
        <Card className="overflow-hidden border border-purple-500/20 shadow-lg shadow-purple-500/5">
          <CardHeader className="px-6 py-4 border-b border-border bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent flex items-center">
                <Webhook className="h-4 w-4 mr-2 text-purple-400" /> Key Verification Endpoint
              </CardTitle>
              <div className="text-xs text-muted-foreground rounded-full bg-muted px-2 py-1">
                POST /api/verify
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <Tabs defaultValue="request" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="request">Request</TabsTrigger>
                <TabsTrigger value="response">Response</TabsTrigger>
              </TabsList>
              <TabsContent value="request" className="space-y-4">
                <div className="relative bg-muted/40 p-4 rounded-md">
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 h-8 bg-muted/80"
                    onClick={() => copyToClipboard(`POST /api/verify
Content-Type: application/json

{
  "key": "YOUR_LICENSE_KEY",
  "deviceId": "UNIQUE_DEVICE_IDENTIFIER",
  "game": "GAME_NAME"
}`, "request")}
                  >
                    {copiedSection === "request" ? (
                      <>
                        <Check className="h-3.5 w-3.5 mr-1 text-green-500" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                      </>
                    )}
                  </Button>
                  <pre className="font-mono text-sm overflow-x-auto whitespace-pre-wrap">
{`POST /api/verify
Content-Type: application/json

{
  "key": "YOUR_LICENSE_KEY",
  "deviceId": "UNIQUE_DEVICE_IDENTIFIER",
  "game": "GAME_NAME"
}`}
                  </pre>
                </div>
                <div className="bg-purple-900/10 rounded-md p-4 space-y-2 border border-purple-500/20">
                  <h4 className="text-sm font-semibold text-purple-400">Request Parameters</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex">
                      <span className="font-mono text-xs bg-purple-900/20 px-1.5 rounded text-purple-400 self-start mt-0.5 mr-2">key</span>
                      <span>Your license key string</span>
                    </li>
                    <li className="flex">
                      <span className="font-mono text-xs bg-purple-900/20 px-1.5 rounded text-purple-400 self-start mt-0.5 mr-2">deviceId</span>
                      <span>Unique identifier for the device (such as HWID or device fingerprint)</span>
                    </li>
                    <li className="flex">
                      <span className="font-mono text-xs bg-purple-900/20 px-1.5 rounded text-purple-400 self-start mt-0.5 mr-2">game</span>
                      <span>Game name (PUBG MOBILE, LAST ISLAND OF SURVIVAL, STANDOFF2)</span>
                    </li>
                  </ul>
                </div>
              </TabsContent>
              <TabsContent value="response" className="space-y-4">
                <div className="relative bg-muted/40 p-4 rounded-md">
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 h-8 bg-muted/80"
                    onClick={() => copyToClipboard(`{
  "valid": true,
  "expiry": "2025-12-31",
  "deviceLimit": 2,
  "currentDevices": 1,
  "message": "License valid"
}`, "response")}
                  >
                    {copiedSection === "response" ? (
                      <>
                        <Check className="h-3.5 w-3.5 mr-1 text-green-500" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                      </>
                    )}
                  </Button>
                  <pre className="font-mono text-sm overflow-x-auto whitespace-pre-wrap">
{`{
  "valid": true,
  "expiry": "2025-12-31",
  "deviceLimit": 2,
  "currentDevices": 1,
  "message": "License valid"
}`}
                  </pre>
                </div>
                <div className="bg-purple-900/10 rounded-md p-4 space-y-2 border border-purple-500/20">
                  <h4 className="text-sm font-semibold text-purple-400">Response Fields</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex">
                      <span className="font-mono text-xs bg-purple-900/20 px-1.5 rounded text-purple-400 self-start mt-0.5 mr-2">valid</span>
                      <span>Boolean indicating if the license is valid and active</span>
                    </li>
                    <li className="flex">
                      <span className="font-mono text-xs bg-purple-900/20 px-1.5 rounded text-purple-400 self-start mt-0.5 mr-2">expiry</span>
                      <span>Expiration date of the license in ISO format</span>
                    </li>
                    <li className="flex">
                      <span className="font-mono text-xs bg-purple-900/20 px-1.5 rounded text-purple-400 self-start mt-0.5 mr-2">deviceLimit</span>
                      <span>Maximum number of devices allowed for this key</span>
                    </li>
                    <li className="flex">
                      <span className="font-mono text-xs bg-purple-900/20 px-1.5 rounded text-purple-400 self-start mt-0.5 mr-2">currentDevices</span>
                      <span>Current number of devices registered to this key</span>
                    </li>
                    <li className="flex">
                      <span className="font-mono text-xs bg-purple-900/20 px-1.5 rounded text-purple-400 self-start mt-0.5 mr-2">message</span>
                      <span>Human-readable status message</span>
                    </li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-purple-500/20 shadow-lg shadow-purple-500/5">
          <CardHeader className="px-6 py-4 border-b border-border bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent flex items-center">
                <Webhook className="h-4 w-4 mr-2 text-purple-400" /> GET Key Verification Endpoint
              </CardTitle>
              <div className="text-xs text-muted-foreground rounded-full bg-muted px-2 py-1">
                GET /api/verify/:key/:game/:deviceId
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <Tabs defaultValue="request" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="request">Request</TabsTrigger>
                <TabsTrigger value="response">Response</TabsTrigger>
              </TabsList>
              <TabsContent value="request" className="space-y-4">
                <div className="relative bg-muted/40 p-4 rounded-md">
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 h-8 bg-muted/80"
                    onClick={() => copyToClipboard(`GET /api/verify/YOUR_LICENSE_KEY/GAME_NAME/UNIQUE_DEVICE_IDENTIFIER`, "getRequest")}
                  >
                    {copiedSection === "getRequest" ? (
                      <>
                        <Check className="h-3.5 w-3.5 mr-1 text-green-500" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                      </>
                    )}
                  </Button>
                  <pre className="font-mono text-sm overflow-x-auto whitespace-pre-wrap">
{`GET /api/verify/YOUR_LICENSE_KEY/GAME_NAME/UNIQUE_DEVICE_IDENTIFIER`}
                  </pre>
                </div>
                <div className="bg-purple-900/10 rounded-md p-4 space-y-2 border border-purple-500/20">
                  <h4 className="text-sm font-semibold text-purple-400">URL Parameters</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex">
                      <span className="font-mono text-xs bg-purple-900/20 px-1.5 rounded text-purple-400 self-start mt-0.5 mr-2">key</span>
                      <span>Your license key string</span>
                    </li>
                    <li className="flex">
                      <span className="font-mono text-xs bg-purple-900/20 px-1.5 rounded text-purple-400 self-start mt-0.5 mr-2">game</span>
                      <span>Game name (PUBG MOBILE, LAST ISLAND OF SURVIVAL, STANDOFF2)</span>
                    </li>
                    <li className="flex">
                      <span className="font-mono text-xs bg-purple-900/20 px-1.5 rounded text-purple-400 self-start mt-0.5 mr-2">deviceId</span>
                      <span>Unique identifier for the device (such as HWID or device fingerprint)</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-green-900/10 rounded-md p-4 border border-green-500/20">
                  <h4 className="text-sm font-semibold text-green-400 mb-2">Difference from POST Endpoint</h4>
                  <p className="text-sm text-muted-foreground">
                    The GET endpoint only checks if a key is valid but does not register the device. Use this for verification only.
                    To register a device, use the POST endpoint.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="response" className="space-y-4">
                <div className="relative bg-muted/40 p-4 rounded-md">
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 h-8 bg-muted/80"
                    onClick={() => copyToClipboard(`{
  "valid": true,
  "expiry": "2025-12-31",
  "deviceLimit": 2,
  "currentDevices": 1,
  "canRegister": true,
  "message": "License valid, device can be registered"
}`, "getResponse")}
                  >
                    {copiedSection === "getResponse" ? (
                      <>
                        <Check className="h-3.5 w-3.5 mr-1 text-green-500" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                      </>
                    )}
                  </Button>
                  <pre className="font-mono text-sm overflow-x-auto whitespace-pre-wrap">
{`{
  "valid": true,
  "expiry": "2025-12-31",
  "deviceLimit": 2,
  "currentDevices": 1,
  "canRegister": true,
  "message": "License valid, device can be registered"
}`}
                  </pre>
                </div>
                <div className="bg-purple-900/10 rounded-md p-4 space-y-2 border border-purple-500/20">
                  <h4 className="text-sm font-semibold text-purple-400">Response Fields</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex">
                      <span className="font-mono text-xs bg-purple-900/20 px-1.5 rounded text-purple-400 self-start mt-0.5 mr-2">valid</span>
                      <span>Boolean indicating if the license is valid and active</span>
                    </li>
                    <li className="flex">
                      <span className="font-mono text-xs bg-purple-900/20 px-1.5 rounded text-purple-400 self-start mt-0.5 mr-2">expiry</span>
                      <span>Expiration date of the license in ISO format</span>
                    </li>
                    <li className="flex">
                      <span className="font-mono text-xs bg-purple-900/20 px-1.5 rounded text-purple-400 self-start mt-0.5 mr-2">deviceLimit</span>
                      <span>Maximum number of devices allowed for this key</span>
                    </li>
                    <li className="flex">
                      <span className="font-mono text-xs bg-purple-900/20 px-1.5 rounded text-purple-400 self-start mt-0.5 mr-2">currentDevices</span>
                      <span>Current number of devices registered to this key</span>
                    </li>
                    <li className="flex">
                      <span className="font-mono text-xs bg-purple-900/20 px-1.5 rounded text-purple-400 self-start mt-0.5 mr-2">canRegister</span>
                      <span>Boolean indicating if a new device can be registered (only in GET response)</span>
                    </li>
                    <li className="flex">
                      <span className="font-mono text-xs bg-purple-900/20 px-1.5 rounded text-purple-400 self-start mt-0.5 mr-2">message</span>
                      <span>Human-readable status message</span>
                    </li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border border-purple-500/20 shadow-lg shadow-purple-500/5">
          <CardHeader className="px-6 py-4 border-b border-border bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
            <CardTitle className="text-base font-medium bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent flex items-center">
              <Code className="h-4 w-4 mr-2 text-purple-400" /> Implementation Example
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <Tabs defaultValue="post" className="w-full mb-4">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="post">POST Method</TabsTrigger>
                <TabsTrigger value="get">GET Method</TabsTrigger>
              </TabsList>
              
              <TabsContent value="post" className="space-y-4">
                <div className="relative bg-muted/40 p-4 rounded-md">
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 h-8 bg-muted/80"
                    onClick={() => copyToClipboard(`// POST Implementation - Verifies and Registers Device
async function verifyAndRegisterDevice(licenseKey, deviceId, game) {
  try {
    const response = await fetch('https://yourdomain.com/api/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: licenseKey,
        deviceId: deviceId,
        game: game
      }),
    });
    
    const data = await response.json();
    
    if (data.valid) {
      // License is valid, proceed with application
      console.log('License valid until:', data.expiry);
      return true;
    } else {
      // License invalid
      console.error('License error:', data.message);
      return false;
    }
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
}`, "post-implementation")}
                  >
                    {copiedSection === "post-implementation" ? (
                      <>
                        <Check className="h-3.5 w-3.5 mr-1 text-green-500" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                      </>
                    )}
                  </Button>
                  <pre className="font-mono text-sm overflow-x-auto whitespace-pre-wrap">
{`// POST Implementation - Verifies and Registers Device
async function verifyAndRegisterDevice(licenseKey, deviceId, game) {
  try {
    const response = await fetch('https://yourdomain.com/api/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: licenseKey,
        deviceId: deviceId,
        game: game
      }),
    });
    
    const data = await response.json();
    
    if (data.valid) {
      // License is valid, proceed with application
      console.log('License valid until:', data.expiry);
      return true;
    } else {
      // License invalid
      console.error('License error:', data.message);
      return false;
    }
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
}`}
                  </pre>
                </div>
              </TabsContent>
              
              <TabsContent value="get" className="space-y-4">
                <div className="relative bg-muted/40 p-4 rounded-md">
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 h-8 bg-muted/80"
                    onClick={() => copyToClipboard(`// GET Implementation - Only Verifies, No Registration
async function checkLicenseValidity(licenseKey, deviceId, game) {
  try {
    // URL encode parameters to handle special characters
    const encodedKey = encodeURIComponent(licenseKey);
    const encodedGame = encodeURIComponent(game);
    const encodedDeviceId = encodeURIComponent(deviceId);
    
    const response = await fetch(
      \`https://yourdomain.com/api/verify/\${encodedKey}/\${encodedGame}/\${encodedDeviceId}\`,
      {
        method: 'GET'
      }
    );
    
    const data = await response.json();
    
    if (data.valid) {
      // License is valid
      console.log('License is valid until:', data.expiry);
      console.log('Can register this device:', data.canRegister);
      return {
        isValid: true,
        canRegister: data.canRegister,
        message: data.message,
        expiry: data.expiry
      };
    } else {
      // License invalid
      console.error('License check failed:', data.message);
      return {
        isValid: false,
        message: data.message
      };
    }
  } catch (error) {
    console.error('Verification error:', error);
    return {
      isValid: false,
      message: 'Error connecting to license server'
    };
  }
}`, "get-implementation")}
                  >
                    {copiedSection === "get-implementation" ? (
                      <>
                        <Check className="h-3.5 w-3.5 mr-1 text-green-500" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                      </>
                    )}
                  </Button>
                  <pre className="font-mono text-sm overflow-x-auto whitespace-pre-wrap">
{`// GET Implementation - Only Verifies, No Registration
async function checkLicenseValidity(licenseKey, deviceId, game) {
  try {
    // URL encode parameters to handle special characters
    const encodedKey = encodeURIComponent(licenseKey);
    const encodedGame = encodeURIComponent(game);
    const encodedDeviceId = encodeURIComponent(deviceId);
    
    const response = await fetch(
      \`https://yourdomain.com/api/verify/\${encodedKey}/\${encodedGame}/\${encodedDeviceId}\`,
      {
        method: 'GET'
      }
    );
    
    const data = await response.json();
    
    if (data.valid) {
      // License is valid
      console.log('License is valid until:', data.expiry);
      console.log('Can register this device:', data.canRegister);
      return {
        isValid: true,
        canRegister: data.canRegister,
        message: data.message,
        expiry: data.expiry
      };
    } else {
      // License invalid
      console.error('License check failed:', data.message);
      return {
        isValid: false,
        message: data.message
      };
    }
  } catch (error) {
    console.error('Verification error:', error);
    return {
      isValid: false,
      message: 'Error connecting to license server'
    };
  }
}`}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-4 p-4 bg-amber-900/10 border border-amber-500/20 rounded-md">
              <h4 className="text-sm font-semibold text-amber-400 flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                Important Note
              </h4>
              <p className="text-sm text-muted-foreground">
                Replace <span className="font-mono text-xs bg-amber-900/20 px-1.5 py-0.5 rounded text-amber-400">yourdomain.com</span> with your actual API endpoint. Make sure to implement appropriate error handling and retry logic in production applications.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}