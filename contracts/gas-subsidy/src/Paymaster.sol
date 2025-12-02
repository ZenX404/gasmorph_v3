// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Placeholder paymaster config used for演示；未实现 ERC-4337 验证逻辑。
/// 后续可替换为真实 ERC-4337 Paymaster 实现。
contract PaymasterConfig {
    address public sponsor;
    uint256 public maxGasPrice;

    event SponsorUpdated(address indexed sponsor);
    event MaxGasPriceUpdated(uint256 maxGasPrice);

    constructor(address _sponsor, uint256 _maxGasPrice) {
        sponsor = _sponsor;
        maxGasPrice = _maxGasPrice;
    }

    function updateSponsor(address _sponsor) external {
        sponsor = _sponsor;
        emit SponsorUpdated(_sponsor);
    }

    function updateMaxGasPrice(uint256 _maxGasPrice) external {
        maxGasPrice = _maxGasPrice;
        emit MaxGasPriceUpdated(_maxGasPrice);
    }
}
