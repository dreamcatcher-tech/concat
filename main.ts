#!/usr/bin/env -S deno run --allow-read --allow-write
import { expandGlob } from "@std/fs";
import type {  Writer } from "@std/io";
import { relative } from "@std/path";

async function printHelp(): Promise<void> {
  console.log(`Usage:
  concat [options] [file|folder|glob ...]

Options:
  --help        Show this help message and exit.
  --output FILE Write output to FILE instead of stdout.

If no --output is provided, output is written to stdout.
If directories are provided, their contents are included recursively.
Glob patterns are expanded to include matched files recursively.`);
}

async function main() {
  const args = [...Deno.args];
  if (!args.length || args.includes("--help")) {
    await printHelp();
    Deno.exit(0);
  }

  let outputFile: string | undefined;
  let outputFileIndex = args.indexOf("--output");
  if (outputFileIndex !== -1) {
    // Check if an output file is specified after --output
    if (args.length <= outputFileIndex + 1) {
      console.error("Error: --output specified but no file provided.");
      Deno.exit(1);
    }
    outputFile = args[outputFileIndex + 1];
    args.splice(outputFileIndex, 2);
  }

  // The remaining args are patterns
  const patternsRaw = args;
  if (!Array.isArray(patternsRaw)) {
    console.error("Error: Patterns must be strings.");
    Deno.exit(1);
  }
  const patterns = [...patternsRaw] as const;

  // Convert directories into glob patterns
  const expandedPatterns: string[] = [];
  for (const pat of patterns) {
    try {
      const stat = await Deno.stat(pat);
      if (stat.isDirectory) {
        expandedPatterns.push(`${pat}/**/*`);
      } else {
        expandedPatterns.push(pat);
      }
    } catch {
      // If stat fails, treat as a pattern anyway
      expandedPatterns.push(pat);
    }
  }

  let out: Writer & { close(): void };
  if (outputFile) {
    out = await Deno.open(outputFile, { write: true, create: true, truncate: true });
  } else {
    out = Deno.stdout;
  }

  const enc = new TextEncoder();
  for (const pattern of expandedPatterns) {
    for await (const file of expandGlob(pattern)) {
      if (file.isFile) {
        const data = await Deno.readTextFile(file.path);
        const relativePath = relative(Deno.cwd(), file.path);
        await out.write(enc.encode(
          `-----BEGIN FILE ${relativePath}-----\n${data}\n-----END FILE ${relativePath}-----\n`
        ));
      }
    }
  }

  if (outputFile) out.close();
}

main();
