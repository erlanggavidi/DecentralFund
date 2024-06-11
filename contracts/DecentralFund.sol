// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DecentralFund {
    struct Campaign {
        address payable creator;
        string title;
        string description;
        uint targetAmount;
        uint deadline;
        uint amountCollected;
        bool fundsWithdrawn;
    }

    uint public campaignCount;
    mapping(uint => Campaign) public campaigns;
    mapping(uint => mapping(address => uint)) public contributions;

    event CampaignCreated(uint campaignId, string title, uint targetAmount, uint deadline);
    event ContributionReceived(uint campaignId, address contributor, uint amount);
    event FundsWithdrawn(uint campaignId, uint amount);
    event RefundIssued(uint campaignId, address contributor, uint amount);

    modifier onlyCreator(uint _campaignId) {
        require(campaigns[_campaignId].creator == msg.sender, "Not campaign creator");
        _;
    }

    modifier campaignActive(uint _campaignId) {
        require(block.timestamp < campaigns[_campaignId].deadline, "Campaign not active");
        _;
    }

    function createCampaign(string memory _title, string memory _description, uint _targetAmount, uint _deadline) public {
        require(_deadline > block.timestamp, "Invalid deadline");

        campaignCount++;
        campaigns[campaignCount] = Campaign({
            creator: payable(msg.sender),
            title: _title,
            description: _description,
            targetAmount: _targetAmount,
            deadline: _deadline,
            amountCollected: 0,
            fundsWithdrawn: false
        });

        emit CampaignCreated(campaignCount, _title, _targetAmount, _deadline);
    }

    function contribute(uint _campaignId) public payable campaignActive(_campaignId) {
        require(msg.value > 0, "Contribution must be greater than 0");

        Campaign storage campaign = campaigns[_campaignId];
        campaign.amountCollected += msg.value;
        contributions[_campaignId][msg.sender] += msg.value;

        emit ContributionReceived(_campaignId, msg.sender, msg.value);
    }

    function withdrawFunds(uint _campaignId) public onlyCreator(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp > campaign.deadline, "Campaign not ended");
        require(campaign.amountCollected >= campaign.targetAmount, "Funding goal not reached");
        require(!campaign.fundsWithdrawn, "Funds already withdrawn");

        campaign.fundsWithdrawn = true;
        campaign.creator.transfer(campaign.amountCollected);

        emit FundsWithdrawn(_campaignId, campaign.amountCollected);
    }

    function refund(uint _campaignId) public {
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp > campaign.deadline, "Campaign not ended");
        require(campaign.amountCollected < campaign.targetAmount, "Funding goal reached");

        uint contributedAmount = contributions[_campaignId][msg.sender];
        require(contributedAmount > 0, "No contributions found");

        contributions[_campaignId][msg.sender] = 0;
        payable(msg.sender).transfer(contributedAmount);

        emit RefundIssued(_campaignId, msg.sender, contributedAmount);
    }

    function getCampaignDetails(uint _campaignId) public view returns (Campaign memory) {
        return campaigns[_campaignId];
    }
}
