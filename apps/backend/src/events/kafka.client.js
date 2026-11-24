import { Kafka, logLevel } from 'kafkajs';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export const TOPICS = Object.freeze({
  ORDER_PLACED: 'order.placed',
});

export const kafka = new Kafka({
  clientId: env.KAFKA_CLIENT_ID,
  brokers: env.KAFKA_BROKERS.split(',').map((b) => b.trim()),
  logLevel: logLevel.WARN,
  retry: {
    initialRetryTime: 300,
    retries: 5,
  },
});

let producer = null;

export const ensureTopics = async () => {
  const admin = kafka.admin();
  await admin.connect();
  try {
    await admin.createTopics({
      waitForLeaders: true,
      topics: [
        {
          topic: TOPICS.ORDER_PLACED,
          numPartitions: 3,
          replicationFactor: 1,
        },
      ],
    });
  } finally {
    await admin.disconnect();
  }
};

export const getProducer = async () => {
  if (!producer) {
    producer = kafka.producer({
      allowAutoTopicCreation: true,
      idempotent: true,
    });
    await producer.connect();
    logger.info('Kafka/Redpanda producer connected');
  }
  return producer;
};

export const disconnectKafka = async () => {
  if (producer) {
    await producer.disconnect();
    producer = null;
  }
};