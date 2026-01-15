set -e

docker rm -vf verdaccio.localhost
container_id=$(docker run --name verdaccio.localhost -d -p 4873:4873 verdaccio/verdaccio)
echo "Started Verdaccio container with ID: $container_id"

pnpm build

NAME=$(jq -r .name package.json)
VERSION=$RANDOM
jq --arg v "0.0.$VERSION" '.version = $v' package.json > dist/package.json

expect <<'EOF'
  spawn pnpm login --registry http://localhost:4873
  expect "Username:"
  send "test\r"
  expect "Password:"
  send "test\r"
  expect eof
EOF

cd dist
TAG="verdaccio-$VERSION"
pnpm publish --registry http://localhost:4873 --no-git-checks --tag $TAG
INSTALL_COMMAND="pnpm rm $NAME && pnpm add $NAME@$TAG --registry http://localhost:4873"
echo "$INSTALL_COMMAND" | pbcopy
echo "Copied to clipboard: $INSTALL_COMMAND"

docker attach $container_id
