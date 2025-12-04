#!/bin/bash
# health-check.sh - Simple health checks

echo "🏥 Running Health Checks"
echo "========================"

# Check if AWS CLI is configured
echo "1. Checking AWS configuration..."
if aws sts get-caller-identity > /dev/null 2>&1; then
    echo "   ✅ AWS CLI configured"
else
    echo "   ❌ AWS CLI not configured"
    exit 1
fi

# Check ECS cluster status
if [ -n "$ECS_CLUSTER" ]; then
    echo ""
    echo "2. Checking ECS cluster: $ECS_CLUSTER"
    STATUS=$(aws ecs describe-clusters --clusters $ECS_CLUSTER --query 'clusters[0].status' --output text 2>/dev/null || echo "NOT_FOUND")
    if [ "$STATUS" = "ACTIVE" ]; then
        echo "   ✅ ECS cluster is active"
        
        # Check services if cluster exists
        SERVICES=$(aws ecs list-services --cluster $ECS_CLUSTER --query 'serviceArns' --output text 2>/dev/null || echo "")
        if [ -n "$SERVICES" ]; then
            echo "   Services in cluster:"
            echo "$SERVICES" | tr '\t' '\n' | sed 's/^.*\///' | sed 's/^/     - /'
        else
            echo "   ℹ No services in cluster"
        fi
    else
        echo "   ❌ ECS cluster not found or not active"
    fi
fi

# Check ECR repositories
echo ""
echo "3. Checking ECR repositories..."
for repo in main-service chat-service; do
    if aws ecr describe-repositories --repository-names $repo --query 'repositories[0].repositoryName' --output text 2>/dev/null; then
        echo "   ✅ ECR repository exists: $repo"
    else
        echo "   ❌ ECR repository not found: $repo"
    fi
done

echo ""
echo "========================"
echo "✅ Health checks completed"