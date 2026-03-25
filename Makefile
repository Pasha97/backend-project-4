install:
	npm ci

page-loader:
	node bin/page-loader.js -h

publish:
	npm publish --dry-run

lint:
	npx eslint .

lintfix:
	npx eslint . --fix

test:
	npm run test

test-coverage:
	npm run test:coverage
