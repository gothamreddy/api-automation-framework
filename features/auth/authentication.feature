@epic:Auth @feature:ProtectedRoutes @auth @negative
Feature: Mock auth server authentication and authorization

  @story:NoToken @severity:critical
  Scenario: Reject request without token
    Given I am not authenticated
    When I send a GET request to auth path "/protected/admin"
    Then the response status should be 401
    And the response body should match schema "Error"

  @story:ExpiredToken
  Scenario: Reject expired token
    Given I use an expired token
    When I send a GET request to auth path "/protected/admin"
    Then the response status should be 401

  @story:MalformedToken
  Scenario: Reject malformed token
    Given I use a malformed token
    When I send a GET request to auth path "/protected/admin"
    Then the response status should be 401

  @story:WrongRole @severity:normal
  Scenario: Reject viewer accessing admin resource
    Given I am authenticated as "viewer" for auth API
    When I send a GET request to auth path "/protected/admin"
    Then the response status should be 403
    And the response body should match schema "Error"

  @smoke @story:ValidAdminToken
  Scenario: Admin can access protected admin resource
    Given I am authenticated as "admin" for auth API
    When I send a GET request to auth path "/protected/admin"
    Then the response status should be 200
    And the access token should contain claim "role" with value "admin"
