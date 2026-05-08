import { Axiom } from '@axiomhq/js';
import { Logger, AxiomJSTransport } from '@axiomhq/logging';
import { v4 } from 'uuid';

import Config from 'react-native-config';

const { AXIOM_TOKEN, AXIOM_DATASET } = Config || {};

const uuid = v4();

const axiomClient = new Axiom({
  token: AXIOM_TOKEN
});

const log = new Logger({
  transports: [
    new AxiomJSTransport({
      axiom: axiomClient,
      dataset: AXIOM_DATASET
    })
  ]
});

const loggerData = {
  uuid
};

export const logger = {
  info: (msg: string, data: Record<string, any>) => {
    log.info(msg, {
      ...loggerData,
      data: JSON.stringify(data)
    });
  }
};
