// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../src/Demo.sol";

contract DemoTest {
    Demo demo;

    constructor() {
        demo = new Demo(0);
    }

    function testPerformEmits() public {
        demo.perform(bytes("hello"));
        // 如果执行到此处未revert，则视为通过；可在后续接入 forge-std 事件断言。
    }
}
