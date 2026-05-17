FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm@11.1.2

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "run", "dev"]
