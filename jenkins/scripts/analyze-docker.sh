#!/bin/bash

# analyze-docker.sh - Simple Docker Compose analuzer

echo "Docker Compose Analysis"
echo "=============================="

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "Error: docker-compose.yml not found!"
    exit 1
fi

echo "1. Validating docker-compose.yml..."
docker compose config > /dev/null
if [ $? -eq 0 ]; then
    echo "Valid docker-compose.yml"
else
    echo "Invalid docker-compose.yml"
    exit 1
fi

echo ""
echo "2. Services analysis:"
SERVICES=${docker compose config --services}
COUNT=$(echo "$SERVICES" | wc -l)
echo "  Found $COUNT services:"
echo "$SERVICES" | sed 's/^/ - /'

echo ""
echo "3. Checking port configurations:"
echo "  Exposed ports:"
docker compose ps --services | while read services; do
    ports=$(docker compose port ${service} 2>/dev/null || true)
    if[ -n "$ports" ]; then
        echo "$ports" | sed 's/^/       /'
    fi
done

echo ""
echo "4. Checking for common issues:"
# check for network configurations
NETWORK_COUNT=$(grep -c "networks:" docker-compose.yml || echo "0")
if [ "$NETWORK_COUNT" -gt 0 ]; then
    echo "  Networks configured"
else
    echo " No networks configured"
fi

# Check for restart policies
RESTART_COUNT=$(grep -c "restart:" docker-compose.yml || echo "0")
if [ "$RESTART_COUNT" -gt 0 ]; then
    echo "Restart policies found ($RESTART_COUNT services)"
else
    echo "No restart policies"
fi

# Check for depends_on
DEPENDS_COUNT=$(grep -c "depends_on:" docker-compose.yml || echo "0")
if [ "$DEPENDS_COUNT" -gt 0]; then
    echo "Dependencies configured ($DEPENDS_COUNT services)"
else
    echo "No service dependencies"
fi

echo ""
echo "5. Volume analysis"
VOLUMES=$(docker compose config --volumes 2>/dev/null || true)
if [ -n "$VOLUMES" ]; then
    echo "Volumes:"
    echo "$VOLUMES" |sed 's/^/    - /'
else
    echo "No volumes defined"
fi

echo ""
echo "======================="
echo "Analysis completed"


