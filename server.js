const express = require('express');
const { ethers } = require('ethers');
const app = express();
const port = 3000;

// EJS Setup
app.set('view engine', 'ejs');

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Blockchain Setup
const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
const contractAddress = 'YOUR_CONTRACT_ADDRESS'; // Replace with your deployed contract address
const contractABI = [
  // ABI from your compiled contract
];
const contract = new ethers.Contract(contractAddress, contractABI, provider.getSigner());

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.post('/create-campaign', async (req, res) => {
  const { title, description, targetAmount, deadline } = req.body;
  const signer = provider.getSigner();

  const tx = await contract.connect(signer).createCampaign(title, description, ethers.utils.parseEther(targetAmount), Math.floor(new Date(deadline).getTime() / 1000));
  await tx.wait();

  res.redirect('/');
});

// Additional routes for contribute, withdraw, refund, etc.

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
