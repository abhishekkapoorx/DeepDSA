```bash
# Start services
docker-compose -f docker-compose.dev.yml up -d mongo frontend

# Run Prisma commands inside container
docker-compose -f docker-compose.dev.yml exec frontend npx prisma generate
docker-compose -f docker-compose.dev.yml exec frontend npx prisma db push

```