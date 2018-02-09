#https://nodejs.org/en/docs/guides/nodejs-docker-webapp/

FROM node:carbon

# Replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

EXPOSE 8080 

FROM mysql

# Copy the database schema to the /data directory
ADD mySQLFiles/run_db.sh mySQLFiles/init_db.sh mySQLFiles/schema.sql /tmp/

# init_db will create the default
# database from epcis_schema.sql, then
# stop mysqld, and finally copy the /var/lib/mysql directory
# to default_mysql_db.tar.gz
RUN bash /tmp/init_db.sh

# run_db starts mysqld, but first it checks
# to see if the /var/lib/mysql directory is empty, if
# it is it is seeded with default_mysql_db.tar.gz before
# the mysql is fired up

ENTRYPOINT "/tmp/run_db.sh"


CMD [ "npm", "start" ]
