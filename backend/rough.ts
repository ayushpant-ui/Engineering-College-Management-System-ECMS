import  bcrypt from 'bcrypt';

async function main() {
  const passwordHash = await bcrypt.hash('Student@123', 12);
  console.log(passwordHash);
}

main();