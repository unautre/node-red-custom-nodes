FROM nodered/node-red

RUN npm install --verbose \
        # node-red/node-red-web-nodes node-red-node-aws
        node-red-node-google node-red-node-instagram node-red-node-strava \
        # node-red-contrib-twitter-stream node-red-node-twitter \
        # node-red-contrib-flightaware \
        node-red-contrib-postgresql \
        node-red-node-feedparser \
        node-red-node-exif \
        #node-red-dashboard node-red-contrib-counter \
        #node-red-node-multilang-sentiment node-red-node-sentiment node-red-node-badwords \
        #node-red-node-data-generator node-red-node-pidcontrol node-red-node-random node-red-node-smooth \
        #node-red-node-base64 node-red-node-geohash node-red-node-msgpack node-red-node-what3words \
        #node-red-node-ping node-red-node-stomp node-red-node-irc node-red-node-sqlite \
        #node-red-node-suncalc node-red-node-timeswitch node-red-node-daemon \
        #node-red/node-red-auth-github \
        #openid-client \
        passport-openidconnect

# install own dependencies
#RUN npm install --verbose \
#      minio

RUN npm install --verbose \
        selenium-webdriver

#RUN npm install --verbose \
#      ./node-red-transformers/
#        @xenova/transformers

COPY ./node-red-contrib-minio ./node-red-contrib-minio

RUN npm install --verbose \
        ./node-red-contrib-minio/

