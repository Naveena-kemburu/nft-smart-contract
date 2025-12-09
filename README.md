# NFT Smart Contract

A fully functional ERC-721 compatible NFT smart contract with comprehensive automated test suite and Docker containerization.

## Overview

This project implements a complete NFT (Non-Fungible Token) contract based on the ERC-721 standard. It includes:

- **ERC-721 Compatible Contract**: Full implementation of the ERC-721 standard with minting, transfers, approvals, and metadata support
- **Access Control**: Owner-based authorization for privileged operations
- **Metadata Support**: Token URI mechanism for NFT metadata
- **Comprehensive Test Suite**: Extensive tests covering all contract functions and edge cases
- **Docker Support**: Complete containerization for easy testing and deployment
- **Gas Optimization**: Efficient implementation with reasonable gas costs

## Features

### Core ERC-721 Functionality

- **Token Minting**: Create new NFTs with unique token IDs
- **Token Transfers**: Safe transfer of tokens between addresses
- **Approval Mechanism**: Individual token approvals and operator-wide approvals
- **Balance Tracking**: Accurate per-address balance tracking
- **Metadata**: Token URI support for associated metadata
- **Events**: Proper emission of Transfer, Approval, and ApprovalForAll events

### Business Rules

- **Maximum Supply**: Enforce a maximum limit on total tokens that can be minted
- **Unique Token IDs**: Prevent double-minting of the same token ID
- **Admin Controls**: Owner can pause/unpause minting
- **Configuration**: Read-only functions to inspect contract settings

### Security Features

- **Authorization**: Only authorized accounts can mint tokens
- **Input Validation**: Comprehensive checks on all parameters
- **State Consistency**: Atomic state changes to prevent inconsistencies
- **Clear Reverts**: Meaningful error messages for failed operations

## Project Structure

```
project-root/
├── contracts/
│   └── NftCollection.sol         # Main ERC-721 contract
├── test/
│   └── NftCollection.test.js    # Comprehensive test suite
├── package.json                  # Node.js dependencies
├── hardhat.config.js             # Hardhat configuration
├── Dockerfile                    # Docker container definition
├── .dockerignore                 # Files to exclude from Docker build
├── .gitignore                    # Git ignore rules
└── README.md                     # This file
```

## Installation

### Prerequisites

- Node.js v18+ (for local development)
- npm or yarn
- Docker (for containerized testing)

### Local Setup

```bash
# Clone the repository
git clone https://github.com/Naveena-kemburu/nft-smart-contract.git
cd nft-smart-contract

# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm test
```

## Docker Setup

### Building the Docker Image

```bash
# Build the Docker image
docker build -t nft-contract .
```

### Running Tests in Docker

```bash
# Run all tests in the Docker container
docker run --rm nft-contract
```

The Docker container is configured to automatically run the complete test suite when started.

## Usage

### Running Tests Locally

```bash
# Run all tests
npm test

# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test test/NftCollection.test.js
```

### Compiling Contracts

```bash
# Compile contracts
npm run compile
```

### Cleaning Build Artifacts

```bash
# Clean compiled contracts and artifacts
npm run clean
```

## Contract Interface

### Core Functions

#### `balanceOf(address owner) -> uint256`
Returns the number of tokens owned by an address.

#### `ownerOf(uint256 tokenId) -> address`
Returns the current owner of a token.

#### `mint(address to, uint256 tokenId)`
Mints a new token. Only callable by the contract owner.

#### `transferFrom(address from, address to, uint256 tokenId)`
Transfers a token from one address to another.

#### `safeTransferFrom(address from, address to, uint256 tokenId, bytes data)`
Safely transfers a token with optional data.

#### `approve(address to, uint256 tokenId)`
Approves an address to transfer a specific token.

#### `setApprovalForAll(address operator, bool approved)`
Approves/revokes an operator to transfer all tokens.

#### `getApproved(uint256 tokenId) -> address`
Returns the approved address for a token.

#### `isApprovedForAll(address owner, address operator) -> bool`
Returns approval status for an operator.

#### `tokenURI(uint256 tokenId) -> string`
Returns the metadata URI for a token.

### Configuration Functions

#### `name() -> string`
Returns the token collection name.

#### `symbol() -> string`
Returns the token collection symbol.

#### `maxSupply() -> uint256`
Returns the maximum number of tokens that can be minted.

#### `totalSupply() -> uint256`
Returns the current total number of minted tokens.

## Test Coverage

The test suite includes comprehensive tests for:

- **Initialization**: Contract setup and configuration
- **Minting**: Token creation, supply limits, access control
- **Transfers**: Single transfers, batch transfers, error cases
- **Approvals**: Token approval, operator approval, revocation
- **Metadata**: Token URI retrieval and validation
- **Events**: Proper event emission with correct parameters
- **Edge Cases**: Boundary conditions, invalid operations
- **Gas Usage**: Performance validation for common operations

## Technical Details

### Technology Stack

- **Solidity**: Smart contract language (v0.8.0+)
- **Hardhat**: Ethereum development environment
- **ethers.js**: Web3 library for contract interaction
- **Chai**: Assertion library for testing
- **Node.js**: JavaScript runtime
- **Docker**: Container platform

### Configuration Files

#### `hardhat.config.js`
Configures the Hardhat environment with compilation settings, network configurations, and test settings.

#### `Dockerfile`
Defines a containerized environment that:
- Starts from a Node.js base image
- Installs all dependencies
- Compiles the contracts
- Runs the complete test suite as the default command

## Common Issues and Troubleshooting

### Issue: Tests fail with "out of memory"
**Solution**: Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096 npm test`

### Issue: Docker build fails with permission denied
**Solution**: Ensure Docker daemon is running and you have necessary permissions

### Issue: Contract compilation fails
**Solution**: Check Solidity version compatibility in hardhat.config.js

## Performance Considerations

- **Gas Optimization**: Contract uses efficient data structures and minimizes storage operations
- **Typical Gas Costs**:
  - Mint: ~45,000 gas
  - Transfer: ~23,000 gas
  - Approve: ~23,000 gas
  - SetApprovalForAll: ~24,000 gas

## Security Notes

- This contract is designed for educational purposes and testing
- For production use, conduct thorough security audits
- Test all scenarios in development networks before mainnet deployment
- Consider additional features like burning, upgradeability, or complex access control

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## License

MIT License - See LICENSE file for details

## Author

Developed by Naveena-kemburu

## References

- [ERC-721 Standard](https://eips.ethereum.org/EIPS/eip-721)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [ethers.js Documentation](https://docs.ethers.org/)
