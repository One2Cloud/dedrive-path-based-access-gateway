import express, { Request, Response, Application, NextFunction } from 'express';
import compression from 'compression';
import morgan from 'morgan';
import _ from 'lodash';
import cors from 'cors';
import { createProxyMiddleware, responseInterceptor } from 'http-proxy-middleware';
import { config } from './src/config';
import mongoose from 'mongoose';
import Item from './src/models/item.model';
import Pod from './src/models/pod.model';
import * as mime from 'mime';

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
    selfHandleResponse: true,
    onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
      console.log(`url+${req.url}`);
      // console.log('path:' + new URL(req.url!).pathname);
      const uid = req.url!.split('/').at(-1);
      console.log({ uid });
      const item = await Item.findOne({ uid });
      if (!item) throw new Error(`Item not found`);
      console.log(item.name);
      const ext = item.name.split('.').at(-1);
      console.log({ ext });
      if (ext) {
        const mime_ = mime.getType(ext);
        console.log({ mime_ });
        // proxyRes.headers['X-DeDrive'] = '1';
        // proxyRes.headers['Content-Type'] = mime_ || 'application/octet-stream';
        res.setHeader('Content-Type', mime_ || 'application/octet-stream');
      } else {
        // proxyRes.headers['X-DeDrive'] = '1';
        // proxyRes.headers['Content-Type'] = 'application/octet-stream';
        res.setHeader('Content-Type', 'application/octet-stream');
      }
      res.setHeader('X-DeDrive', '1');
      res.removeHeader('Content-Disposition');
      // res.header;
      res.setHeader('Content-Disposition', 'inline');
      return responseBuffer;
    }),
    target: 'http://dev.gateway.dedrive.io',
    changeOrigin: true,
    // router: async (req) => {
    //   return `http://dev.gateway.dedrive.io`;
    // },
    pathRewrite: async (path, req) => {
      const podName: string = req.hostname.split('.')[0];
      console.log(`Pod Name: ${podName}`);
      console.log(`Path: ${req.path}`);
      if (req.path.endsWith('/')) {
        const prefix = podName;
        const item = await Item.findOne({ name: 'index.html', prefix });
        if (!item) throw new Error(`Item not found`);
        console.log(`Item UID: ${item.uid}`);
        console.log(`/v1/access/${item.uid}`);
        return `/v1/access/${item.uid}`;
      } else {
        const keys = req.path.split('/');
        console.log({ keys });
        const name = keys.pop();
        keys.unshift(podName);
        console.log({ keys });
        const prefix = keys.join('/');
        console.log(`Name: ${name}`);
        console.log(`Prefix: ${prefix}`);
        const item = await Item.findOne({ name, prefix });
        if (!item) throw new Error(`Item not found`);
        console.log(`Item UID: ${item.uid}`);
        console.log(`/v1/access/${item.uid}`);
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

// app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//   console.error(err);
//   console.log({ req, res });
//   return res.status(404).send();
// });

async function main() {
  await mongoose.connect(config.mongodb.url, { dbName: 'dedrive_devnet' });
  app.listen(8080, (): void => {
    console.log(`Connected successfully on port 8080`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
