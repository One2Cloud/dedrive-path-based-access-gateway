import _ from 'lodash';

export interface IConfig {
  mongodb: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
}

export const config: IConfig = {
  mongodb: {
    host: process.env.MONGODB_HOST || 'localhost',
    port: _.toNumber(process.env.MONGODB_PORT) || 27017,
    username: process.env.MONGODB_USER || 'admin',
    password: process.env.MONGODB_PASSWORD || 'admin',
    database: process.env.MONGODB_DATABASE || 'dedrive',
  },
};
