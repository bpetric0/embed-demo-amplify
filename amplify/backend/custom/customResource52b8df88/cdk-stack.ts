import * as cdk from '@aws-cdk/core';
import * as AmplifyHelpers from '@aws-amplify/cli-extensibility-helper';
import * as rds from '@aws-cdk/aws-rds';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as lambda from '@aws-cdk/aws-lambda';
import * as agw from '@aws-cdk/aws-apigatewayv2';
import * as integrations from '@aws-cdk/aws-apigatewayv2-integrations'
import { AmplifyDependentResourcesAttributes } from '../../types/amplify-dependent-resources-ref';

declare const vpc: ec2.Vpc;

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
          scaling: { autoPause: cdk.Duration.seconds(0)
      });
}