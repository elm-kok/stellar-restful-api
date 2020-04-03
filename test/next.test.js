const expect = require("chai").expect;
const { CraftSignature } = require("../src/next");

describe("Test CraftSignature", () => {
  it("Craft", () => {
    // arrange
    const HOSPCODE = "09082";
    const CID = "1111111111111";
    const SPK = "GBG4AQJX7CXWAHLKDD2J4CJO222K6TYPA5K5SUHL5FJQ2RXO33L2WNPV";
    const Seq = "2783339140776042";
    // act
    const result = CraftSignature(HOSPCODE, CID, SPK, Seq);
    // assert
    expect(25).to.be.equal(result);
  });
});
