BOARD ?= default
USERNAME_BOOST ?= alice,bob,charlie

stresstest:
	BOARD=$(BOARD) USERNAME_BOOST=$(USERNAME_BOOST) k6 run scripts/stresstest.js;

test:
	npm run test:coverage;

cluster:
	docker compose -f docker-compose.cluster.yaml up -d redis-cluster-creator;
	sleep 15;
	docker compose -f docker-compose.cluster.yaml up backend