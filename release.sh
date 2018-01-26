#!/bin/bash

parcel build src/index.html -d docs --public-url "/globalgamejam2018/"
git add docs/
git commit -m "Public Release"
git push