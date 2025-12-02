// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../src/Demo.sol";

/// @notice Minimal script to call Demo.perform; replace with forge script broadcast when needed.
contract ExecuteDemo {
    Demo public demo;

    constructor(address demoAddress) {
        demo = Demo(payable(demoAddress));
    }

    function exec(bytes calldata action) external payable {
        demo.perform{value: msg.value}(action);
    }
}
