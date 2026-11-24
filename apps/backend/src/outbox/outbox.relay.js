import { trace } from '@opentelemetry/api';
import { pool } from '../db/client.js';
import { getProducer, ensureTopics } from '../events/kafka.client.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

const tracer = trace.getTracer('outbox-relay');
let timer = null;
let isPolling = false;

export const processOutboxBatch = async (batchSize = 20) => {
  if (isPolling) return 0;
  isPolling = true;

  const client = await pool.connect();
  let publishedCount = 0;

  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `SELECT id, aggregate_type, aggregate_id, event_type, payload, created_at
       FROM public.outbox_events
       WHERE status = 'pending'
       ORDER BY created_at ASC
       LIMIT $1
       FOR UPDATE SKIP LOCKED`,
      [batchSize]
    );

    if (rows.length === 0) {
      await client.query('COMMIT');
      return 0;
    }

    const producer = await getProducer();

    for (const row of rows) {
      await tracer.startActiveSpan(`outbox.publish ${row.event_type}`, async (span) => {
        try {
          span.setAttribute('outbox.event_id', row.id);
          span.setAttribute('outbox.aggregate_id', row.aggregate_id);

          const envelope = {
            eventId: row.id,
            eventType: row.event_type,
            aggregateType: row.aggregate_type,
            aggregateId: row.aggregate_id,
            occurredAt: row.created_at,
            data: row.payload,
          };

          await producer.send({
            topic: row.event_type,
            messages: [
              {
                key: row.aggregate_id,
                value: JSON.stringify(envelope),
                headers: {
                  'event-id': row.id,
                  'event-type': row.event_type,
                },
              },
            ],
          });

          await client.query(
            `UPDATE public.outbox_events
             SET status = 'published', published_at = NOW(), last_error = NULL
             WHERE id = $1`,
            [row.id]
          );

          publishedCount += 1;
          logger.info(
            { eventId: row.id, topic: row.event_type, aggregateId: row.aggregate_id },
            'Outbox event published to Redpanda'
          );
        } catch (err) {
          span.recordException(err);
          await client.query(
            `UPDATE public.outbox_events
             SET retry_count = retry_count + 1, last_error = $2
             WHERE id = $1`,
            [row.id, err.message]
          );
          logger.error({ err, eventId: row.id }, 'Failed to publish outbox event');
        } finally {
          span.end();
        }
      });
    }

    await client.query('COMMIT');
    return publishedCount;
  } catch (err) {
    await client.query('ROLLBACK');
    logger.warn({ err: err.message }, 'Outbox relay cycle skipped (broker/DB unavailable)');
    return 0;
  } finally {
    client.release();
    isPolling = false;
  }
};

export const startOutboxRelay = async () => {
  try {
    await ensureTopics();
  } catch (err) {
    logger.warn({ err: err.message }, 'Redpanda not reachable yet; relay will retry in background');
  }

  timer = setInterval(() => {
    processOutboxBatch().catch(() => {});
  }, env.OUTBOX_POLL_INTERVAL_MS);

  logger.info({ intervalMs: env.OUTBOX_POLL_INTERVAL_MS }, 'Outbox relay started');
};

export const stopOutboxRelay = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};