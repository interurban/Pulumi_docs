"use strict";
const pulumi = require("@pulumi/pulumi");
const aws = require("@pulumi/aws");

const bucket = new aws.s3.Bucket("bucket");

const file = new aws.s3.BucketObject("bucket-object", {
    bucket: bucket.id,
    key: "some-file.txt",
    content: "some-content",
});

// concat takes a list of args and concatenates all of them into a single output:
exports.s3Url1 = pulumi.concat("s3://", bucket.bucket, "/", file.key);

// interpolate takes a JavaScript template literal and expands outputs correctly:
exports.s3Url2 = pulumi.interpolate`s3://${bucket.bucket}/${file.key}`;
