const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("RandomNFT", function () {

  async function deployRandomNFTFixture() {

    const RandomNFT = await ethers.getContractFactory("RandomNFT");
    const randomNFT = await RandomNFT.deploy();
    return { randomNFT };
  }

  async function deployRandomNFTWithETHFixture() {

    const RandomNFT = await ethers.getContractFactory("RandomNFT");
    const randomNFT = await RandomNFT.deploy({
      value: ethers.utils.parseEther((0.001).toString())
    });
    return { randomNFT };
  }

  describe("Deployment", function () {

    it("Should set the right owner", async function () {
      const { randomNFT } = await loadFixture(deployRandomNFTFixture);
      const [owner, otherAccount] = await ethers.getSigners();
      expect(await randomNFT.owner()).to.equal(owner.address);
    });
  });


  describe("Withdraw", function () {

    it("Should revert with the right error if balance is zero", async function () {
      const { randomNFT } = await loadFixture(
        deployRandomNFTFixture
      );
      const [owner, otherAccount] = await ethers.getSigners();
      await expect(randomNFT.connect(owner).withdraw()).to.be.revertedWith(
        "Balance is zero"
      );
    });

    it("Should fail when withdraw by non owner account", async function () {

      const { randomNFT } = await loadFixture(
        deployRandomNFTWithETHFixture
      );
      const [owner, otherAccount] = await ethers.getSigners();
      await expect(randomNFT.connect(otherAccount).withdraw()).to.be.reverted;
    });

    it("Shouldn't fail when withdraw", async function () {
      const { randomNFT } = await loadFixture(
        deployRandomNFTWithETHFixture
      );
      const [owner, otherAccount] = await ethers.getSigners();
      await expect(randomNFT.connect(owner).withdraw()).not.to.be.reverted;
    });
  });

  describe("Mint", function () {

    it("Should revert with the right error if insufficient ETH sent", async function () {

      const { randomNFT } = await loadFixture(
        deployRandomNFTFixture
      );
      const msg = "abc";
      const [owner, otherAccount] = await ethers.getSigners();
      const messageHash = ethers.utils.hashMessage(msg);
      const signature = await owner.signMessage(ethers.utils.arrayify(messageHash));
      await expect(randomNFT.connect(otherAccount).mint(
        msg, messageHash,
        signature, {
        value: ethers.utils.parseEther((0.0001).toString()), gasLimit: 1000000
      })).to.be.revertedWith(
        "Insufficient ETH sent"
      );
    });


    it("Should revert with the right error if already minted", async function () {

      const { randomNFT } = await loadFixture(
        deployRandomNFTFixture
      );
      const msg = "abc";
      const [owner, otherAccount] = await ethers.getSigners();
      const messageHash = ethers.utils.hashMessage(msg);
      const signature = await owner.signMessage(ethers.utils.arrayify(messageHash));
      await randomNFT.connect(otherAccount).mint(
        msg, messageHash,
        signature, {
        value: ethers.utils.parseEther((0.01).toString()), gasLimit: 1000000
      });
      await expect(randomNFT.connect(otherAccount).mint(
        msg, messageHash,
        signature, {
        value: ethers.utils.parseEther((0.001).toString()), gasLimit: 1000000
      })).to.be.revertedWith(
        "Already minted"
      );
    });

    it("Should revert with the right error if invalid signature", async function () {

      const { randomNFT } = await loadFixture(
        deployRandomNFTFixture
      );
      const msg = "abc";
      const [owner, otherAccount] = await ethers.getSigners();
      const messageHash = ethers.utils.hashMessage(msg);
      const signature = await otherAccount.signMessage(ethers.utils.arrayify(messageHash));
      await expect(randomNFT.connect(otherAccount).mint(
        msg, messageHash,
        signature, {
        value: ethers.utils.parseEther((0.001).toString()), gasLimit: 1000000
      })).to.be.revertedWith(
        "Invalid signature"
      );
    });

    it("Shouldn't fail when mint", async function () {

      const { randomNFT } = await loadFixture(
        deployRandomNFTFixture
      );
      const msg = "abc";
      const [owner, otherAccount] = await ethers.getSigners();
      const messageHash = ethers.utils.hashMessage(msg);
      const signature = await owner.signMessage(ethers.utils.arrayify(messageHash));
      await expect(randomNFT.connect(otherAccount).mint(
        msg, messageHash,
        signature, {
        value: ethers.utils.parseEther((0.001).toString()), gasLimit: 1000000
      })).not.to.be.reverted;
    });
  });
});
