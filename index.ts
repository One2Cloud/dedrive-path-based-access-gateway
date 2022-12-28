import express, { Application, NextFunction } from 'express';
import compression from 'compression';
import morgan from 'morgan';
import _ from 'lodash';
import cors from 'cors';
import { createProxyMiddleware, responseInterceptor } from 'http-proxy-middleware';
import { config } from './src/config';
import mongoose from 'mongoose';
import Item from './src/models/item.model';
import * as mime from 'mime';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));
app.use(compression());
app.use(cors());

// Item Access Gateway
app.use(
  createProxyMiddleware((pathname, req) => req.method === 'GET', {
    selfHandleResponse: true,
    onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
      const uid = req.url!.split('/').at(-1);
      const item = await Item.findOne({ uid });
      if (!item) throw new Error(`Item not found`);
      const ext = item.name.split('.').at(-1);
      if (ext) {
        const mime_ = mime.getType(ext);
        res.setHeader('Content-Type', mime_ || 'application/octet-stream');
      } else {
        res.setHeader('Content-Type', 'application/octet-stream');
      }
      res.setHeader('X-DeDrive', '1');
      res.removeHeader('Content-Disposition');
      // res.header;
      res.setHeader('Content-Disposition', 'inline');
      return responseBuffer;
    }),
    target: `http://${config.accessGatewayHostName}`,
    changeOrigin: true,
    pathRewrite: async (path, req) => {
      const podName: string = req.hostname.split('.')[0];
      if (req.path.endsWith('/')) {
        const prefix = podName;
        const item = await Item.findOne({ name: 'index.html', prefix });
        if (!item) throw new Error(`Item not found`);
        return `/v1/access/${item.uid}`;
        open;
      } else {
        const keys = req.path.split('/').filter((x) => !!x);
        const name = keys.pop();
        keys.unshift(podName);
        const prefix = keys.join('/');
        const item = await Item.findOne({ name, prefix });
        if (!item) throw new Error(`Item not found`);
        return `/v1/access/${item.uid}`;
      }
    },
    headers: {
      Connection: 'keep-alive',
    },
    onError: async (err, req, res, target) => {
      console.error({ err, req, res, target });
    },
  }),
);

async function main() {
  await mongoose.connect(config.mongodb.url, { dbName: config.mongodb.dbName });
  app.listen(8080, (): void => {
    console.log(`Connected successfully on port 8080`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
