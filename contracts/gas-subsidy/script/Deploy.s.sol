// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../src/Demo.sol";

// Minimal forge script without external deps; uses the standard hevm cheatcode address.
interface Vm {
    function startBroadcast() external;
    function stopBroadcast() external;
}

contract Deploy {
    Vm internal constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    /// @notice Deploy Demo contract. Reward defaults为 0 wei，可在链上调用 setReward 调整。
    function run() external returns (Demo demo) {
        vm.startBroadcast();
        demo = new Demo(0);
        vm.stopBroadcast();
    }
}
