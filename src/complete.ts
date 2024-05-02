/*
 * ================================================================================
 * complete: The AI auto-completes your input text (using lmstudio.js)
 * ================================================================================
 *
 * License: MIT
 * Repository: https://github.com/yagil/complete
 *
 * Usage:
 *  npm run start
 *  # or 
 *  ts-node src/complete.ts
 *
 * Pro tip: Use this program in conjunction with the LM Studio CLI (`lms`):
 * - Start the server: `lms server start`
 * - List your models: `lms ls`
 * - See raw input to the model: `lms log stream`
 * - Unload all models: `lms unload --all`
 *
 * (Install `lms` by running `npx lmstudio install-cli`)
 * ================================================================================
 */
import { LMStudioClient } from "@lmstudio/sdk";

async function main() {
    // Connect to LM Studio
    const client = new LMStudioClient();
    
    // Load a model. If you don't have this model, download from the in-app downloader.
    // This program expects a "base model" (not an "instruct fine-tuned" model).
    const model = await client.llm.load("QuantFactory/Meta-Llama-3-8B-GGUF", { 
      config: { gpuOffload: "max" }, // Offload to GPU if available
      preset: "LM Studio Blank Preset", // Good choice for base models
      onProgress: (progress) => { drawProgressAnimation(progress); },
      verbose: false
    });

    // If the model is already loaded, you can get it like this:
    // const model = await client.llm.get("QuantFactory/Meta-Llama-3-8B-GGUF");

    // Clear the loading message
    process.stdout.write("\r\x1b[K");

    // Get user input
    process.stdout.write("\x1b[90mwrite something and press enter...\x1b[0m\n");
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true
  });
  
  rl.question('', async (userInput: string) => {
    readline.moveCursor(process.stdout, userInput.length, -1);
      
    const prediction = model.complete(userInput, { temperature: 0 });

    const ANSI_GREEN = "\x1b[32m";
    const ANSI_RESET = "\x1b[0m";
    process.stdout.write(ANSI_GREEN);
    for await (const text of prediction) {
        process.stdout.write(text);
    }
    process.stdout.write(ANSI_RESET);

      rl.close();
  });  
}

const drawProgressAnimation = async (progress: number) => {
  const frames = ['-', '\\', '|', '/'];
  const frame = frames[Math.floor(Date.now() / 100) % frames.length];
  process.stdout.write(`\r${frame} Model loading: ${(progress * 100).toFixed(2)}%`);
}


main();