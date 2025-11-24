#!/bin/bash

# Atlantic Proxy Production Deployment Script

set -e

echo "🚀 Starting Atlantic Proxy Production Deployment"

# Check prerequisites
command -v terraform >/dev/null 2>&1 || { echo "❌ Terraform is required but not installed."; exit 1; }
command -v aws >/dev/null 2>&1 || { echo "❌ AWS CLI is required but not installed."; exit 1; }

# Set variables
AWS_REGION=${AWS_REGION:-us-east-1}
INSTANCE_TYPE=${INSTANCE_TYPE:-t3.medium}
KEY_NAME=${KEY_NAME:-atlantic-proxy-key}

echo "📋 Deployment Configuration:"
echo "  Region: $AWS_REGION"
echo "  Instance Type: $INSTANCE_TYPE"
echo "  Key Name: $KEY_NAME"

# Navigate to terraform directory
cd terraform

# Initialize Terraform
echo "🔧 Initializing Terraform..."
terraform init

# Plan deployment
echo "📋 Planning infrastructure..."
terraform plan \
  -var="aws_region=$AWS_REGION" \
  -var="instance_type=$INSTANCE_TYPE" \
  -var="key_name=$KEY_NAME"

# Confirm deployment
read -p "🚀 Deploy infrastructure? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Deploying infrastructure..."
    terraform apply \
      -var="aws_region=$AWS_REGION" \
      -var="instance_type=$INSTANCE_TYPE" \
      -var="key_name=$KEY_NAME" \
      -auto-approve
    
    # Get instance IP
    INSTANCE_IP=$(terraform output -raw instance_ip 2>/dev/null || echo "Check AWS Console")
    
    echo "✅ Deployment completed!"
    echo "🌐 Instance IP: $INSTANCE_IP"
    echo "🔗 Access: http://$INSTANCE_IP"
    echo "📝 SSH: ssh -i ~/.ssh/$KEY_NAME.pem ec2-user@$INSTANCE_IP"
    
    echo "⏳ Services are starting up... This may take 2-3 minutes."
    echo "📊 Check status: docker-compose -f infrastructure/docker-compose.production.yml ps"
else
    echo "❌ Deployment cancelled"
fi