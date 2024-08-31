module.exports = function(RED) {
    "use strict";
    var fs = require('fs');
    var minio = require("minio");
    var http = require("http");
    const { Readable } = require('stream');

    function MinioConfig(config) {
        RED.nodes.createNode(this, config);

        this.bucketName = config.bucketName;
        this.minioClient = null;
        this.getClient = function() {
            if (this.minioClient == null) {
                this.minioClient = new minio.Client({
                    endPoint: config.endPoint,
                    port: config.port * 1,
                    useSSL: config.useSSL,
                    accessKey: config.accessKey,
                    secretKey: config.secretKey
                });
            }
            return this.minioClient;
        }
    }

    function MinioPush(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        this.bucketName = config.bucketName;
        this.prefix = config.prefix;
        
        const bucket = RED.nodes.getNode(config.bucket);
        this.minioClient = bucket.getClient();
        this.bucketName = bucket.bucketName;

        node.on('input', function(msg) {
            var filename = this.prefix || "";
            if (msg.filename) {
                filename += msg.filename;
            } else if (msg.responseUrl) {
                const splat = new URL(msg.responseUrl).pathname.split("/");
                filename += splat[splat.length - 1];
            } else {
                this.warn("could not determine filename");
            }

            const stream = Readable.from(msg.payload);

            node.status({fill:"blue",shape:"dot",text:"Pushing file " + filename});
            
            node.minioClient.putObject(this.bucketName, filename, stream, (err, objInfo) => {
                if (err) {
                    node.error("Could not push " + filename + ": " + err);

                    node.status({fill:"red",text:"error pushing file " + filename});
                } else {
                    node.status({fill:"black", text:"pushed successfully."});
                }
            });
        });
    }

    function MinioGet(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        this.bucketName = config.bucketName;
        this.prefix = config.prefix || "";
        this.suffix = config.suffix || "";
        this.events = [minio.ObjectCreatedAll];
        
        const bucket = RED.nodes.getNode(config.bucket);
        this.minioClient = bucket.getClient();
        this.bucketName = bucket.bucketName;

        node.on('input', function(msg) {
            node.send(msg);
        });
    }

    function MinioListen(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        this.bucketName = config.bucketName;
        this.prefix = config.prefix || "";
        this.suffix = config.suffix || "";
        this.events = [minio.ObjectCreatedAll];
        
        const bucket = RED.nodes.getNode(config.bucket);
        this.minioClient = bucket.getClient();
        this.bucketName = bucket.bucketName;

        this.poller = this.minioClient.listenBucketNotification(this.bucketName, this.prefix, this.suffix, this.events);
        this.poller.on("notification", function(record) {
            const bucketName = record.s3.bucket.name;
            const objectKey = record.s3.object.key;
            node.emit("input", {payload: record})
        });

        node.on('input', function(msg) {
            node.send(msg);
        });
        node.on('close', function() {
            this.poller.stop();
        })
    }

    RED.nodes.registerType("minio-config",MinioConfig);
    RED.nodes.registerType("minio-push", MinioPush);
    RED.nodes.registerType("minio-listen", MinioListen);
}