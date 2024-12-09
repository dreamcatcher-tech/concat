# Concat

A simple CLI tool that concatenates the contents of specified files, directories, and glob patterns into a single output. Files are wrapped in ASCII armor style headers and footers to clearly delimit them, and an optional `--output` argument allows writing directly to a file.

## Features

- Accepts multiple files, directories, and glob patterns.
- Recursively includes directory contents.
- Outputs file contents with `-----BEGIN FILE ...-----` and `-----END FILE ...-----` delimiters.
- Optional `--output` argument to write output to a file, otherwise prints to stdout.
- Designed for use with Deno and ES modules.
- Useful for passing file contents as a single message (e.g. to an LLM).

## Usage

```sh
concat [options] [file|folder|glob ...]

Options:

--help
Show the help message and exit.

--output FILE
Write output to FILE. If omitted, output goes to stdout.
```
## Examples
### Output all .ts files in current directory to stdout
```sh
concat **/*.ts
```

### Output a mix of files and directories to a file
```sh
concat --output out.txt file1.txt src/
```

## Requirements
Deno (latest stable)

Permissions:
- `--allow-read` to read files
- `--allow-write` if using `--output` option

## Installing as a single CLI command:

```sh
deno install --global --allow-read --allow-write jsr:@artifact/concat
```

After this, `concat` will be available as a system-wide command.
