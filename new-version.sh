#! /bin/bash

set -ex

git diff --exit-code --shortstat

DATE=$(date +%Y.%m.%d | sed 's/\.0/./g')
OLDVERSION=$(jq -r ".version" package.json)
OLDINT=$(echo $OLDVERSION | sed 's/^.*-//')
OLDDATE=$(echo $OLDVERSION | sed 's/-.*$//')

INT=1
if [[ ${DATE} == ${OLDDATE} ]]; then
  INT=$(($OLDINT + 1))
fi

VERSION=${DATE}-${INT}
echo $VERSION

jq ".version = \"$VERSION\"" package.json | sponge package.json
jq ".version = \"$VERSION\"" manifest.json | sponge manifest.json

yarn run lint

git commit package.json manifest.json -m "$VERSION"
