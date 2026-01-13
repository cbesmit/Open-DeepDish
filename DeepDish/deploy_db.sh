#!/bin/bash
docker compose exec -T backend npx prisma migrate dev --name init_schema
