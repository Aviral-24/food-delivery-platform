import { useQuery } from '@tanstack/react-query';
import { Activity, ExternalLink, RefreshCw } from 'lucide-react';
import { env } from '@/config/env';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const apiOrigin = env.VITE_API_URL.replace(/\/api\/v1\/?$/, '');

export function SystemStatusPage() {
  const healthQuery = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const res = await fetch(`${apiOrigin}/health`);
      const body = await res.json();
      return {
        status: res.status,
        requestId: res.headers.get('x-request-id') || body.requestId,
        body,
      };
    },
  });

  const tools = [
    { name: 'Swagger OpenAPI Docs', url: `${apiOrigin}/api-docs`, desc: 'Day 1–3 REST API Spec' },
    { name: 'Redpanda Console UI', url: 'http://localhost:8085', desc: 'Live order.placed Kafka topic' },
    { name: 'Supabase Studio', url: 'http://127.0.0.1:54323', desc: 'Postgres tables, PostGIS & outbox_events' },
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">System Health & Dev Tools</h1>
        <Button variant="secondary" onClick={() => healthQuery.refetch()}>
          <RefreshCw className="h-4 w-4" />
          Ping /health
        </Button>
      </div>

      <Card className="space-y-3">
        <div className="flex items-center gap-2 font-semibold">
          <Activity className="h-5 w-5 text-emerald-500" />
          <span>Backend Health Endpoint ({apiOrigin}/health)</span>
        </div>

        {healthQuery.isLoading && <p className="text-sm text-ink-muted">Checking backend...</p>}
        {healthQuery.isError && (
          <p role="alert" className="text-sm text-red-600">
            Backend unreachable on {apiOrigin}
          </p>
        )}
        {healthQuery.data && (
          <div className="space-y-2 text-xs">
            <p>
              <strong>HTTP Status:</strong> {healthQuery.data.status} OK
            </p>
            <p>
              <strong>X-Request-Id:</strong>{' '}
              <span className="font-mono">{healthQuery.data.requestId}</span>
            </p>
            <pre className="overflow-x-auto rounded-lg bg-surface p-3 font-mono text-xs">
              {JSON.stringify(healthQuery.data.body, null, 2)}
            </pre>
          </div>
        )}
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {tools.map((tool) => (
          <a key={tool.name} href={tool.url} target="_blank" rel="noreferrer" className="block">
            <Card className="h-full transition hover:border-brand">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{tool.name}</h2>
                <ExternalLink className="h-4 w-4 text-brand" />
              </div>
              <p className="mt-1 text-xs text-ink-muted">{tool.desc}</p>
              <p className="mt-2 font-mono text-[11px] text-brand">{tool.url}</p>
            </Card>
          </a>
        ))}
      </div>
    </section>
  );
}