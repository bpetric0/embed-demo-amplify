import * as cdk from '@aws-cdk/core';
import * as AmplifyHelpers from '@aws-amplify/cli-extensibility-helper';
import * as rds from '@aws-cdk/aws-rds';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as agw from '@aws-cdk/aws-apigatewayv2';
import * as integrations from '@aws-cdk/aws-apigatewayv2-integrations'
import { AmplifyDependentResourcesAttributes } from '../../types/amplify-dependent-resources-ref';

declare const vpc: ec2.Vpc;
const lambda = require('@aws-cdk/aws-lambda');

export class cdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps, amplifyResourceProps?: AmplifyHelpers.AmplifyResourceProps) {
    super(scope, id, props);
    /* Do not remove - Amplify CLI automatically injects the current deployment environment in this input parameter */
    new cdk.CfnParameter(this, 'env', {
      type: 'String',
      description: 'Current Amplify CLI env name',
    });
      const vpc = new ec2.Vpc(this, 'AuroraVPC');
      const cluster = new rds.ServerlessCluster(this, 'AuroraCluster', {
          engine: rds.DatabaseClusterEngine.AURORA_POSTGRESQL,
          parameterGroup: rds.ParameterGroup.fromParameterGroupName(this, 'AuroraClusterPG', 'default.aurora-postgresql10'),
          defaultDatabaseName: 'test',
          vpc,
          scaling: { autoPause: cdk.Duration.seconds(0) }
      });

      const postFn = new lambda.Function(this, 'PostFunction', {
          runtime: lambda.Runtime.NODEJS_12_X,
          code: lambda.Code.fromAsset('lambda-functions'),
          handler: 'index.handler',
          memorySize: 1024,
          environment: {
              CLUSTER_ARN: cluster.clusterArn,
              SECRET_ARN: cluster.secret?.secretArn || '',
              DB_NAME: 'test',
              AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
              
          }
      });

      let api = new agw.HttpApi(this, 'Endpoint', {
          defaultIntegration: new integrations.HttpLambdaIntegration('TestIntegration', postFn)
      });

      cluster.grantDataApiAccess(postFn);
      new cdk.CfnOutput(this, 'HTTP API URL', {
        value: api.url ?? "Something went wrong...",
      });
  }
}