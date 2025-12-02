// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice EOA sponsor helper placeholder.
/// 在本地/测试网通过 EOA 代付时，可用 forge script 调用该脚本为 demo 合约补贴资金。
contract Sponsor {
    address public demo;

    constructor(address demoAddress) {
        demo = demoAddress;
    }

    function fundDemo() external payable {
        (bool ok, ) = demo.call{value: msg.value}("");
        require(ok, "fund failed");
    }
}
