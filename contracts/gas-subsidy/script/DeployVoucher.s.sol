// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../src/VoucherNFT.sol";

interface Vm {
    function startBroadcast() external;
    function stopBroadcast() external;
}

/// @notice 部署券 NFT 合约。
contract DeployVoucher {
    Vm internal constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function run() external returns (VoucherNFT voucher) {
        vm.startBroadcast();
        voucher = new VoucherNFT();
        vm.stopBroadcast();
    }
}
