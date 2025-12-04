#!/bin/bash
# deploy-ecs.sh - Deploy to AWS ECS

set -e

# Get parameters
IMAGE_TAG=${1:-"latest"}
AWS_REGION=${2:-"us-east-1"}
ECS_CLUSTER=${3:-"chat-app-cluster"}
ECS_SERVICE=${4:-"chat-app-service"}

echo "🚀 Starting ECS Deployment"
echo "=========================="

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "AWS Account: $AWS_ACCOUNT_ID"
echo "Region: $AWS_REGION"
echo "Cluster: $ECS_CLUSTER"
echo "Service: $ECS_SERVICE"
echo "Image Tag: $IMAGE_TAG"

# ECR repository URLs
ECR_MAIN="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/main-service"
ECR_CHAT="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/chat-service"

echo ""
echo "1. Creating/updating ECS task definition..."

# Create task definition JSON
TASK_DEF_JSON=$(cat <<EOF
{
    "family": "chat-app-task",
    "networkMode": "awsvpc",
    "executionRoleArn": "arn:aws:iam::${AWS_ACCOUNT_ID}:role/ecsTaskExecutionRole",
    "containerDefinitions": [
        {
            "name": "main-service",
            "image": "${ECR_MAIN}:${IMAGE_TAG}",
            "portMappings": [
                {
                    "containerPort": 3001,
                    "protocol": "tcp"
                }
            ],
            "essential": true,
            "environment": [
                {"name": "NODE_ENV", "value": "production"},
                {"name": "DB_HOST", "value": "your-rds-endpoint"},
                {"name": "DB_PORT", "value": "5432"},
                {"name": "KAFKA_BROKERS", "value": "your-msk-bootstrap:9092"}
            ],
            "secrets": [
                {"name": "DB_PASSWORD", "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/chat-app/db-password"},
                {"name": "JWT_SECRET", "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/chat-app/jwt-secret"}
            ],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/chat-app",
                    "awslogs-region": "${AWS_REGION}",
                    "awslogs-stream-prefix": "main-service"
                }
            }
        },
        {
            "name": "chat-service",
            "image": "${ECR_CHAT}:${IMAGE_TAG}",
            "essential": true,
            "environment": [
                {"name": "NODE_ENV", "value": "production"},
                {"name": "CHAT_DB_HOST", "value": "chat-app-db.c2ufmocxlrzj.us-east-1.rds.amazonaws.com"},
                {"name": "CHAT_DB_PORT", "value": "5432"},
                {"name": "KAFKA_BROKERS", "value": "b-1.chatappkafka.tgv5od.c12.kafka.us-east-1.amazonaws.com:9098,b-2.chatappkafka.tgv5od.c12.kafka.us-east-1.amazonaws.com:9098,b-3.chatappkafka.tgv5od.c12.kafka.us-east-1.amazonaws.com:9098"}
            ],
            "secrets": [
                {"name": "CHAT_DB_PASSWORD", "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/chat-app/chat-db-password"},
                {"name": "JWT_SECRET", "valueFrom": "arn:aws:ssm:${AWS_REGION}:${AWS_ACCOUNT_ID}:parameter/chat-app/jwt-secret"}
            ],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/chat-app",
                    "awslogs-region": "${AWS_REGION}",
                    "awslogs-stream-prefix": "chat-service"
                }
            }
        }
    ],
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "1024",
    "memory": "2048"
}
EOF
)

# Register task definition
echo "Registering task definition..."
TASK_DEF=$(aws ecs register-task-definition \
    --cli-input-json "$TASK_DEF_JSON" \
    --region $AWS_REGION)

TASK_DEF_ARN=$(echo $TASK_DEF | jq -r '.taskDefinition.taskDefinitionArn')
echo "Task definition ARN: $TASK_DEF_ARN"

echo ""
echo "2. Checking ECS cluster..."

# Create cluster if it doesn't exist
if ! aws ecs describe-clusters --clusters $ECS_CLUSTER --region $AWS_REGION --query 'clusters[0].status' --output text 2>/dev/null | grep -q "ACTIVE"; then
    echo "Creating ECS cluster: $ECS_CLUSTER"
    aws ecs create-cluster --cluster-name $ECS_CLUSTER --region $AWS_REGION
else
    echo "ECS cluster exists: $ECS_CLUSTER"
fi

echo ""
echo "3. Updating ECS service..."

# Update service if it exists, otherwise create it
if aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE --region $AWS_REGION --query 'services[0].status' --output text 2>/dev/null | grep -q "ACTIVE"; then
    echo "Updating existing service: $ECS_SERVICE"
    aws ecs update-service \
        --cluster $ECS_CLUSTER \
        --service $ECS_SERVICE \
        --task-definition chat-app-task \
        --region $AWS_REGION \
        --force-new-deployment
else
    echo "Creating new service: $ECS_SERVICE"
    echo "⚠ Note: You need to configure VPC, subnets, and load balancer first"
    echo "Run this command manually with proper VPC configuration:"
    echo ""
    echo "aws ecs create-service \\"
    echo "    --cluster $ECS_CLUSTER \\"
    echo "    --service-name $ECS_SERVICE \\"
    echo "    --task-definition chat-app-task \\"
    echo "    --desired-count 2 \\"
    echo "    --launch-type FARGATE \\"
    echo "    --platform-version LATEST \\"
    echo "    --deployment-configuration 'maximumPercent=200,minimumHealthyPercent=100' \\"
    echo "    --network-configuration 'awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}' \\"
    echo "    --region $AWS_REGION"
    
    # Exit with warning but not error
    echo ""
    echo "ℹ Please configure VPC settings and run the create-service command above"
fi

echo ""
echo "4. Waiting for deployment to complete..."

# Wait for service to stabilize if it exists
if aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE --region $AWS_REGION --query 'services[0].status' --output text 2>/dev/null | grep -q "ACTIVE"; then
    echo "Waiting for service to stabilize..."
    aws ecs wait services-stable \
        --cluster $ECS_CLUSTER \
        --services $ECS_SERVICE \
        --region $AWS_REGION
    
    echo "✅ Deployment completed successfully!"
    
    # Show service status
    echo ""
    echo "Service status:"
    aws ecs describe-services \
        --cluster $ECS_CLUSTER \
        --services $ECS_SERVICE \
        --region $AWS_REGION \
        --query 'services[0].[status,runningCount,desiredCount]' \
        --output text | awk '{print "Status: "$1"\nRunning: "$2"\nDesired: "$3}'
else
    echo "ℹ Service not created yet. Please run the create-service command shown above."
fi

echo ""
echo "=========================="
echo "🚀 Deployment process completed"