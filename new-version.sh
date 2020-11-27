#! /bin/bash

set -ex

git diff --exit-code --shortstat

VERSION=$(date +%Y.%m.%d | sed 's/\.0/./g')
echo $VERSION

jq ".version = \"$VERSION\"" package.json | sponge package.json
jq ".version = \"$VERSION\"" manifest.json | sponge manifest.json

yarn run lint

git commit package.json manifest.json -m "$VERSION"
