import _ from 'lodash';

export interface IConfig {
  mongodb: {
    url: string;
    dbName: string;
  };
  accessGatewayHostName: string;
}

export const config: IConfig = {
  mongodb: {
    // host: process.env.MONGODB_HOST || 'localhost',
    // port: _.toNumber(process.env.MONGODB_PORT) || 27017,
    // username: process.env.MONGODB_USER || 'admin',
    // password: process.env.MONGODB_PASSWORD || 'admin',
    // database: process.env.MONGODB_DATABASE || 'dedrive',
    url: process.env.MONGODB_URL || 'mongodb://localhost:27017/drive',
    dbName: process.env.MONGODB_DATABASE || 'dedrive_devnet',
  },
  accessGatewayHostName: process.env.ACCESS_GATEWAY_HOSTNAME || 'localhost',
};
