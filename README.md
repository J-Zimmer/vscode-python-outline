# vscode-python-outline

This extension for Visual Studio Code adds support for the Outline View for the python language.

# Features

* imports
* classes
* class methods
* functions

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Known Issues

- Parser is currently very basic and line based, there may be quite a few parsing errors.
- Multi line strings are not parsed correctly and if they contain imports, defs, or classes they will be added to the outline.
- End of line \ is not handled potentially breaking parsing of multi line statements.

## Release Notes

### 0.0.1

Initial release

---