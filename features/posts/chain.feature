@epic:Posts @feature:Chaining @regression
Feature: Chained requests with saved variables

  @story:CreateAndFetch
  Scenario: Fetch a post using an id saved from a previous response
    When I send a GET request to "/posts/1"
    Then the response status should be 200
    And I save response field "id" as "postId"
    When I send a GET request to "/posts/{postId}"
    Then the response status should be 200
    And the response body should match schema "Post"
