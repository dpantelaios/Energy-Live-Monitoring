FROM node:16

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000
CMD ["node", "display_FF.js"]