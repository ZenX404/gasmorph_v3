// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title GasMorph 券 NFT
/// @notice 用于补贴演示的券 NFT（铸造/转移/销毁）。
contract VoucherNFT {
    enum VoucherKind {
        Single,
        TimeWindow1m,
        TimeWindow2h,
        TimeWindow7d
    }

    struct VoucherData {
        VoucherKind kind;
        uint64 issuedAt;
        uint64 durationSeconds;
        uint32 usesRemaining;
    }

    string public name = "GasMorph Voucher";
    string public symbol = "GMV";

    uint256 private _nextTokenId = 1;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    mapping(uint256 => VoucherData) private _voucherData;
    mapping(address => uint256[]) private _ownedTokens;
    mapping(uint256 => uint256) private _ownedTokensIndex;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    event VoucherIssued(address indexed to, uint256 indexed tokenId, VoucherKind kind, uint256 durationSeconds, uint256 usesRemaining);
    event VoucherConsumed(uint256 indexed tokenId, uint256 usesRemaining);
    event VoucherBurned(uint256 indexed tokenId);

    error NotOwnerOrApproved();
    error InvalidOwner();
    error InvalidRecipient();
    error TokenNotFound();
    error InvalidApproval();
    error NoUsesRemaining();
    error OnlySingleVoucher();

    function balanceOf(address owner) public view returns (uint256) {
        if (owner == address(0)) revert InvalidOwner();
        return _balances[owner];
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = _owners[tokenId];
        if (owner == address(0)) revert TokenNotFound();
        return owner;
    }

    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        if (owner == address(0)) revert InvalidOwner();
        return _ownedTokens[owner];
    }

    function getApproved(uint256 tokenId) public view returns (address) {
        if (!_exists(tokenId)) revert TokenNotFound();
        return _tokenApprovals[tokenId];
    }

    function isApprovedForAll(address owner, address operator) public view returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    function approve(address to, uint256 tokenId) public {
        address owner = ownerOf(tokenId);
        if (to == owner) revert InvalidApproval();
        if (msg.sender != owner && !isApprovedForAll(owner, msg.sender)) revert NotOwnerOrApproved();
        _tokenApprovals[tokenId] = to;
        emit Approval(owner, to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) public {
        if (operator == msg.sender) revert InvalidApproval();
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        if (!_isApprovedOrOwner(msg.sender, tokenId)) revert NotOwnerOrApproved();
        if (ownerOf(tokenId) != from) revert InvalidOwner();
        if (to == address(0)) revert InvalidRecipient();

        _approve(address(0), tokenId);
        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;
        _removeTokenFromOwnerEnumeration(from, tokenId);
        _addTokenToOwnerEnumeration(to, tokenId);
        emit Transfer(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public {
        safeTransferFrom(from, to, tokenId, "");
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public {
        transferFrom(from, to, tokenId);
        if (to.code.length > 0) {
            require(
                IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, data) ==
                    IERC721Receiver.onERC721Received.selector,
                "unsafe recipient"
            );
        }
    }

    function issueVoucher(address to, VoucherKind kind) external returns (uint256 tokenId) {
        if (to == address(0)) revert InvalidRecipient();
        tokenId = _nextTokenId++;
        _mint(to, tokenId);

        VoucherData storage data = _voucherData[tokenId];
        data.kind = kind;
        data.issuedAt = uint64(block.timestamp);

        if (kind == VoucherKind.Single) {
            data.usesRemaining = 1;
        } else {
            data.durationSeconds = uint64(_durationFor(kind));
        }

        emit VoucherIssued(to, tokenId, kind, data.durationSeconds, data.usesRemaining);
    }

    function consume(uint256 tokenId) external {
        if (!_isApprovedOrOwner(msg.sender, tokenId)) revert NotOwnerOrApproved();
        VoucherData storage data = _voucherData[tokenId];
        if (data.kind != VoucherKind.Single) revert OnlySingleVoucher();
        if (data.usesRemaining == 0) revert NoUsesRemaining();

        data.usesRemaining -= 1;
        emit VoucherConsumed(tokenId, data.usesRemaining);

        if (data.usesRemaining == 0) {
            _burn(tokenId);
            emit VoucherBurned(tokenId);
        }
    }

    function burn(uint256 tokenId) external {
        if (!_isApprovedOrOwner(msg.sender, tokenId)) revert NotOwnerOrApproved();
        _burn(tokenId);
        emit VoucherBurned(tokenId);
    }

    function getVoucher(uint256 tokenId) external view returns (VoucherData memory data, address owner) {
        if (!_exists(tokenId)) revert TokenNotFound();
        data = _voucherData[tokenId];
        owner = _owners[tokenId];
    }

    function isExpired(uint256 tokenId) external view returns (bool) {
        if (!_exists(tokenId)) revert TokenNotFound();
        VoucherData memory data = _voucherData[tokenId];
        if (data.kind == VoucherKind.Single) return false;
        return block.timestamp > uint256(data.issuedAt) + uint256(data.durationSeconds);
    }

    function _durationFor(VoucherKind kind) internal pure returns (uint256) {
        if (kind == VoucherKind.TimeWindow1m) return 60;
        if (kind == VoucherKind.TimeWindow2h) return 2 hours;
        if (kind == VoucherKind.TimeWindow7d) return 7 days;
        return 0;
    }

    function _mint(address to, uint256 tokenId) internal {
        if (_owners[tokenId] != address(0)) revert InvalidOwner();
        _owners[tokenId] = to;
        _balances[to] += 1;
        _addTokenToOwnerEnumeration(to, tokenId);
        emit Transfer(address(0), to, tokenId);
    }

    function _burn(uint256 tokenId) internal {
        address owner = ownerOf(tokenId);
        _approve(address(0), tokenId);
        delete _voucherData[tokenId];
        _balances[owner] -= 1;
        delete _owners[tokenId];
        _removeTokenFromOwnerEnumeration(owner, tokenId);
        emit Transfer(owner, address(0), tokenId);
    }

    function _approve(address to, uint256 tokenId) internal {
        _tokenApprovals[tokenId] = to;
        emit Approval(ownerOf(tokenId), to, tokenId);
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _owners[tokenId] != address(0);
    }

    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address owner = ownerOf(tokenId);
        return (spender == owner || getApproved(tokenId) == spender || isApprovedForAll(owner, spender));
    }

    function _addTokenToOwnerEnumeration(address to, uint256 tokenId) internal {
        _ownedTokensIndex[tokenId] = _ownedTokens[to].length;
        _ownedTokens[to].push(tokenId);
    }

    function _removeTokenFromOwnerEnumeration(address from, uint256 tokenId) internal {
        uint256 lastIndex = _ownedTokens[from].length - 1;
        uint256 tokenIndex = _ownedTokensIndex[tokenId];
        if (tokenIndex != lastIndex) {
            uint256 lastTokenId = _ownedTokens[from][lastIndex];
            _ownedTokens[from][tokenIndex] = lastTokenId;
            _ownedTokensIndex[lastTokenId] = tokenIndex;
        }
        _ownedTokens[from].pop();
        delete _ownedTokensIndex[tokenId];
    }
}

interface IERC721Receiver {
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external returns (bytes4);
}
