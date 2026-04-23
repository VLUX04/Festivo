FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build        # compiles TS → JS into dist/

EXPOSE 3000
CMD [ "node", "dist/server.js" ]
