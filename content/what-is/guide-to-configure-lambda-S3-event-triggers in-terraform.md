---
title: Configure Lambda S3 event triggers in Terraform & Pulumi
meta_desc: |
     A comprehensive guide to Configure Lambda S3 event triggers in Terraform and Pulumi.

type: what-is
page_title: Configure Lambda S3 event triggers in Terraform & Pulumi
---

## Introduction

We firmly believe in the unique advantages that Pulumi's open-source engine offers, especially for tasks like configuring AWS Lambda S3 events with triggers. While this is achievable with Terraform, Pulumi elevates infrastructure creation and management by leveraging the power and flexibility of general-purpose programming languages.

With Pulumi, you can uplevel your development workflow with your IDE’s IntelliSense for auto-completion and inline documentation. Additionally, Pulumi allows you to incorporate conditional logic, loops, and other advanced programming techniques directly into your infrastructure code. This opens up a world of possibilities, enabling the rich integration of libraries, package managers, and advanced build tools from your preferred language ecosystem.

In this guide, we will show you how to configure Lambda S3 event triggers using HCL with Terraform and then highlight the advanced capabilities Pulumi brings to the table. Let's dive into the process and explore the power of Pulumi!

## Understanding Lambda S3 event triggers

AWS Lambda is a serverless compute service that lets you run code without provisioning or managing servers. It's often used to process or respond to data changes in S3 buckets. This is beneficial for automating image processing, data validation, and other data workflows with minimal infrastructure management.

- **Lambda official documentation:** [AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
- **S3 official documentation:** [Amazon S3](https://docs.aws.amazon.com/s3/index.html)

## Configure Lambda S3 event triggers with Terraform

{{% notes type="info" %}}
This HCL example was generated using Pulumi AI and you can use Pulumi AI to create infrastructure as code in Python, TypeScript, JavaScript, Go, C#, YAML and Terraform's HCL for free! [Give Pulumi AI](https://www.pulumi.com/ai/) a try to add more of your specific requirements to this code, or convert between HCL and our supported languages.
{{% /notes %}}

We'll start with a Terraform example to configure an S3 event trigger for a Lambda function.

```hcl
provider "aws" {
  region = "us-west-2"
}

resource "aws_s3_bucket" "bucket" {
  bucket = "my-bucket"
}

resource "aws_lambda_function" "lambda" {
  filename         = "lambda_function_payload.zip"
  function_name    = "s3-triggered-lambda"
  handler          = "index.handler"
  runtime          = "nodejs12.x"
  role             = aws_iam_role.lambda_exec.arn
}

resource "aws_lambda_permission" "allow_bucket" {
  statement_id  = "AllowExecutionFromS3Bucket"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.bucket.arn
}

resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = aws_s3_bucket.bucket.bucket

  lambda_function {
    lambda_function_arn = aws_lambda_function.lambda.arn
    events              = ["s3:ObjectCreated:*"]
  }
}

resource "aws_iam_role" "lambda_exec" {
  name = "lambda_exec_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Sid    = "",
        Principal = {
          Service = "lambda.amazonaws.com"
        },
      },
    ],
  })
  
  inline_policy {
    name = "lambda_exec_policy"
    policy = jsonencode({
      Version = "2012-10-17",
      Statement = [
        {
          Action = [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents"
          ],
          Effect   = "Allow",
          Resource = "arn:aws:logs:*:*:*"
        },
      ],
    })
  }
}
```

This Terraform code sets up an S3 bucket with a notification that triggers a Lambda function upon the creation of an object. It also sets the necessary permissions.

## Configure Lambda S3 event triggers with Pulumi

Pulumi takes a modern approach to Infrastructure as Code by using general-purpose programming languages. Here's how you can achieve the same setup using Pulumi with TypeScript.

```typescript
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

// Create an S3 bucket
const bucket = new aws.s3.Bucket("my-bucket");

// Create an IAM role for the Lambda function
const role = new aws.iam.Role("lambda_exec_role", {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({ Service: "lambda.amazonaws.com" }),
});

new aws.iam.RolePolicy("lambda_exec_policy", {
  role: role.id,
  policy: {
    Version: "2012-10-17",
    Statement: [{
      Action: [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
      ],
      Effect: "Allow",
      Resource: "arn:aws:logs:*:*:*",
    }],
  },
});

// Create the Lambda function
const lambda = new aws.lambda.Function("s3-triggered-lambda", {
  runtime: aws.lambda.NodeJS12dXRuntime,
  code: new pulumi.asset.FileArchive("lambda_function_payload.zip"),
  handler: "index.handler",
  role: role.arn,
});

// Grant S3 permission to invoke the Lambda function
new aws.lambda.Permission("allowBucket", {
  action: "lambda:InvokeFunction",
  function: lambda.name,
  principal: "s3.amazonaws.com",
  sourceArn: bucket.arn,
});

// Set up the S3 bucket notification
bucket.onObjectCreated("onObjectCreated", lambda);
```

This Pulumi script creates an S3 bucket, an IAM role for the Lambda function, and the Lambda function itself. It then sets up a notification to trigger the Lambda function when an object is created in the S3 bucket.

## Super power your infrastructure as code with Pulumi

Pulumi offers several advantages over Terraform, particularly in scenarios like this one:

1. **Language support:** Pulumi supports languages such as TypeScript, Python, Go, and C#. This allows you to leverage familiar programming constructs, reuse code, and benefit from IDE features.
2. **State management:** Pulumi state is managed in the cloud, with options to use local or remote backends effortlessly.
3. **Rich ecosystem:** Native support for various cloud providers, integration with CI/CD systems, and extensive libraries enhances productivity.

### Advanced Example 1: Dynamic resource creation

Dynamically creating additional resources in response to a trigger is simpler with Pulumi owing to its full integration with TypeScript.

```typescript
bucket.onObjectCreated("onObjectCreated", async (bucketEvent) => {
    const objectKey = bucketEvent.Records[0].s3.object.key;

    // Dynamically create additional resources based on the object key
    const newBucket = new aws.s3.Bucket(`dynamic-bucket-${objectKey}`);
});
```

Here, we use the object key from the event to create a new S3 bucket dynamically. This approach is quite expressive and simplifies the use of conditional logic, demonstrating Pulumi’s capability to handle complex scenarios more effortlessly than Terraform, which excels at static configurations.

### Advanced Example 2: Using existing AWS SDK

Pulumi allows you to utilize the AWS SDK directly within your infrastructure definitions, providing a powerful way to interact with AWS services.

```typescript
import AWS = require("aws-sdk");

bucket.onObjectCreated("onObjectCreated", async (bucketEvent) => {
    const s3 = new AWS.S3();
    const objectKey = bucketEvent.Records[0].s3.object.key;

    // Using AWS SDK to interact with S3
    const data = await s3.getObject({ Bucket: bucket.bucket, Key: objectKey }).promise();
    console.log(data.Body.toString('utf-8'));
});
```

Interacting with the AWS SDK provides more direct control over resources and negates the need for additional HCL configurations, streamlining development significantly.

## Best practices for configuring Lambda S3 event triggers

When configuring Lambda S3 event triggers, consider these best practices:

1. **Enable versioning:** Enable versioning on your S3 buckets to safeguard against accidental overwrites and deletions.
2. **Set appropriate permissions:** Narrow the IAM roles and policies to grant only the necessary permissions.
3. **Implement error handling:** Ensure your Lambda function handles errors gracefully and includes adequate logging for troubleshooting.
4. **Use environment variables:** Manage your configuration and secrets using environment variables in Lambda.

## Conclusion

In this tutorial, we configured AWS Lambda to trigger on S3 events using both Terraform and Pulumi. We highlighted the advantages of Pulumi, such as its full programming language support and flexibility for dynamic configurations. Pulumi enables more powerful and concise infrastructure development, significantly simplifying complex scenarios. 

Ready to supercharge your infrastructure as code? Try Pulumi today!

- **Pulumi official documentation:** [Pulumi](https://www.pulumi.com/docs/)
