import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/layouts/admin-layout";
import GenerateTokenModal from "@/components/generate-token-modal";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { PlusCircle } from "lucide-react";

export default function AdminTokens() {
  const [generateTokenModalOpen, setGenerateTokenModalOpen] = useState(false);
  
  // Fetch tokens
  const { data: tokens, isLoading } = useQuery({
    queryKey: ['/api/admin/tokens'],
  });

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Referral Tokens</h2>
        <Button
          onClick={() => setGenerateTokenModalOpen(true)}
          className="flex items-center"
        >
          <PlusCircle className="mr-1 h-4 w-4" /> Generate New Token
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Token
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Created Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Used By
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      Loading tokens...
                    </td>
                  </tr>
                ) : tokens && tokens.length > 0 ? (
                  tokens.map((token) => (
                    <tr key={token.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900">{token.token}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(token.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {token.usedBy || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={token.isUsed ? "secondary" : "success"}>
                          {token.isUsed ? "Used" : "Available"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      No tokens found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <GenerateTokenModal
        open={generateTokenModalOpen}
        onOpenChange={setGenerateTokenModalOpen}
      />
    </AdminLayout>
  );
}
