// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract NftCollection {
    string public name;
    string public symbol;
    uint256 public maxSupply;
    uint256 public totalSupply;
    string public baseUri;
    bool public mintingPaused;

    address public admin;

    mapping(uint256 => address) private tokenOwner;
    mapping(address => uint256) private balances;
    mapping(uint256 => address) private tokenApprovals;
    mapping(address => mapping(address => bool)) private operatorApprovals;
    mapping(uint256 => string) private tokenUris;
    mapping(uint256 => bool) private tokenExists;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _maxSupply,
        string memory _baseUri
    ) {
        name = _name;
        symbol = _symbol;
        maxSupply = _maxSupply;
        baseUri = _baseUri;
        admin = msg.sender;
        totalSupply = 0;
        mintingPaused = false;
    }

    function balanceOf(address owner) public view returns (uint256) {
        require(owner != address(0), "Invalid address");
        return balances[owner];
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        require(tokenExists[tokenId], "Token does not exist");
        return tokenOwner[tokenId];
    }

    function mint(address to, uint256 tokenId) public onlyAdmin {
        require(!mintingPaused, "Minting is paused");
        require(to != address(0), "Cannot mint to zero address");
        require(!tokenExists[tokenId], "Token already exists");
        require(totalSupply < maxSupply, "Max supply reached");

        tokenOwner[tokenId] = to;
        balances[to]++;
        tokenExists[tokenId] = true;
        totalSupply++;

        emit Transfer(address(0), to, tokenId);
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public {
        require(tokenExists[tokenId], "Token does not exist");
        require(from == tokenOwner[tokenId], "Invalid sender");
        require(to != address(0), "Cannot transfer to zero address");
        require(
            msg.sender == from || msg.sender == tokenApprovals[tokenId] || operatorApprovals[from][msg.sender],
            "Not authorized"
        );

        balances[from]--;
        balances[to]++;
        tokenOwner[tokenId] = to;
        tokenApprovals[tokenId] = address(0);

        emit Transfer(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public {
        transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public {
        transferFrom(from, to, tokenId);
    }

    function approve(address to, uint256 tokenId) public {
        address owner = tokenOwner[tokenId];
        require(msg.sender == owner || operatorApprovals[owner][msg.sender], "Not authorized");
        tokenApprovals[tokenId] = to;
        emit Approval(owner, to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) public {
        operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function getApproved(uint256 tokenId) public view returns (address) {
        require(tokenExists[tokenId], "Token does not exist");
        return tokenApprovals[tokenId];
    }

    function isApprovedForAll(address owner, address operator) public view returns (bool) {
        return operatorApprovals[owner][operator];
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(tokenExists[tokenId], "Token does not exist");
        if (bytes(tokenUris[tokenId]).length > 0) {
            return tokenUris[tokenId];
        }
        return string(abi.encodePacked(baseUri, uint2str(tokenId)));
    }

    function setTokenURI(uint256 tokenId, string memory uri) public onlyAdmin {
        require(tokenExists[tokenId], "Token does not exist");
        tokenUris[tokenId] = uri;
    }

    function pauseMinting() public onlyAdmin {
        mintingPaused = true;
    }

    function unpauseMinting() public onlyAdmin {
        mintingPaused = false;
    }

    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 len = 0;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}
