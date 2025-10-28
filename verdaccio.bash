set -e

docker rm -vf verdaccio.localhost
container_id=$(docker run --name verdaccio.localhost -d -p 4873:4873 verdaccio/verdaccio)
echo "Started Verdaccio container with ID: $container_id"

pnpm build
cat package.json | jq -r '.version="0.0.1-verdaccio"' > dist/package.json

expect <<'EOF'
  spawn pnpm login --registry http://localhost:4873
  expect "Username:"
  send "test\r"
  expect "Password:"
  send "test\r"
  expect eof
EOF

cd dist
pnpm publish --registry http://localhost:4873 --no-git-checks --tag verdaccio

docker attach $container_id
