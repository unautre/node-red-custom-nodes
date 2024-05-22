module.exports = function(RED) {
    "use strict";
    var fs = require('fs');
    //var minimatch = require("minimatch");
    var minio = require("minio");
    var http = require("http");
    const { Readable } = require('stream');

    function MinioPush(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        this.bucketName = config.bucketName;
        this.minioClient = new minio.Client({
            endPoint: config.endPoint,
            port: config.port,
            useSSL: config.useSSL,
            accessKey: config.accessKey,
            secretKey: config.secretKey
        });

        node.on('input', function(msg) {
            var filename;
            if (msg.filename) {
                filename = msg.filename;
            } else if (msg.responseUrl) {
                const splat = new URL(msg.responseUrl).pathname.split("/");
                filename = splat[splat.length - 1];
            } else {
                this.warn("could not determine filename");
            }

            const stream = Readable.from(msg.payload);

            node.status({fill:"blue",shape:"dot",text:"Pushing file " + filename});
            
            this.minioClient.putObject(this.bucketName, filename, stream, (err, objInfo) => {
                if (err) {
                    node.error("Could not push " + filename + ": " + err);

                    node.status({fill:"red",text:"error pushing file " + filename});
                } else {
                    //node.info("Successfully pushed " + filename);
                    node.status({fill:"black", text:"pushed successfully."});
                }
            });
        });
    }

    RED.nodes.registerType("minio-push",MinioPush);
}