// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../src/VoucherNFT.sol";

contract VoucherNFTTest {
    VoucherNFT voucher;

    constructor() {
        voucher = new VoucherNFT();
    }

    function testIssueSingleVoucher() public {
        uint256 tokenId = voucher.issueVoucher(address(this), VoucherNFT.VoucherKind.Single);
        (VoucherNFT.VoucherData memory data, address owner) = voucher.getVoucher(tokenId);
        require(owner == address(this), "owner mismatch");
        require(data.kind == VoucherNFT.VoucherKind.Single, "kind mismatch");
        require(data.usesRemaining == 1, "uses mismatch");
    }

    function testIssueTimeWindowVoucher() public {
        uint256 tokenId = voucher.issueVoucher(address(this), VoucherNFT.VoucherKind.TimeWindow1m);
        (VoucherNFT.VoucherData memory data, ) = voucher.getVoucher(tokenId);
        require(data.durationSeconds == 60, "duration mismatch");
    }

    function testTransferVoucher() public {
        address bob = address(0xB0B);
        uint256 tokenId = voucher.issueVoucher(address(this), VoucherNFT.VoucherKind.Single);
        voucher.transferFrom(address(this), bob, tokenId);
        require(voucher.ownerOf(tokenId) == bob, "transfer failed");
    }

    function testBurnVoucher() public {
        uint256 tokenId = voucher.issueVoucher(address(this), VoucherNFT.VoucherKind.Single);
        voucher.burn(tokenId);
        bool reverted = false;
        try voucher.ownerOf(tokenId) returns (address) {
            reverted = false;
        } catch {
            reverted = true;
        }
        require(reverted, "burn failed");
    }

    function testConsumeVoucherBurns() public {
        uint256 tokenId = voucher.issueVoucher(address(this), VoucherNFT.VoucherKind.Single);
        voucher.consume(tokenId);
        bool reverted = false;
        try voucher.ownerOf(tokenId) returns (address) {
            reverted = false;
        } catch {
            reverted = true;
        }
        require(reverted, "consume should burn");
    }
}
