import express, { Request, Response, Application, NextFunction } from 'express';
import compression from 'compression';
import morgan from 'morgan';
import _ from 'lodash';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { config } from './src/config';
import mongoose from 'mongoose';
import Item from './src/models/item.model';
import Pod from './src/models/pod.model';
import mime from 'mime';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));
app.use(compression());
app.use(cors());

// Item Access Gateway
app.use(
  // createProxyMiddleware((pathname, req) => req.method === "GET", {
  createProxyMiddleware((pathname, req) => req.method === 'GET', {
    onProxyRes: (proxyRes, req, res) => {
      if (req.path.endsWith('/')) {
        proxyRes.headers['content-type'] = 'text/html';
      } else {
        const ext = req.path.split('.').pop();
        if (ext) {
          const mime_ = mime.getType(ext);
          proxyRes.headers['content-type'] = `${mime_ || 'application/octet-stream'}`;
        } else {
          proxyRes.headers['content-type'] = 'application/octet-stream';
        }
      }
    },
    router: async (req) => {
      // return `dev.gateway.dedrive.io`;
      return {
        host: 'dev.gateway.dedrive.io',
        port: '80',
        protocol: 'http',
      };
    },
    pathRewrite: async (path, req) => {
      const podName = req.hostname.split('.')[0];
      console.log(`Pod Name: ${podName}`);
      const pod = await Pod.findOne({ name: podName });
      if (!pod) throw new Error(`Pod ${podName} not found`);
      console.log(`Path: ${req.path}`);
      if (req.path.endsWith('/')) {
        const item = await Item.findOne({ name: 'index.html', pod });
        if (!item) throw new Error(`Item not found`);
        return `/v1/access/${item.uid}`;
      } else {
        const keys = req.path.split('/');
        const name = keys.pop();
        const prefix = keys.join('/');
        console.log(`Name: ${name}`);
        console.log(`Prefix: ${prefix}`);
        const item = await Item.findOne({ name, prefix, pod: pod });
        if (!item) throw new Error(`Item not found`);
        return `/v1/access/${item.uid}`;
      }
    },
    onError: async (err, req, res, target) => {
      const podName = req.hostname.split('.')[0];
      console.log(`Pod Name: ${podName}`);
      const pod = await Pod.findOne({ name: podName });
      if (!pod) throw new Error(`Pod ${podName} not found`);
      const item = await Item.findOne({ name: 'index.html', pod });
      if (!item) throw new Error(`Item not found`);
      return `/v1/access/${item.uid}`;
    },
  }),
);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  return res.status(404).send();
});

async function main() {
  await mongoose.connect(`mongodb://${config.mongodb.host}:${config.mongodb.port}/`, {
    user: config.mongodb.username,
    pass: config.mongodb.password,
    dbName: config.mongodb.database,
    authSource: 'admin',
  });
  app.listen(8080, (): void => {
    console.log(`Connected successfully on port 8080`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
