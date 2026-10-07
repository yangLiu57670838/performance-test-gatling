import { csv, exec, jmesPath, scenario, simulation, StringBody } from "@gatling.io/core";
import { http, status } from "@gatling.io/http";
import { injectionProfile } from "./config/loadProfiles";
import { intParam, param } from "./config/params";
import { getTarget } from "./config/targets";
import { defaultAssertions } from "./lib/assertions";
import { httpProtocolFor } from "./lib/protocol";

/**
 * Example of a hand-written, stateful user journey: data from a CSV feeder, values
 * extracted from one response (`saveAs`) and reused in following requests.
 *
 *   npx gatling run --typescript --simulation userJourney profile=load users=2
 */
export default simulation((setUp) => {
  const target = getTarget(param("target", "jsonplaceholder"));
  const users = csv("data/users.csv").circular();

  const browse = exec(
    http("get user").get("/users/#{userId}").check(status().is(200)),
    http("list user posts")
      .get("/posts")
      .queryParam("userId", "#{userId}")
      .check(status().is(200), jmesPath("[0].id").saveAs("postId"))
  )
    .pause(1, 2)
    .exec(http("get post comments").get("/posts/#{postId}/comments").check(status().is(200)));

  const publish = exec(
    http("create post")
      .post("/posts")
      .body(StringBody('{"title":"#{title}","body":"written by gatling","userId":#{userId}}'))
      .asJson()
      .check(status().is(201), jmesPath("id").saveAs("newPostId"))
  );

  const journey = scenario("user journey").feed(users).exec(browse).pause(1, 3).exec(publish);

  setUp(journey.injectOpen(...injectionProfile()).protocols(httpProtocolFor(target)))
    .assertions(...defaultAssertions())
    .maxDuration(intParam("maxDuration", 4 * 3600));
});
