import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";

export function SupabaseConnectionTest() {
  const [status, setStatus] = useState<{
    connected: boolean;
    message: string;
    toursCount: number;
    error?: string;
  } | null>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      // Test basic connection
      const { data: healthCheck, error: healthError } = await supabase
        .from("tours")
        .select("id", { count: "exact", head: true });

      if (healthError) {
        setStatus({
          connected: false,
          message: "Connection failed",
          toursCount: 0,
          error: healthError.message
        });
        return;
      }

      // Fetch actual tours
      const { data: tours, error: toursError, count } = await supabase
        .from("tours")
        .select("*", { count: "exact" });

      if (toursError) {
        setStatus({
          connected: false,
          message: "Failed to fetch tours",
          toursCount: 0,
          error: toursError.message
        });
        return;
      }

      setStatus({
        connected: true,
        message: "Successfully connected to Supabase",
        toursCount: count || 0
      });

      console.log("Tours fetched:", tours);
    } catch (err: any) {
      setStatus({
        connected: false,
        message: "Unexpected error",
        toursCount: 0,
        error: err.message
      });
    }
  };

  if (!status) {
    return <div>Testing connection...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status.connected ? (
            <CheckCircle className="text-green-500" />
          ) : (
            <XCircle className="text-red-500" />
          )}
          Supabase Connection Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Alert variant={status.connected ? "default" : "destructive"}>
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <p><strong>Tours in database:</strong> {status.toursCount}</p>
          {status.error && (
            <Alert variant="destructive">
              <AlertDescription>
                <strong>Error:</strong> {status.error}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="mt-4 p-3 bg-muted rounded text-sm space-y-1">
          <p><strong>Project ID:</strong> {import.meta.env.VITE_SUPABASE_PROJECT_ID}</p>
          <p><strong>URL:</strong> {import.meta.env.VITE_SUPABASE_URL}</p>
          <p><strong>API Key:</strong> {import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.substring(0, 20)}...</p>
        </div>
      </CardContent>
    </Card>
  );
}
