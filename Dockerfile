FROM public.ecr.aws/docker/library/node:16 as builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM public.ecr.aws/docker/library/node:16-alpine
WORKDIR /app
RUN apk add --no-cache --update python3 make g++ && \
    rm -rf /var/cache/*
COPY package.json .
COPY package-lock.json .
RUN npm install --only=production
COPY --from=builder /app/dist/ /app/

CMD ["node", "index.js"]