const { expect } = require("chai");

describe("DecentralFund", function () {
  let DecentralFund, decentralFund, owner, addr1, addr2;

  beforeEach(async function () {
    DecentralFund = await ethers.getContractFactory("DecentralFund");
    [owner, addr1, addr2, _] = await ethers.getSigners();
    decentralFund = await DecentralFund.deploy();
    await decentralFund.deployed();
  });

  describe("Create Campaign", function () {
    it("Should create a campaign", async function () {
      await decentralFund.createCampaign("Test Campaign", "Description", ethers.utils.parseEther("1"), (Date.now() + 3600));
      const campaign = await decentralFund.getCampaignDetails(1);
      expect(campaign.title).to.equal("Test Campaign");
    });
  });

  describe("Contribute to Campaign", function () {
    it("Should allow contributions", async function () {
      await decentralFund.createCampaign("Test Campaign", "Description", ethers.utils.parseEther("1"), (Date.now() + 3600));
      await decentralFund.connect(addr1).contribute(1, { value: ethers.utils.parseEther("0.5") });
      const campaign = await decentralFund.getCampaignDetails(1);
      expect(campaign.amountCollected).to.equal(ethers.utils.parseEther("0.5"));
    });
  });

  describe("Withdraw Funds", function () {
    it("Should allow creator to withdraw funds if goal met", async function () {
      await decentralFund.createCampaign("Test Campaign", "Description", ethers.utils.parseEther("1"), (Date.now() + 3600));
      await decentralFund.connect(addr1).contribute(1, { value: ethers.utils.parseEther("1") });
      await network.provider.send("evm_increaseTime", [3600]);
      await network.provider.send("evm_mine");
      await expect(decentralFund.withdrawFunds(1)).to.changeEtherBalance(owner, ethers.utils.parseEther("1"));
    });
  });

  describe("Refund", function () {
    it("Should refund contributors if goal not met", async function () {
      await decentralFund.createCampaign("Test Campaign", "Description", ethers.utils.parseEther("1"), (Date.now() + 3600));
      await decentralFund.connect(addr1).contribute(1, { value: ethers.utils.parseEther("0.5") });
      await network.provider.send("evm_increaseTime", [3600]);
      await network.provider.send("evm_mine");
      await expect(decentralFund.connect(addr1).refund(1)).to.changeEtherBalance(addr1, ethers.utils.parseEther("0.5"));
    });
  });
});
