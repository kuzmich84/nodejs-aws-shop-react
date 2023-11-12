#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { CFAppStack } from '../lib/cf-app-stack'
import 'dotenv/config'
import * as path from 'path'

const app = new cdk.App()
new CFAppStack(app, 'CFAppStack', {
  env: {
    account: process.env.AWS_ACCOUNT_NUMBER,
    region: process.env.AWS_ACCOUNT_REGION,
  },
  stage: process.env.STAGE!,
  path: path.join(__dirname, '..', '..', 'dist'),
})
