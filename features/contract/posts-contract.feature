@epic:Posts @feature:Contract @contract
Feature: OpenAPI contract validation

  @story:ResponseContract @severity:normal
  Scenario: GET post response matches OpenAPI
    When I send a GET request to "/posts/1"
    Then the response status should be 200
    And the response should conform to the OpenAPI spec

  @story:RequestContract
  Scenario: POST post request body matches OpenAPI
    When I send a POST request to "/posts" with body:
      """
      {"title": "contract title", "body": "contract body", "userId": 1}
      """
    Then the response status should be 201
    And the request body should be valid against the OpenAPI spec for "POST" "/posts"
    And the response should conform to the OpenAPI spec
