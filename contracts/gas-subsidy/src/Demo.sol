// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Demo contract for gas subsidy showcase
/// @notice Emits an event and optionally transfers a small reward to msg.sender when allowed.
contract Demo {
    event ActionPerformed(address indexed sender, uint256 value, string action);

    uint256 public rewardWei;
    address public owner;

    constructor(uint256 _rewardWei) {
        owner = msg.sender;
        rewardWei = _rewardWei;
    }

    function setReward(uint256 _rewardWei) external {
        require(msg.sender == owner, "only owner");
        rewardWei = _rewardWei;
    }

    /// @notice Example action; can be called with or without value. Emits event for frontend tracking.
    function perform(bytes calldata action) external payable {
        if (rewardWei > 0 && address(this).balance >= rewardWei) {
            (bool ok, ) = msg.sender.call{value: rewardWei}("");
            require(ok, "reward transfer failed");
        }
        emit ActionPerformed(msg.sender, msg.value, string(action));
    }

    /// @notice Allow owner/sponsor to deposit funds for reward or gas sponsorship.
    receive() external payable {}
}
