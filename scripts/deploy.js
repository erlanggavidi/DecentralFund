const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("Account balance:", balance.toString());

  const DecentralFund = await ethers.getContractFactory("DecentralFund");
  const decentralFund = await DecentralFund.deploy();
  await decentralFund.deployed();

  console.log("DecentralFund deployed to:", decentralFund.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
