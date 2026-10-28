import * as bcrypt from 'bcrypt';

async function main() {
  const temporaryPassword = 'Student@123';

  const passwordHash = await bcrypt.hash(temporaryPassword, 12);

  console.log('Bcrypt hash:');
  console.log(passwordHash);
}

main().catch(console.error);