FROM node:latest

ENV JWT_SECRET=senhasupersecreta123

WORKDIR /usr/app

COPY package.json ./

RUN yarn install

COPY . .

EXPOSE 3333

CMD ["npm", "run", "dev"]
