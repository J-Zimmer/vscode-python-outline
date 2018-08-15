# vscode-python-outline

This extension for Visual Studio Code adds support for the Outline View for the python language.

# Features

* imports
* classes
* class methods
* functions

## Known Issues

- Parser is currently very basic and line based, there may be quite a few parsing errors.
- Multi line strings are not parsed correctly and if they contain imports, defs, or classes they will be added to the outline.
- End of line \ is not handled potentially breaking parsing of multi line statements.

## Release Notes

### 0.0.1

Initial release

---