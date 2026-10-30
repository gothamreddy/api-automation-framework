@epic:Posts @feature:CRUD
Feature: Posts CRUD on JSONPlaceholder

  Background:
    Given the request header "Content-Type" is "application/json"

  @smoke @regression @story:GetPost @severity:critical
  Scenario: Get a post by id
    When I send a GET request to "/posts/1"
    Then the response status should be 200
    And the response body field "id" should equal "1"
    And the response body should match schema "Post"
    And the response time should be under 5000 ms

  @regression @story:CreatePost
  Scenario: Create a post
    When I send a POST request to "/posts" with body:
      """
      {"title": "bdd title", "body": "bdd body", "userId": 1}
      """
    Then the response status should be 201
    And the response body should match schema "PostCreateResponse"
    And the request body should be valid against the OpenAPI spec for "POST" "/posts"

  @regression @story:UpdatePost
  Scenario: Update a post
    When I send a PUT request to "/posts/1" with body:
      """
      {"id": 1, "title": "updated", "body": "updated body", "userId": 1}
      """
    Then the response status should be 200
    And the response body field "title" should equal "updated"

  @regression @story:PatchPost
  Scenario: Patch a post
    When I send a PATCH request to "/posts/1" with body:
      """
      {"title": "patched title"}
      """
    Then the response status should be 200
    And the response body field "title" should equal "patched title"

  @regression @story:DeletePost
  Scenario: Delete a post
    When I send a DELETE request to "/posts/1"
    Then the response status should be 200

  @smoke @regression @story:PostsOutline
  Scenario Outline: Get posts by id from examples
    When I send a GET request to "/posts/<postId>"
    Then the response status should be 200
    And the response body field "id" should equal "<postId>"

    Examples:
      | postId |
      | 1      |
      | 2      |
      | 3      |
