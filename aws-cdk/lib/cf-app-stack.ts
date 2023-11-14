import * as cdk from 'aws-cdk-lib'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as iam from 'aws-cdk-lib/aws-iam'
import { Construct } from 'constructs'

export interface CFAppProps extends cdk.StackProps {
  stage: string
  path: string
}
export class CFAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CFAppProps) {
    super(scope, id, props)
    const { stage, path } = props

    const staticWebsiteBucket = new s3.Bucket(
      this,
      `shop-app-bucket-kudim-${stage}`,
      {
        bucketName: `shop-app-kudim-${stage}`,
        websiteIndexDocument: 'index.html',
        websiteErrorDocument: 'index.html',
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        publicReadAccess: false,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
        accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
        autoDeleteObjects: true,
      }
    )

    staticWebsiteBucket.addToResourcePolicy(
      new cdk.aws_iam.PolicyStatement({
        sid: 's3BucketPublicRead ',
        effect: cdk.aws_iam.Effect.ALLOW,
        actions: ['s3:GetObject'],
        principals: [new cdk.aws_iam.AnyPrincipal()],
        resources: [`${staticWebsiteBucket.bucketArn}/*`],
      })
    )

    const distribution = new cloudfront.Distribution(
      this,
      `react-app-cf-kudim-distribution-${stage}`,
      {
        priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
        defaultBehavior: {
          origin: new cdk.aws_cloudfront_origins.S3Origin(staticWebsiteBucket),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        comment: 'Cloudfront distribution for react app',
        defaultRootObject: 'index.html',
      }
    )

    new s3deploy.BucketDeployment(this, `react-app-kudim-deployment-${stage}`, {
      destinationBucket: staticWebsiteBucket,
      sources: [cdk.aws_s3_deployment.Source.asset(path)],
      cacheControl: [
        cdk.aws_s3_deployment.CacheControl.maxAge(cdk.Duration.days(1)),
      ],
      distribution,
    })
  }
}
