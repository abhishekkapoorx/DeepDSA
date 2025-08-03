```bash
# Start services

http://martin-precious-possum.ngrok-free.app

docker-compose -f docker-compose.dev.yml up -d --build watch

docker-compose -f docker-compose.dev.yml --profile tunnel up --build

docker-compose -f docker-compose.dev.yml up -d mongo frontend

# Run Prisma commands inside container
docker-compose -f docker-compose.dev.yml exec frontend npx prisma generate
docker-compose -f docker-compose.dev.yml exec frontend npx prisma db push

```

```bash
git switch workby/raghav

git fetch origin

git merge origin/dev

git stash push -m "WIP: Refactor auth logic"

git stash list

git stash apply

git stash pop

```