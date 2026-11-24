import { trace } from '@opentelemetry/api';
import { kafka, TOPICS } from '../kafka.client.js';
import { logger } from '../../config/logger.js';

const tracer = trace.getTracer('order-placed-consumer');
let consumer = null;

export const startOrderPlacedConsumer = async () => {
  try {
    consumer = kafka.consumer({ groupId: 'food-delivery-notifications-group' });
    await consumer.connect();
    await consumer.subscribe({ topic: TOPICS.ORDER_PLACED, fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        await tracer.startActiveSpan('kafka.consume order.placed', async (span) => {
          try {
            const raw = message.value?.toString() || '{}';
            const event = JSON.parse(raw);

            span.setAttribute('kafka.topic', topic);
            span.setAttribute('kafka.partition', partition);
            span.setAttribute('order.id', event.aggregateId || '');

            logger.info(
              {
                topic,
                partition,
                offset: message.offset,
                eventId: event.eventId,
                orderId: event.aggregateId,
                totalAmount: event.data?.totalAmount,
              },
              'Consumed order.placed event -> ready for restaurant notification & dispatch'
            );
          } finally {
            span.end();
          }
        });
      },
    });

    logger.info({ topic: TOPICS.ORDER_PLACED }, 'OrderPlaced consumer subscribed');
  } catch (err) {
    logger.warn({ err: err.message }, 'OrderPlaced consumer did not connect (is Redpanda running?)');
  }
};

export const stopOrderPlacedConsumer = async () => {
  if (consumer) {
    await consumer.disconnect();
    consumer = null;
  }
};