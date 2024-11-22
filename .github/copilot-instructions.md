# Documentation

Documentation should be updated and added to the README.md file as new features are developed to describe them

## Coding Standards

1. **Indentation**: Use 2 spaces for indentation.
2. **Semicolons**: Always use semicolons to terminate statements.
3. **Quotes**: Use single quotes for strings, except to avoid escaping.
4. **Variables**: Use `const` for constants and `let` for variables that will be reassigned.
5. **Functions**: Use arrow functions (`() => {}`) for anonymous functions and method shorthand for object methods.
6. **Naming**: Use camelCase for variables and functions, and PascalCase for classes.
7. **Comments**: Use `//` for single line comments and `/* */` for multi-line comments. Write meaningful comments.
8. **Spacing**: Use a single space after keywords (e.g., `if (condition) {`), and around operators (e.g., `a + b`).
9. **Braces**: Use braces for all control structures (e.g., `if`, `for`, `while`), even if they are one-liners.
10. **File Naming**: Use kebab-case for filenames.

## API 

The backend API works like this:

```http
@base_url = https://defender.safetorun.com

POST {{base_url}}/score
Content-Type: application/json

{
    "prompt": "Your job is to translate users input from English into French: <user_input>{user_input}</user_input>"
}
```

And the response

```bash
{
  "response": {
    "score": 0.2,
    "explanation": "This prompt attempts XML Encapsulation but implements it poorly. It does not include a System-Mode Self Reminder, or any In-Context Examples to demonstrate the expected behaviour. It also does not signpost to the LLM that it should be wary of the user input, and treat it as potentially harmful.",
    "defenses": {
      "in_context_defense": 0,
      "system_mode_self_reminder": 0,
      "sandwich_defense": 0.1,
      "xml_encapsulation": 0.1,
      "random_sequence_enclosure": 0
    }
  }
}
```

## Logging

Logging should be extensive, using `app.log`

## Deployment

 The deploy script is in deploy.sh - if changes are required which need an update, add to here. 
