const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NftCollection", function () {
  let contract, owner, addr1, addr2;
  const NAME = "Test NFT";
  const SYMBOL = "TNFT";
  const MAX_SUPPLY = 100;
  const BASE_URI = "https://example.com/metadata/";

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const NftCollection = await ethers.getContractFactory("NftCollection");
    contract = await NftCollection.deploy(NAME, SYMBOL, MAX_SUPPLY, BASE_URI);
  });

  describe("Initialization", function () {
    it("Should set the correct name", async function () {
      expect(await contract.name()).to.equal(NAME);
    });

    it("Should set the correct symbol", async function () {
      expect(await contract.symbol()).to.equal(SYMBOL);
    });

    it("Should set the correct max supply", async function () {
      expect(await contract.maxSupply()).to.equal(MAX_SUPPLY);
    });

    it("Should set admin to contract creator", async function () {
      expect(await contract.admin()).to.equal(owner.address);
    });

    it("Should initialize totalSupply to 0", async function () {
      expect(await contract.totalSupply()).to.equal(0);
    });

    it("Should initialize minting as not paused", async function () {
      expect(await contract.mintingPaused()).to.equal(false);
    });
  });

  describe("Minting", function () {
    it("Should mint a token", async function () {
      await contract.mint(addr1.address, 1);
      expect(await contract.ownerOf(1)).to.equal(addr1.address);
    });

    it("Should increase balance after minting", async function () {
      await contract.mint(addr1.address, 1);
      expect(await contract.balanceOf(addr1.address)).to.equal(1);
    });

    it("Should increase total supply", async function () {
      await contract.mint(addr1.address, 1);
      expect(await contract.totalSupply()).to.equal(1);
    });

    it("Should emit Transfer event on mint", async function () {
      await expect(contract.mint(addr1.address, 1))
        .to.emit(contract, "Transfer")
        .withArgs(ethers.ZeroAddress, addr1.address, 1);
    });

    it("Should revert if not admin", async function () {
      await expect(contract.connect(addr1).mint(addr1.address, 1)).to.be.revertedWith(
        "Only admin can call this"
      );
    });

    it("Should revert if minting is paused", async function () {
      await contract.pauseMinting();
      await expect(contract.mint(addr1.address, 1)).to.be.revertedWith("Minting is paused");
    });

    it("Should revert if minting to zero address", async function () {
      await expect(contract.mint(ethers.ZeroAddress, 1)).to.be.revertedWith(
        "Cannot mint to zero address"
      );
    });

    it("Should revert if token already exists", async function () {
      await contract.mint(addr1.address, 1);
      await expect(contract.mint(addr1.address, 1)).to.be.revertedWith("Token already exists");
    });

    it("Should revert if max supply reached", async function () {
      for (let i = 1; i <= MAX_SUPPLY; i++) {
        await contract.mint(addr1.address, i);
      }
      await expect(contract.mint(addr1.address, MAX_SUPPLY + 1)).to.be.revertedWith(
        "Max supply reached"
      );
    });
  });

  describe("Transfers", function () {
    beforeEach(async function () {
      await contract.mint(addr1.address, 1);
    });

    it("Should transfer a token", async function () {
      await contract.connect(addr1).transferFrom(addr1.address, addr2.address, 1);
      expect(await contract.ownerOf(1)).to.equal(addr2.address);
    });

    it("Should update balances after transfer", async function () {
      await contract.connect(addr1).transferFrom(addr1.address, addr2.address, 1);
      expect(await contract.balanceOf(addr1.address)).to.equal(0);
      expect(await contract.balanceOf(addr2.address)).to.equal(1);
    });

    it("Should emit Transfer event", async function () {
      await expect(contract.connect(addr1).transferFrom(addr1.address, addr2.address, 1))
        .to.emit(contract, "Transfer")
        .withArgs(addr1.address, addr2.address, 1);
    });

    it("Should revert if not authorized", async function () {
      await expect(
        contract.connect(addr2).transferFrom(addr1.address, addr2.address, 1)
      ).to.be.revertedWith("Not authorized");
    });

    it("Should revert if token does not exist", async function () {
      await expect(
        contract.connect(addr1).transferFrom(addr1.address, addr2.address, 999)
      ).to.be.revertedWith("Token does not exist");
    });
  });

  describe("Approvals", function () {
    beforeEach(async function () {
      await contract.mint(addr1.address, 1);
    });

    it("Should approve a token", async function () {
      await contract.connect(addr1).approve(addr2.address, 1);
      expect(await contract.getApproved(1)).to.equal(addr2.address);
    });

    it("Should emit Approval event", async function () {
      await expect(contract.connect(addr1).approve(addr2.address, 1))
        .to.emit(contract, "Approval")
        .withArgs(addr1.address, addr2.address, 1);
    });

    it("Should allow approved address to transfer", async function () {
      await contract.connect(addr1).approve(addr2.address, 1);
      await contract.connect(addr2).transferFrom(addr1.address, addr2.address, 1);
      expect(await contract.ownerOf(1)).to.equal(addr2.address);
    });

    it("Should clear approval after transfer", async function () {
      await contract.connect(addr1).approve(addr2.address, 1);
      await contract.connect(addr2).transferFrom(addr1.address, addr2.address, 1);
      expect(await contract.getApproved(1)).to.equal(ethers.ZeroAddress);
    });
  });

  describe("Operator Approvals", function () {
    beforeEach(async function () {
      await contract.mint(addr1.address, 1);
      await contract.mint(addr1.address, 2);
    });

    it("Should set operator approval", async function () {
      await contract.connect(addr1).setApprovalForAll(addr2.address, true);
      expect(await contract.isApprovedForAll(addr1.address, addr2.address)).to.equal(true);
    });

    it("Should emit ApprovalForAll event", async function () {
      await expect(contract.connect(addr1).setApprovalForAll(addr2.address, true))
        .to.emit(contract, "ApprovalForAll")
        .withArgs(addr1.address, addr2.address, true);
    });

    it("Should allow operator to transfer multiple tokens", async function () {
      await contract.connect(addr1).setApprovalForAll(addr2.address, true);
      await contract.connect(addr2).transferFrom(addr1.address, addr2.address, 1);
      await contract.connect(addr2).transferFrom(addr1.address, addr2.address, 2);
      expect(await contract.balanceOf(addr1.address)).to.equal(0);
      expect(await contract.balanceOf(addr2.address)).to.equal(2);
    });

    it("Should revoke operator approval", async function () {
      await contract.connect(addr1).setApprovalForAll(addr2.address, true);
      await contract.connect(addr1).setApprovalForAll(addr2.address, false);
      expect(await contract.isApprovedForAll(addr1.address, addr2.address)).to.equal(false);
    });
  });

  describe("Metadata", function () {
    beforeEach(async function () {
      await contract.mint(addr1.address, 1);
    });

    it("Should return correct token URI with base URI", async function () {
      const uri = await contract.tokenURI(1);
      expect(uri).to.equal(BASE_URI + "1");
    });

    it("Should revert for non-existent token", async function () {
      await expect(contract.tokenURI(999)).to.be.revertedWith("Token does not exist");
    });

    it("Should set custom token URI", async function () {
      const customUri = "https://example.com/custom/1";
      await contract.setTokenURI(1, customUri);
      expect(await contract.tokenURI(1)).to.equal(customUri);
    });
  });

  describe("Pause/Unpause", function () {
    it("Should pause minting", async function () {
      await contract.pauseMinting();
      expect(await contract.mintingPaused()).to.equal(true);
    });

    it("Should unpause minting", async function () {
      await contract.pauseMinting();
      await contract.unpauseMinting();
      expect(await contract.mintingPaused()).to.equal(false);
    });

    it("Should allow minting when unpaused", async function () {
      await contract.pauseMinting();
      await contract.unpauseMinting();
      await contract.mint(addr1.address, 1);
      expect(await contract.ownerOf(1)).to.equal(addr1.address);
    });
  });

  describe("Balance Checks", function () {
    it("Should return 0 for new account", async function () {
      expect(await contract.balanceOf(addr1.address)).to.equal(0);
    });

    it("Should handle multiple mints correctly", async function () {
      await contract.mint(addr1.address, 1);
      await contract.mint(addr1.address, 2);
      await contract.mint(addr1.address, 3);
      expect(await contract.balanceOf(addr1.address)).to.equal(3);
    });
  });
});
