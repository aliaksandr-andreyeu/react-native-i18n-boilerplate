import inquirer from 'inquirer';
import { exec } from 'child_process';

let deeplinks = [
  'amegacapital://verificationProgress',
  'amegacapital://deposit',
  'https://client.amega.capital/verify-profile',
  'https://client.amega.capital/deposit',
  'https://client.amega.capital/links/go/1244',
  'https://client.amega.capital/links/go/814',
  'amegacapital://verifyEmail',
  'amegacapital://assetCategory/Forex%5CFX_Minor',
  'amegacapital://assetCategory/Forex%5CFX_Exotic'
];

const validFlags = ['--android', '--ios'];
const args = process.argv.slice(2);

const runCommand = async () => {
  const preselectedOption = args[0];
  let platformFlag = args.find((arg) => validFlags.includes(arg));

  if (preselectedOption && !validFlags.includes(preselectedOption)) {
    deeplinks = deeplinks.filter((item) => item.includes(preselectedOption));
    if (!deeplinks.length) console.error(`Nothing found for '${preselectedOption}' search key`);
  }

  const { option } = await inquirer.prompt([
    {
      type: 'list',
      name: 'option',
      message: 'Select a deeplink:',
      choices: deeplinks
    }
  ]);

  if (!platformFlag) {
    const { platform } = await inquirer.prompt([
      {
        type: 'list',
        name: 'platform',
        message: 'Select a platform:',
        choices: ['--ios', '--android']
      }
    ]);
    platformFlag = platform;
  }

  const process = exec(`npx uri-scheme open "${option}" ${platformFlag}`);

  process.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  process.stderr.on('data', (data) => {
    console.error(data.toString());
  });

  process.on('close', (code) => {
    console.log(`Command exited with code ${code}`);
  });
};

runCommand();
