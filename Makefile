BOARD ?= default
USERNAME_BOOST ?= alice,bob,charlie

stresstest:
	BOARD=$(BOARD) USERNAME_BOOST=$(USERNAME_BOOST) k6 run scripts/stresstest.js

test:
	npm run test:coverage
