FROM node:20-alpine

WORKDIR /app

# Solo dependencias de producción (imagen mínima y segura)
COPY package.json ./
RUN npm ci --omit=dev || npm install --omit=dev

COPY . .

# El bot NO corre como root
USER node

EXPOSE 3000

CMD ["node", "index.js"]
