import readline from 'readline';

function promptUser(prompt: string, options: string[]): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    console.log(prompt);
    options.forEach((option, index) => {
      console.log(`${index + 1}. ${option}`);
    });

    rl.question('Number: ', (answer) => {
      rl.close();
      const choiceIndex = parseInt(answer) - 1;
      if (choiceIndex >= 0 && choiceIndex < options.length) {
        resolve(options[choiceIndex]);
      } else {
        console.log('Invalid choice. Please try again.');
        resolve(promptUser(prompt, options));
      }
    });
  });
}

export default promptUser;