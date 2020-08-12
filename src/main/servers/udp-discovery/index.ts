import { Discovery } from 'udp-discovery';
let announcer: Discovery | null = null;
let receiver: Discovery | null = null;

const handleServiceAvailable = (name: string, data: any, reason: string) => {
  console.info(name, data, reason);
  if (announcer) announcer.sendEvent('testing', { someData: 'Hi!' });
}

const handleServiceUnavailable = (name: string, data: any, reason: string) => {
  console.info(name, data, reason);
}

const handleMessageBusEvent = (eventName: string, data: any) => {
  console.info(eventName, data);
}

export const init = () => {
  console.info('Starting udp-discovery');

  announcer = new Discovery();
  announcer.on('MessageBus', handleMessageBusEvent);

  receiver = new Discovery();
  receiver.on('available', handleServiceAvailable);
  receiver.on('unavailable', handleServiceUnavailable);

  announcer.announce('Some service', { exampleData: 'Test!' }, 500, true);

  console.info('Started udp-discovery');
}
