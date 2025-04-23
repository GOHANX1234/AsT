import AdminLayout from "@/layouts/admin-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminApi() {
  return (
    <AdminLayout>
      <h2 className="text-2xl font-semibold mb-6">API Documentation</h2>
      
      <Card className="overflow-hidden mb-6">
        <CardHeader className="px-6 py-4 border-b border-gray-200">
          <CardTitle className="text-base font-medium">Key Verification Endpoint</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <h4 className="text-lg font-medium mb-2">Request</h4>
          <div className="bg-muted/40 p-4 rounded-md mb-4">
            <pre className="font-mono text-sm overflow-x-auto">
{`POST /api/verify
Content-Type: application/json

{
  "key": "YOUR_LICENSE_KEY",
  "deviceId": "UNIQUE_DEVICE_IDENTIFIER",
  "game": "GAME_NAME"
}`}
            </pre>
          </div>
          
          <h4 className="text-lg font-medium mb-2">Response</h4>
          <div className="bg-muted/40 p-4 rounded-md">
            <pre className="font-mono text-sm overflow-x-auto">
{`{
  "valid": true,
  "expiry": "2023-12-31",
  "deviceLimit": 2,
  "currentDevices": 1,
  "message": "License valid"
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-gray-200">
          <CardTitle className="text-base font-medium">Implementation Example</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-muted/40 p-4 rounded-md">
            <pre className="font-mono text-sm overflow-x-auto">
{`// Example JavaScript Implementation
async function verifyLicense(licenseKey, deviceId, game) {
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
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
