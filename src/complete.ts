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
import { LLMDynamicHandle, LLMSpecificModel, LMStudioClient } from "@lmstudio/sdk";

// For terminal colors
const ANSI_GREEN = "\x1b[32m";
const ANSI_GRAY = "\x1b[90m";
const ANSI_PURPLE = "\x1b[35m";
const ANSI_RESET = "\x1b[0m";

async function main() {
    // Connect to LM Studio
    const client = new LMStudioClient();
    
    const modelPath = "QuantFactory/Meta-Llama-3-8B-GGUF";
    const currentlyLoadedModels = await client.llm.listLoaded();
    const modelIsLoaded = currentlyLoadedModels.filter((model) => model.path.startsWith(modelPath)).length > 0;

    let model: LLMSpecificModel|LLMDynamicHandle;

    if (!modelIsLoaded) {
      console.log("Model not loaded. Loading model...");
      // Load a model. If you don't have this model, download from the in-app downloader.
      // This program expects a "base model" (not an "instruct fine-tuned" model).
      model = await client.llm.load(modelPath, { 
        config: { gpuOffload: "max" }, // Offload to GPU if available
        preset: "LM Studio Blank Preset", // Good choice for base models
        onProgress: (progress) => { drawProgressAnimation(progress); },
        verbose: false,
        noHup: true // Use the 'noHup' field to keep the model loaded after the client exits
      });
      
    } else {
      console.log(`${ANSI_PURPLE}[Model already loaded. You're good to go]${ANSI_RESET}`);
      model = await client.llm.get(modelPath);
    }

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