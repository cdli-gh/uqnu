# latest version of a basic light weight alpine
FROM node:13-alpine

# shift the working directory to /var/app/
WORKDIR /var/app

#copy package.json (dependencies)
COPY ./package.json ./

# port on which the app would be working
EXPOSE 3001

#add git 
RUN apk add git

# install node modules
RUN npm install

# add app  
COPY . .

# make app up and running
CMD [ "npm", "start" ]